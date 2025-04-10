# DocuFusion

A modern web application that allows users to merge multiple documents into a single PDF with optimized print formatting.

## Features

- Drag and drop interface for uploading documents
- Support for various document formats (PDF, DOCX, JPG, PNG)
- Merge multiple documents into a single PDF
- Auto-resize for optimal printing
- Preview documents before merging
- Download merged PDF

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Ridhim15/DocuFusion.git
   cd DocuFusion
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Drag and drop documents into the designated area or click to browse files
2. Arrange documents in the desired order
3. Click "Merge Documents" to combine them into a single PDF
4. Preview the merged document
5. Download the merged PDF

## Technologies Used

- Frontend: HTML, CSS, JavaScript, React
- Backend: Node.js, Express
- PDF Processing: pdf-lib
- File Upload: react-dropzone

## License

MIT