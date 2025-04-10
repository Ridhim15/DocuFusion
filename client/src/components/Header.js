import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <h1>DocuFusion</h1>
        </div>
        <p className="tagline">Merge multiple documents into a single printable PDF</p>
      </div>
    </header>
  );
};

export default Header;