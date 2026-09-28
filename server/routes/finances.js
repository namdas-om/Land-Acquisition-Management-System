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

// GET /api/finances
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = toObjects(db.exec(`SELECT * FROM finances ORDER BY id DESC`));
    const formatted = rows.map(f => ({
      parcelId: f.parcel_id,
      landMarketValue: f.land_market_value,
      solatium: f.solatium,
      additionalCompensation: f.additional_compensation,
      rehabilitationCost: f.rehabilitation_cost,
      adminCost: f.admin_cost,
      totalAward: f.total_award,
      paymentStatus: f.payment_status,
      paidAmount: f.paid_amount,
      paymentDate: f.payment_date,
      paymentMethod: f.payment_method
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/finances/:parcelId
router.get('/:parcelId', async (req, res) => {
  try {
    const db = await getDb();
    const pid = req.params.parcelId.replace(/'/g, "''");
    const rows = toObjects(db.exec(`SELECT * FROM finances WHERE parcel_id = '${pid}'`));
    if (rows.length === 0) return res.status(404).json({ error: 'Finance record not found' });

    const f = rows[0];
    res.json({
      parcelId: f.parcel_id,
      landMarketValue: f.land_market_value,
      solatium: f.solatium,
      additionalCompensation: f.additional_compensation,
      rehabilitationCost: f.rehabilitation_cost,
      adminCost: f.admin_cost,
      totalAward: f.total_award,
      paymentStatus: f.payment_status,
      paidAmount: f.paid_amount,
      paymentDate: f.payment_date,
      paymentMethod: f.payment_method
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/finances/:parcelId - Update payment status
router.put('/:parcelId', async (req, res) => {
  try {
    const db = await getDb();
    const pid = req.params.parcelId;
    const { paymentStatus, paidAmount, paymentMethod } = req.body;

    const paymentDate = paymentStatus !== 'not-started' ? new Date().toISOString() : null;
    db.run(`UPDATE finances SET payment_status = ?, paid_amount = ?, payment_method = ?, payment_date = ? WHERE parcel_id = ?`,
      [paymentStatus, paidAmount, paymentMethod || 'RTGS / DBT', paymentDate, pid]);

    saveDb();
    res.json({ success: true, parcelId: pid, paymentStatus, paidAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
