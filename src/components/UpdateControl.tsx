import React, { useState } from "react";

interface UpdateControlProps {
  filesCount: number;
  validFilesCount: number;
  onUpdate: (newType: string) => void;
  disabled?: boolean;
}

export const UpdateControl: React.FC<UpdateControlProps> = ({
  filesCount,
  validFilesCount,
  onUpdate,
  disabled,
}) => {
  const [newType, setNewType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim() || validFilesCount === 0 || disabled) return;
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    onUpdate(newType);
  };

  const buttonLabel =
    filesCount === 1 ? "Download tagged GPX" : "Download ZIP of tagged GPX files";

  return (
    <div className="control-panel">
      <form onSubmit={handleSubmit} className="input-group">
        <label htmlFor="activity-type-input">Target activity type / sport</label>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            id="activity-type-input"
            type="text"
            className="type-input"
            placeholder="e.g. road_biking, running, walking"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            disabled={disabled || filesCount === 0}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={disabled || !newType.trim() || validFilesCount === 0}
          >
            {buttonLabel}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm update</h3>
            </div>
            <div className="modal-body">
              <p>
                You are about to tag <strong>{validFilesCount}</strong> GPX file(s) with the activity type:
              </p>
              <div className="modal-highlight">{newType.trim()}</div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                This will process the files in-memory and download the new tagged GPX files directly to your machine. No existing files will be modified on disk.
              </p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleConfirm}>
                Confirm & download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
