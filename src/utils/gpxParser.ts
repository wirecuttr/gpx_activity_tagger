export interface GPXInfo {
  id: string;
  fileName: string;
  file: File;
  activityDate: string | null;
  duration: string | null;
  currentType: string | null;
  xmlDoc: Document | null;
  comment: string | null;
  status: "pending" | "warning" | "success" | "error";
}

export function parseGPXFile(file: File): Promise<GPXInfo> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const info: GPXInfo = {
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      fileName: file.name,
      file,
      activityDate: null,
      duration: null,
      currentType: null,
      xmlDoc: null,
      comment: null,
      status: "pending",
    };

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");

        // Check for XML parsing errors
        const parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
          info.status = "error";
          info.comment = "Invalid XML format";
          resolve(info);
          return;
        }

        // Validate tracks count
        const trkElements = xmlDoc.querySelectorAll("trk");
        if (trkElements.length === 0) {
          info.status = "warning";
          info.comment = "No track found in GPX file";
          resolve(info);
          return;
        }

        if (trkElements.length > 1) {
          info.status = "warning";
          info.comment = "Warning: Multiple tracks found. File not supported in this version.";
          resolve(info);
          return;
        }

        const trk = trkElements[0];
        info.xmlDoc = xmlDoc;

        // 1. Extract Current Type
        const typeNode = trk.querySelector("type");
        info.currentType = typeNode?.textContent?.trim() || null;

        // 2. Extract Activity Date
        // Try metadata time first
        let timeStr = xmlDoc.querySelector("metadata > time")?.textContent?.trim();
        if (!timeStr) {
          // Fall back to first trackpoint time
          timeStr = xmlDoc.querySelector("trkpt > time")?.textContent?.trim();
        }

        if (timeStr) {
          // Normalize to nice human readable form or keep ISO
          try {
            const date = new Date(timeStr);
            if (!isNaN(date.getTime())) {
              info.activityDate = date.toLocaleString();
            } else {
              info.activityDate = timeStr;
            }
          } catch {
            info.activityDate = timeStr;
          }
        } else {
          info.activityDate = "Unknown Date";
        }

        // 3. Extract Duration (Elapsed Time)
        const trkpts = xmlDoc.querySelectorAll("trkpt");
        if (trkpts.length > 1) {
          const firstTimeStr = trkpts[0].querySelector("time")?.textContent?.trim();
          const lastTimeStr = trkpts[trkpts.length - 1].querySelector("time")?.textContent?.trim();
          if (firstTimeStr && lastTimeStr) {
            try {
              const start = new Date(firstTimeStr);
              const end = new Date(lastTimeStr);
              const diffMs = end.getTime() - start.getTime();
              if (!isNaN(diffMs) && diffMs >= 0) {
                const totalSeconds = Math.floor(diffMs / 1000);
                const hrs = Math.floor(totalSeconds / 3600);
                const mins = Math.floor((totalSeconds % 3600) / 60);
                const secs = totalSeconds % 60;

                if (hrs > 0) {
                  info.duration = `${hrs}h ${mins}m ${secs}s`;
                } else if (mins > 0) {
                  info.duration = `${mins}m ${secs}s`;
                } else {
                  info.duration = `${secs}s`;
                }
              }
            } catch {
              // ignore
            }
          }
        }

        resolve(info);
      } catch (err) {
        info.status = "error";
        info.comment = err instanceof Error ? err.message : "Unknown error parsing file";
        resolve(info);
      }
    };

    reader.onerror = () => {
      info.status = "error";
      info.comment = "Failed to read file from disk";
      resolve(info);
    };

    reader.readAsText(file);
  });
}

export function tagGPXFile(info: GPXInfo, newType: string): string {
  if (!info.xmlDoc) {
    throw new Error("No parsed XML document available");
  }

  const xmlDoc = info.xmlDoc;
  const trk = xmlDoc.querySelector("trk");
  if (!trk) {
    throw new Error("No track element found during modification");
  }

  let typeNode = trk.querySelector("type");
  if (!typeNode) {
    const ns = trk.namespaceURI || "http://www.topografix.com/GPX/1/1";
    typeNode = xmlDoc.createElementNS(ns, "type");
    
    // Attempt to insert after the <name> node if it exists, to maintain standard schema structure
    const nameNode = trk.querySelector("name");
    if (nameNode && nameNode.nextSibling) {
      trk.insertBefore(typeNode, nameNode.nextSibling);
    } else if (nameNode) {
      trk.appendChild(typeNode);
    } else {
      trk.prepend(typeNode);
    }
  }

  typeNode.textContent = newType.trim();

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}
