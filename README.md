# VBP Estimator – Bid Document Portal

A web tool for commercial painting estimators to manage bid invites from General Contractors and organize project documents (plans, specs, scope, addendums, etc.).

## Features

- **Bid Invite Management** – Create a bid invite per GC invite with project details and due date
- **Drag & Drop Document Upload** – Drop plans, specs, scope, addendums, and other files directly onto the bid
- **Document Categorization** – Tag each document as Plans / Specs / Scope / Addendum / Other; change category anytime
- **Status Tracking** – Track each bid through Pending → In Review → Submitted → Awarded/Lost/No Bid
- **Download & Delete** – Download any file or remove it from the bid
- **Urgent Due Date Alerts** – Bids due within 3 days are highlighted

## Supported File Types

PDF, Word (.doc/.docx), Excel (.xls/.xlsx), Images (JPEG/PNG/TIFF), ZIP, CAD files (DWG/DXF) — up to 250 MB per file, up to 20 files per upload.

## Quick Start

### Prerequisites
- Node.js 18+

### Install dependencies
```bash
npm run install:all
```

### Run in development

In two terminals:

```bash
# Terminal 1 – backend API (port 3001)
npm run dev:backend

# Terminal 2 – frontend (port 3000)
npm run dev:frontend
```

Then open http://localhost:3000

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry
│   │   ├── db.js             # SQLite database setup
│   │   └── routes/
│   │       ├── bids.js       # Bid CRUD routes
│   │       └── documents.js  # Document upload/download routes
│   ├── data/                 # SQLite database (gitignored)
│   └── uploads/              # Uploaded files (gitignored)
└── frontend/
    └── src/
        ├── api/              # Axios API client
        ├── components/       # Reusable UI components
        ├── pages/            # Dashboard & BidDetail pages
        └── types/            # TypeScript types
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bids` | List all bids |
| POST | `/api/bids` | Create bid invite |
| GET | `/api/bids/:id` | Get bid with documents |
| PATCH | `/api/bids/:id` | Update bid status/details |
| DELETE | `/api/bids/:id` | Delete bid and documents |
| GET | `/api/bids/:id/documents` | List documents |
| POST | `/api/bids/:id/documents` | Upload documents |
| PATCH | `/api/bids/:id/documents/:docId` | Update document category |
| DELETE | `/api/bids/:id/documents/:docId` | Delete document |
| GET | `/api/bids/:id/documents/:docId/download` | Download file |
