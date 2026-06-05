# GPX Activity Tagger

**Live Application:** [https://wirecuttr.github.io/gpx_activity_tagger/](https://wirecuttr.github.io/gpx_activity_tagger/)

A private, client-side web application designed to append or modify the activity `<type>` tag in GPX workout files. This ensures workouts are correctly categorized when imported into fitness tracking platforms like Strava, Garmin Connect, and Fit Dashboard.

All processing is performed entirely in-memory within your web browser. No files are uploaded to any server, keeping your workout location data completely secure.

## Features

- **Local & Private:** File parsing and tagging occur strictly in the browser.
- **Single/Batch Operations:** 
  - Tag a single GPX file and download it directly.
  - Tag multiple GPX files concurrently and download them in a single `.zip` archive.
- **Queue Management:** View loaded files, track-point counts, parsed dates, durations, current activity type, and status before processing.
- **Custom Tags:** Type in any target activity/sport name to apply to selected files.

## Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Bundler:** Vite
- **Libraries:**
  - `jszip` for client-side ZIP archive packaging
- **Deployment:** GitHub Pages (via GitHub Actions)

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wirecuttr/gpx_activity_tagger.git
   cd gpx_activity_tagger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the local development server:
```bash
npm run dev
```

### Production Build

Build the static production files (output in `./dist`):
```bash
npm run build
```

## AI Collaboration & Acknowledgment

This application was developed and maintained with the assistance of **Antigravity**, an AI coding assistant designed by the Google DeepMind team.
