import React from 'react';
import './FileItem.css';

const FileItem = ({ file, index, removeFile, provided }) => {
  // Function to get file icon based on type
  const getFileIcon = () => {
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return '\ud83d\udcc4'; // PDF icon
    } else if (fileType.startsWith('image/')) {
      return '\ud83d\uddbc\ufe0f'; // Image icon
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return '\ud83d\udcdd'; // DOCX icon
    }
    return '\ud83d\udcc1'; // Default file icon
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  return (
    <li
      className="file-item"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <div className="file-order">{index + 1}</div>
      
      <div className="file-icon">
        {getFileIcon()}
      </div>
      
      <div className="file-details">
        <div className="file-name">{file.name}</div>
        <div className="file-meta">{formatFileSize(file.size)}</div>
      </div>
      
      <button 
        className="file-remove" 
        onClick={() => removeFile(file.id)}
        aria-label="Remove file"
      >
        &times;
      </button>
    </li>
  );
};

export default FileItem;