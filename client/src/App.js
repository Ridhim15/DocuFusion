import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';
import FileItem from './components/FileItem';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    // Check file types
    const validFiles = acceptedFiles.filter(file => {
      const isValid = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      if (!isValid) {
        toast.error(`${file.name} is not a supported file type`);
      }
      return isValid;
    });

    // Add new files to the list with preview URLs
    const newFiles = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: `file-${Date.now()}-${file.name}`
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // Remove file
  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  // Reorder files after drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  // Merge documents
  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 files to merge');
      return;
    }

    setIsLoading(true);
    setDownloadLink('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add file order
      formData.append('order', JSON.stringify(files.map(file => file.name)));

      const response = await axios.post('/api/merge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Documents merged successfully!');
        setDownloadLink(response.data.file);
      } else {
        toast.error('Failed to merge documents');
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      console.error('Error merging documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download merged file
  const handleDownload = () => {
    if (downloadLink) {
      window.location.href = downloadLink;
    }
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    setDownloadLink('');
  };

  return (
    <div className="app">
      <Header />
      
      <main className="container">
        <section className="upload-section">
          <h2>Upload Documents</h2>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the documents here...</p>
            ) : (
              <div className="dropzone-content">
                <p>Drag & drop documents here, or click to select files</p>
                <p className="dropzone-hint">Supported formats: PDF, DOCX, JPG, PNG</p>
              </div>
            )}
          </div>
        </section>

        {files.length > 0 && (
          <section className="files-section">
            <div className="files-header">
              <h2>Document List ({files.length})</h2>
              <div className="files-actions">
                <button onClick={clearFiles} className="btn btn-secondary">
                  Clear All
                </button>
                <button 
                  onClick={handleMerge} 
                  className="btn" 
                  disabled={isLoading || files.length < 2}
                >
                  {isLoading ? 'Merging...' : 'Merge Documents'}
                </button>
              </div>
            </div>
            
            <p className="drag-instruction">
              Drag and drop to reorder documents. They will be merged in this sequence.
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="documents">
                {(provided) => (
                  <ul
                    className="files-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {files.map((file, index) => (
                      <Draggable
                        key={file.id}
                        draggableId={file.id}
                        index={index}
                      >
                        {(provided) => (
                          <FileItem
                            file={file}
                            index={index}
                            removeFile={removeFile}
                            provided={provided}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </section>
        )}

        {downloadLink && (
          <section className="download-section">
            <h2>Your documents have been merged!</h2>
            <p>The merged PDF is optimized for printing.</p>
            <button onClick={handleDownload} className="btn download-btn">
              Download Merged PDF
            </button>
          </section>
        )}
      </main>

      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;