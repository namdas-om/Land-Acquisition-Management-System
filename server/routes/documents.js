const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb } = require('../db/init');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = toObjects(db.exec(`SELECT * FROM documents ORDER BY upload_date DESC`));
    const formatted = rows.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      parcelId: d.parcel_id,
      uploadDate: d.upload_date,
      status: d.status,
      fileSize: d.file_size,
      uploadedBy: d.uploaded_by,
      description: d.description,
      filePath: d.file_path
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents - metadata
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const { name, type, parcelId, status = 'Draft', uploadedBy = 'System', description = '' } = req.body;
    const id = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const uploadDate = new Date().toISOString();

    db.run(`INSERT INTO documents (id, name, type, parcel_id, upload_date, status, file_size, uploaded_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, parcelId, uploadDate, status, '2.4 MB', uploadedBy, description]);

    saveDb();
    res.status(201).json({ success: true, id, name, type, parcelId, uploadDate, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/upload - file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const db = await getDb();
    const { type = 'General Document', parcelId = 'PCL-2024-0001', uploadedBy = 'Officer' } = req.body;
    const id = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const uploadDate = new Date().toISOString();
    const fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    db.run(`INSERT INTO documents (id, name, type, parcel_id, upload_date, status, file_size, uploaded_by, description, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.file.originalname, type, parcelId, uploadDate, 'Verified & Signed', fileSize, uploadedBy, 'Uploaded file document', `/uploads/${req.file.filename}`]);

    saveDb();
    res.status(201).json({ success: true, id, name: req.file.originalname, filePath: `/uploads/${req.file.filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM documents WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
