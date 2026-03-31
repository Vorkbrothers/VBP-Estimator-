const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// List all bids
router.get('/', (req, res) => {
  const bids = db.prepare(`
    SELECT b.*, COUNT(d.id) as document_count
    FROM bids b
    LEFT JOIN documents d ON b.id = d.bid_id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bids);
});

// Get single bid with documents
router.get('/:id', (req, res) => {
  const bid = db.prepare('SELECT * FROM bids WHERE id = ?').get(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });

  const documents = db.prepare(
    'SELECT * FROM documents WHERE bid_id = ? ORDER BY uploaded_at DESC'
  ).all(req.params.id);

  res.json({ ...bid, documents });
});

// Create new bid invite
router.post('/', (req, res) => {
  const { project_name, general_contractor, project_address, bid_due_date, notes } = req.body;

  if (!project_name || !general_contractor) {
    return res.status(400).json({ error: 'project_name and general_contractor are required' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO bids (id, project_name, general_contractor, project_address, bid_due_date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, project_name, general_contractor, project_address || null, bid_due_date || null, notes || null);

  const bid = db.prepare('SELECT * FROM bids WHERE id = ?').get(id);
  res.status(201).json(bid);
});

// Update bid status or details
router.patch('/:id', (req, res) => {
  const bid = db.prepare('SELECT * FROM bids WHERE id = ?').get(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });

  const allowed = ['project_name', 'general_contractor', 'project_address', 'bid_due_date', 'status', 'notes'];
  const updates = Object.entries(req.body)
    .filter(([k]) => allowed.includes(k))
    .map(([k, v]) => ({ key: k, val: v }));

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClause = updates.map(u => `${u.key} = ?`).join(', ');
  const values = updates.map(u => u.val);
  db.prepare(`UPDATE bids SET ${setClause} WHERE id = ?`).run(...values, req.params.id);

  res.json(db.prepare('SELECT * FROM bids WHERE id = ?').get(req.params.id));
});

// Delete bid
router.delete('/:id', (req, res) => {
  const bid = db.prepare('SELECT * FROM bids WHERE id = ?').get(req.params.id);
  if (!bid) return res.status(404).json({ error: 'Bid not found' });

  db.prepare('DELETE FROM bids WHERE id = ?').run(req.params.id);
  res.json({ message: 'Bid deleted' });
});

module.exports = router;
