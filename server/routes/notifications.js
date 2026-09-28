const router = require('express').Router();
const { getDb, saveDb } = require('../db/init');

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = toObjects(db.exec(`SELECT * FROM notifications ORDER BY timestamp DESC`));
    const formatted = rows.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp,
      isRead: Boolean(n.is_read),
      priority: n.priority,
      relatedParcelId: n.related_parcel_id,
      actionLabel: n.action_label,
      actionTarget: n.action_target
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`UPDATE notifications SET is_read = 1`);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
