const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router({ mergeParams: true });

const UPLOAD_DIR = process.env.DATA_PATH
  ? path.join(process.env.DATA_PATH, 'uploads')
  : path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bidDir = path.join(UPLOAD_DIR, req.params.bidId);
    if (!fs.existsSync(bidDir)) fs.mkdirSync(bidDir, { recursive: true });
    cb(null, bidDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/zip',
  'application/x-zip-compressed',
  'application/dwg',
  'application/acad',
  'image/vnd.dwg',
];

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250 MB per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype) || file.originalname.match(/\.(dwg|dxf|rvt|ifc)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

const VALID_CATEGORIES = ['plans', 'specs', 'scope', 'addendum', 'other'];

// List documents for a bid
router.get('/', (req, res) => {
  const bid = db.prepare('SELECT id FROM bids WHERE id = ?').get(req.params.bidId);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });

  const docs = db.prepare(
    'SELECT * FROM documents WHERE bid_id = ? ORDER BY category, uploaded_at DESC'
  ).all(req.params.bidId);
  res.json(docs);
});

// Upload documents to a bid
router.post('/', upload.array('files', 20), (req, res) => {
  const bid = db.prepare('SELECT id FROM bids WHERE id = ?').get(req.params.bidId);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const category = VALID_CATEGORIES.includes(req.body.category) ? req.body.category : 'other';

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, bid_id, original_name, stored_name, file_size, mime_type, category)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const inserted = db.transaction(() => {
    return req.files.map(file => {
      const id = uuidv4();
      insertDoc.run(id, req.params.bidId, file.originalname, file.filename, file.size, file.mimetype, category);
      return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
    });
  })();

  res.status(201).json(inserted);
});

// Update document category
router.patch('/:docId', (req, res) => {
  const doc = db.prepare(
    'SELECT * FROM documents WHERE id = ? AND bid_id = ?'
  ).get(req.params.docId, req.params.bidId);

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const { category } = req.body;
  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (category) {
    db.prepare('UPDATE documents SET category = ? WHERE id = ?').run(category, req.params.docId);
  }

  res.json(db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.docId));
});

// Delete a document
router.delete('/:docId', (req, res) => {
  const doc = db.prepare(
    'SELECT * FROM documents WHERE id = ? AND bid_id = ?'
  ).get(req.params.docId, req.params.bidId);

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const filePath = path.join(UPLOAD_DIR, req.params.bidId, doc.stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.docId);
  res.json({ message: 'Document deleted' });
});

// Download a document
router.get('/:docId/download', (req, res) => {
  const doc = db.prepare(
    'SELECT * FROM documents WHERE id = ? AND bid_id = ?'
  ).get(req.params.docId, req.params.bidId);

  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const filePath = path.join(UPLOAD_DIR, req.params.bidId, doc.stored_name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });

  res.download(filePath, doc.original_name);
});

module.exports = router;
