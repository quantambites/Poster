import React, { useState, useRef } from "react";
import "./drag&drop.css"
const DragDropFiles = ({ handleUpload }) => {
  const [file, setFile] = useState(null);
  const inputRef = useRef();

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  

  return (
    <>
      <div
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <h1>Drag and Drop File to Upload</h1>
        <h1>Or</h1>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0])}
          hidden
          accept="image/png, image/jpeg"
          ref={inputRef}
        />
        <button className="cse" onClick={() => inputRef.current.click()}>Select File</button>
      </div>

      {file && (
        <div className="uploads">
          <ul>
            <li>{file.name}</li>
          </ul>
          <div className="actions">
            <button className="cse upload-button" onClick={() => handleUpload(file)}>Upload</button>
            <button className="cse cancel-button" onClick={() => setFile(null)}>Cancel</button>
           
          </div>
        </div>
      )}
    </>
  );
};

export default DragDropFiles;
