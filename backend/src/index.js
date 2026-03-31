const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const bidsRouter = require('./routes/bids');
const documentsRouter = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve built frontend if it exists
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

app.use('/api/bids', bidsRouter);
app.use('/api/bids/:bidId/documents', documentsRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend for all non-API routes (SPA fallback)
if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 250 MB.' });
  }
  if (err.message && err.message.startsWith('File type not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`VBP Estimator backend running on http://localhost:${PORT}`);
});
