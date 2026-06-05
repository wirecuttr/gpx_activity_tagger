import React, { useState } from "react";
import { DropZone } from "./components/DropZone";
import { ActivityTable } from "./components/ActivityTable";
import { UpdateControl } from "./components/UpdateControl";
import { BuildStamp } from "./components/BuildStamp";
import { GPXInfo, parseGPXFile, tagGPXFile } from "./utils/gpxParser";
import JSZip from "jszip";

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 30000);
};

export const App: React.FC = () => {
  const [files, setFiles] = useState<GPXInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setStatusMessage(null);
    const parsedPromises = newFiles.map((f) => parseGPXFile(f));
    const parsedInfos = await Promise.all(parsedPromises);

    // Filter out duplicates (based on file name and date) to keep the list clean
    setFiles((prev) => {
      const existingNames = new Set(prev.map((item) => item.fileName));
      const filteredNew = parsedInfos.filter((item) => !existingNames.has(item.fileName));
      return [...prev, ...filteredNew];
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearList = () => {
    setFiles([]);
    setStatusMessage(null);
  };

  const handleUpdate = async (newType: string) => {
    const validFiles = files.filter((f) => f.status === "pending" && f.xmlDoc !== null);
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (validFiles.length === 1) {
        // 1. Single file output: direct GPX file download
        const targetFile = validFiles[0];
        const gpxContent = tagGPXFile(targetFile, newType);

        const blob = new Blob([gpxContent], { type: "application/gpx+xml;charset=utf-8" });
        // Strip .gpx from name and append _tagged.gpx
        const baseName = targetFile.fileName.replace(/\.gpx$/i, "");
        downloadBlob(blob, `${baseName}_tagged.gpx`);

        setFiles((prev) =>
          prev.map((f) => (f.id === targetFile.id ? { ...f, status: "success", currentType: newType.trim() } : f))
        );
        setStatusMessage({ text: "GPX file tagged and downloaded successfully!", type: "success" });
      } else {
        // 2. Multiple files output: create JSZip and download ZIP archive
        const zip = new JSZip();

        validFiles.forEach((item) => {
          const gpxContent = tagGPXFile(item, newType);
          const baseName = item.fileName.replace(/\.gpx$/i, "");
          zip.file(`${baseName}_tagged.gpx`, gpxContent);
        });

        const zipBlob = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
        downloadBlob(zipBlob, "tagged_gpx_activities.zip");

        const validIds = new Set(validFiles.map((f) => f.id));
        setFiles((prev) =>
          prev.map((f) => (validIds.has(f.id) ? { ...f, status: "success", currentType: newType.trim() } : f))
        );
        setStatusMessage({
          text: `Successfully tagged ${validFiles.length} file(s) and downloaded ZIP archive!`,
          type: "success",
        });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : "An error occurred while tag processing.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validFilesCount = files.filter((f) => f.status === "pending" && f.xmlDoc !== null).length;

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              color: "var(--accent)",
              filter: "drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))",
              flexShrink: 0
            }}
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <text
              x="50%"
              y="63%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="6"
              fontWeight="800"
              fill="currentColor"
              stroke="none"
              fontFamily="var(--font-sans)"
              letterSpacing="-0.03em"
            >
              GPX
            </text>
          </svg>
          <div className="app-title-group">
            <h1>GPX activity tagger</h1>
            <p>Quickly append or modify the activity &lt;type&gt; tag in your workout GPX files.</p>
          </div>
        </div>
        <div className="header-actions">
          <a
            href="https://github.com/wirecuttr/gpx_activity_tagger"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            GitHub
          </a>
          <a
            href="https://ko-fi.com/R8O220TSBC"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <img
              height="36"
              style={{ border: "0px", height: "36px" }}
              src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>
        </div>
      </header>

      {statusMessage && (
        <div
          className={`card`}
          style={{
            borderColor: statusMessage.type === "success" ? "var(--accent)" : "var(--error)",
            backgroundColor: statusMessage.type === "success" ? "var(--accent-transparent)" : "var(--error-transparent)",
            padding: "1rem 1.25rem",
            fontSize: "0.95rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
            <span style={{ color: statusMessage.type === "success" ? "var(--accent)" : "var(--error)" }}>
              {statusMessage.text}
            </span>
          </div>
        </div>
      )}

      <div className="card" style={{ gap: "1rem" }}>
        <h2 className="card-title">About GPX activity tagger</h2>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p>
            This tool allows you to batch-update the activity type tag (e.g., <code>road_biking</code>, <code>running</code>, <code>walking</code>) in your GPX workout files so that they are correctly categorized when imported into fitness tracking platforms like Strava, Garmin Connect, Fit Dashboard, etc.
          </p>
          <div style={{ borderLeft: "3px solid var(--warning)", paddingLeft: "1rem", margin: "0.5rem 0", color: "var(--text-primary)" }}>
            <strong>🔒 Safe & Private:</strong>
            <p>
              All file processing is performed entirely in-memory within your web browser.<br />
              No files are uploaded to any server, and your original local files remain completely unmodified.
            </p>
          </div>
          <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginTop: "0.5rem" }}>How to use:</h3>
          <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <li>Drag & drop your GPX files or select a folder in the area below.</li>
            <li>Review the loaded files, their dates, and any pre-existing activity tags.</li>
            <li>Enter (i.e. type) your target activity type/sport name in the text input box.</li>
            <li>Click the download button. You will receive either a direct GPX file (for single files) or a packaged ZIP file (for batch files) containing your newly tagged activities.</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Load activities</h2>
        <DropZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h2 className="card-title">Loaded GPX queue ({files.length})</h2>
          {files.length > 0 && (
            <button type="button" className="btn-cancel" onClick={handleClearList} disabled={isProcessing}>
              Clear All
            </button>
          )}
        </div>

        <UpdateControl
          filesCount={files.length}
          validFilesCount={validFilesCount}
          onUpdate={handleUpdate}
          disabled={isProcessing}
        />

        <ActivityTable files={files} onRemove={handleRemoveFile} />
      </div>
      <BuildStamp />
    </div>
  );
};

export default App;
