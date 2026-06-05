import React from "react";
import { GPXInfo } from "../utils/gpxParser";

interface ActivityTableProps {
  files: GPXInfo[];
  onRemove: (id: string) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ files, onRemove }) => {
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <p>No GPX files loaded. Please select or drop files above.</p>
      </div>
    );
  }

  const getStatusLabel = (status: GPXInfo["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "warning":
        return "Warning";
      case "success":
        return "Updated";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getCommentClass = (status: GPXInfo["status"]) => {
    if (status === "error") return "comment-error";
    if (status === "warning") return "comment-warning";
    return "";
  };

  return (
    <div className="table-container">
      <table className="gpx-table">
        <thead>
          <tr>
            <th>File name</th>
            <th>Activity date</th>
            <th>Duration</th>
            <th>Current type</th>
            <th>Status</th>
            <th>Comments</th>
            <th style={{ width: "80px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((item) => (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>{item.fileName}</td>
              <td>{item.activityDate || "—"}</td>
              <td>{item.duration || "—"}</td>
              <td>
                {item.currentType ? (
                  <code style={{ background: "var(--bg-primary)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                    {item.currentType}
                  </code>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>None</span>
                )}
              </td>
              <td>
                <span className={`badge ${item.status}`}>
                  {getStatusLabel(item.status)}
                </span>
              </td>
              <td className={getCommentClass(item.status)}>
                {item.comment || "—"}
              </td>
              <td style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn-cancel"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
