const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const PDFMerger = require('pdf-merger-js');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
}));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'outputs');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);

// Serve static files from the React app when in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// API route to merge uploaded documents
app.post('/api/merge', async (req, res) => {
  try {
    // Check if files are provided
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const sessionId = uuidv4();
    const sessionDir = path.join(uploadsDir, sessionId);
    fs.ensureDirSync(sessionDir);
    
    const merger = new PDFMerger();
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    
    // Save all files temporarily
    const savedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(sessionDir, file.name);
      await file.mv(filePath);
      
      // If file is not a PDF, conversion would happen here
      // For now, assuming all files are PDFs
      savedFiles.push({
        path: filePath,
        name: file.name
      });
    }

    // Sort files based on desired order if provided
    if (req.body.order) {
      const order = JSON.parse(req.body.order);
      savedFiles.sort((a, b) => {
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    }

    // Add each file to the merger
    for (const file of savedFiles) {
      await merger.add(file.path);
    }

    // Define output file path
    const outputFileName = `merged-${Date.now()}.pdf`;
    const outputFilePath = path.join(outputDir, outputFileName);

    // Save merged PDF
    await merger.save(outputFilePath);
    
    // Optimize PDF for printing (resizing)
    await optimizePdfForPrinting(outputFilePath, outputFilePath);

    // Clean up temporary files
    setTimeout(() => {
      fs.removeSync(sessionDir);
      // Remove output file after some time (e.g., 1 hour)
      setTimeout(() => {
        fs.removeSync(outputFilePath);
      }, 60 * 60 * 1000);
    }, 5 * 60 * 1000); // 5 minutes

    // Send download link
    res.json({
      success: true,
      message: 'Documents merged successfully',
      file: `/api/download/${outputFileName}`
    });
  } catch (error) {
    console.error('Error merging documents:', error);
    res.status(500).json({ message: 'Error processing your request', error: error.message });
  }
});

// Function to optimize PDF for printing
async function optimizePdfForPrinting(inputPath, outputPath) {
  try {
    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get page count
    const pageCount = pdfDoc.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      
      // Get current page dimensions
      const { width, height } = page.getSize();
      
      // Standard print size for A4: 595 x 842 points (8.27 x 11.69 inches at 72 DPI)
      // Check if resizing is needed
      if (width > 595 || height > 842) {
        const scale = Math.min(595 / width, 842 / height);
        page.setSize(width * scale, height * scale);
      }
    }
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, modifiedPdfBytes);
    
    return true;
  } catch (error) {
    console.error('Error optimizing PDF:', error);
    return false;
  }
}

// API route to download merged PDF
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(outputDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Serve static React app (for production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});