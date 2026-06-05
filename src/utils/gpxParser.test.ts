import { parseGPXFile, tagGPXFile } from "./gpxParser";

function createMockGPXFile(name: string, content: string): File {
  return new File([content], name, { type: "application/gpx+xml" });
}

const SINGLE_TRACK_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Test" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <time>2026-06-01T12:00:00Z</time>
  </metadata>
  <trk>
    <name>Morning Run</name>
    <type>running</type>
    <trkseg>
      <trkpt lat="51.0" lon="-114.0">
        <time>2026-06-01T12:00:01Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

const MULTI_TRACK_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Test" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Track 1</name>
  </trk>
  <trk>
    <name>Track 2</name>
  </trk>
</gpx>`;

const NO_TRACK_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Test" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <time>2026-06-01T12:00:00Z</time>
  </metadata>
</gpx>`;

const MISSING_TYPE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Test" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Morning Ride</name>
    <trkseg></trkseg>
  </trk>
</gpx>`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

async function runTests() {
  const results: TestResult[] = [];

  const assert = (condition: boolean, msg: string) => {
    if (!condition) throw new Error(msg);
  };

  // Test Case 1: Single Track File Parsing
  try {
    const file = createMockGPXFile("single.gpx", SINGLE_TRACK_GPX);
    const info = await parseGPXFile(file);

    assert(info.status === "pending", `Expected status pending, got ${info.status}`);
    assert(info.currentType === "running", `Expected type running, got ${info.currentType}`);
    assert(info.comment === null, `Expected no comment, got ${info.comment}`);
    assert(info.activityDate !== null, "Expected date to be parsed");
    results.push({ name: "Single Track GPX parsing", passed: true });
  } catch (err) {
    results.push({ name: "Single Track GPX parsing", passed: false, error: err instanceof Error ? err.message : String(err) });
  }

  // Test Case 2: Multiple Tracks Warning
  try {
    const file = createMockGPXFile("multi.gpx", MULTI_TRACK_GPX);
    const info = await parseGPXFile(file);

    assert(info.status === "warning", `Expected status warning, got ${info.status}`);
    assert(info.comment !== null && info.comment.includes("Multiple tracks found"), `Expected multi-track warning, got ${info.comment}`);
    results.push({ name: "Multiple Tracks warning", passed: true });
  } catch (err) {
    results.push({ name: "Multiple Tracks warning", passed: false, error: err instanceof Error ? err.message : String(err) });
  }

  // Test Case 3: No Tracks Warning
  try {
    const file = createMockGPXFile("notrack.gpx", NO_TRACK_GPX);
    const info = await parseGPXFile(file);

    assert(info.status === "warning", `Expected status warning, got ${info.status}`);
    assert(info.comment === "No track found in GPX file", `Expected no-track warning, got ${info.comment}`);
    results.push({ name: "No Track warning", passed: true });
  } catch (err) {
    results.push({ name: "No Track warning", passed: false, error: err instanceof Error ? err.message : String(err) });
  }

  // Test Case 4: Tag Modification (updating type)
  try {
    const file = createMockGPXFile("single.gpx", SINGLE_TRACK_GPX);
    const info = await parseGPXFile(file);
    const updatedXml = tagGPXFile(info, "cycling");

    assert(updatedXml.includes("<type>cycling</type>"), "Expected type tag updated to cycling");
    assert(!updatedXml.includes("<type>running</type>"), "Expected old running type removed");
    results.push({ name: "Tagging type modification (update)", passed: true });
  } catch (err) {
    results.push({ name: "Tagging type modification (update)", passed: false, error: err instanceof Error ? err.message : String(err) });
  }

  // Test Case 5: Tag Modification (inserting type when missing)
  try {
    const file = createMockGPXFile("missing.gpx", MISSING_TYPE_GPX);
    const info = await parseGPXFile(file);
    const updatedXml = tagGPXFile(info, "walking");

    assert(updatedXml.includes("<type>walking</type>"), "Expected type tag added as walking");
    results.push({ name: "Tagging type modification (insert)", passed: true });
  } catch (err) {
    results.push({ name: "Tagging type modification (insert)", passed: false, error: err instanceof Error ? err.message : String(err) });
  }

  // Render results to DOM
  const container = document.getElementById("test-results");
  if (container) {
    container.innerHTML = "";
    results.forEach((r) => {
      const el = document.createElement("div");
      el.className = `test-case ${r.passed ? "pass" : "fail"}`;
      el.innerHTML = `
        <div class="header">
          <span class="name">${r.name}</span>
          <span class="status ${r.passed ? "pass" : "fail"}">${r.passed ? "Pass" : "Fail"}</span>
        </div>
        ${r.error ? `<pre>${r.error}</pre>` : ""}
      `;
      container.appendChild(el);
    });
  }
}

runTests();
