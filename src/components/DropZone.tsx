import React, { useState, useRef } from "react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const gpxFiles = filesArray.filter((f) => f.name.toLowerCase().endsWith(".gpx"));
      if (gpxFiles.length > 0) {
        onFilesSelected(gpxFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const gpxFiles = filesArray.filter((f) => f.name.toLowerCase().endsWith(".gpx"));
      onFilesSelected(gpxFiles);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerDirSelect = () => {
    dirInputRef.current?.click();
  };

  return (
    <div
      className={`dropzone-container ${isDragActive ? "drag-active" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileSelect}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      {/* webkitdirectory/directory attributes must be casted or set custom in TS */}
      <input
        ref={dirInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="dropzone-info">
        <svg
          className="dropzone-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="dropzone-text">
          <h3>Drag & drop GPX files or folder here</h3>
          <p>Or click to select files or folder from your computer</p>
        </div>
      </div>

      <div className="picker-buttons" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="file-input-btn"
          onClick={triggerFileSelect}
          disabled={disabled}
        >
          Select Files
        </button>
        <button
          type="button"
          className="file-input-btn"
          onClick={triggerDirSelect}
          disabled={disabled}
        >
          Select Folder
        </button>
      </div>
    </div>
  );
};
