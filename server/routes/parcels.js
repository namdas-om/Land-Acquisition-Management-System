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

// GET /api/parcels - List with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, status, stage, state, page = 1, limit = 100 } = req.query;

    let whereClause = [];
    if (search) {
      const s = search.replace(/'/g, "''");
      whereClause.push(`(id LIKE '%${s}%' OR survey_no LIKE '%${s}%' OR village LIKE '%${s}%' OR district LIKE '%${s}%')`);
    }
    if (status) whereClause.push(`status = '${status.replace(/'/g, "''")}'`);
    if (stage) whereClause.push(`current_stage = '${stage.replace(/'/g, "''")}'`);
    if (state) whereClause.push(`state = '${state.replace(/'/g, "''")}'`);

    const whereStr = whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : '';
    const totalResult = db.exec(`SELECT COUNT(*) as count FROM parcels ${whereStr}`);
    const total = totalResult[0].values[0][0];

    const offset = (page - 1) * limit;
    const result = db.exec(`SELECT * FROM parcels ${whereStr} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);
    const parcels = toObjects(result);

    // map DB camel/snake case if needed for frontend compat
    const formatted = parcels.map(p => ({
      id: p.id,
      surveyNo: p.survey_no,
      village: p.village,
      tehsil: p.tehsil,
      district: p.district,
      state: p.state,
      area: p.area,
      areaNotified: p.area_notified,
      areaAcquired: p.area_acquired,
      affectedFamilies: p.affected_families,
      displacedFamilies: p.displaced_families,
      rrStatus: p.rr_status,
      possessionStatus: p.possession_status,
      section11Date: p.section11_date,
      section19Date: p.section19_date,
      section21Date: p.section21_date,
      landType: p.land_type,
      ownerId: p.owner_id,
      currentStage: p.current_stage,
      status: p.status,
      marketValue: p.market_value,
      acquiringAuthority: p.acquiring_authority,
      purpose: p.purpose,
      priority: p.priority,
      startDate: p.start_date,
      expectedCompletion: p.expected_completion,
      coordinates: { lat: p.lat, lng: p.lng },
      notes: p.notes
    }));

    res.json({ parcels: formatted, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/parcels - Create parcel
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const data = req.body;
    const id = `PCL-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    db.run(`INSERT INTO parcels (id, survey_no, village, tehsil, district, state, area, area_notified, area_acquired, land_type, current_stage, status, market_value, acquiring_authority, purpose, priority, lat, lng, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.surveyNo || data.survey_no || '101/A', data.village || 'Village-101', data.tehsil || 'Tehsil-01',
       data.district || 'Pune', data.state || 'Maharashtra', Number(data.area || 5), Number(data.areaNotified || data.area || 5),
       Number(data.areaAcquired || 0), data.landType || data.land_type || 'Agricultural', data.currentStage || 'preliminary-survey',
       data.status || 'on-track', Number(data.marketValue || data.market_value || 50), data.acquiringAuthority || 'NHAI',
       data.purpose || 'Infrastructure', data.priority || 'medium', data.lat || 18.5, data.lng || 73.8, data.notes || '']);

    db.run(`INSERT INTO parcel_history (parcel_id, date, event, stage, officer) VALUES (?, ?, ?, ?, ?)`,
      [id, new Date().toISOString().split('T')[0], 'Parcel Registered', 'preliminary-survey', 'OFF-001']);

    saveDb();
    res.status(201).json({ success: true, id, message: 'Parcel created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parcels/:id
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id.replace(/'/g, "''");
    const result = db.exec(`SELECT * FROM parcels WHERE id = '${id}'`);
    const parcels = toObjects(result);

    if (parcels.length === 0) return res.status(404).json({ error: 'Parcel not found' });

    const historyRes = db.exec(`SELECT * FROM parcel_history WHERE parcel_id = '${id}' ORDER BY id ASC`);
    const history = toObjects(historyRes);

    const docRes = db.exec(`SELECT * FROM documents WHERE parcel_id = '${id}'`);
    const documents = toObjects(docRes);

    const p = parcels[0];
    res.json({
      ...p,
      history,
      documents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/parcels/:id/stage
router.patch('/:id/stage', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id.replace(/'/g, "''");
    const { stage, officer = 'OFF-001' } = req.body;

    const newStatus = stage === 'possession-transfer' ? 'completed' : 'on-track';

    db.run(`UPDATE parcels SET current_stage = ?, status = ? WHERE id = ?`, [stage, newStatus, req.params.id]);
    db.run(`INSERT INTO parcel_history (parcel_id, date, event, stage, officer) VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, new Date().toISOString().split('T')[0], `Transitioned to ${stage}`, stage, officer]);

    saveDb();
    res.json({ success: true, stage, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/parcels/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    db.run(`DELETE FROM parcels WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
