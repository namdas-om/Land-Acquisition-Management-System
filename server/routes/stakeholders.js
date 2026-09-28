const router = require('express').Router();
const { getDb } = require('../db/init');

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// GET /api/stakeholders/owners
router.get('/owners', async (req, res) => {
  try {
    const db = await getDb();
    const owners = toObjects(db.exec(`SELECT * FROM owners`));
    const parcels = toObjects(db.exec(`SELECT id, owner_id FROM parcels`));

    const formatted = owners.map(o => {
      const ownerParcels = parcels.filter(p => p.owner_id === o.id).map(p => p.id);
      return {
        id: o.id,
        name: o.name,
        fatherName: o.father_name,
        aadhaar: o.aadhaar,
        phone: o.phone,
        email: o.email,
        address: o.address,
        parcels: ownerParcels,
        bankAccount: o.bank_account,
        compensationStatus: o.compensation_status,
        totalCompensation: o.total_compensation,
        paidAmount: o.paid_amount
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stakeholders/officers
router.get('/officers', async (req, res) => {
  try {
    const db = await getDb();
    const officers = toObjects(db.exec(`SELECT * FROM officers`));
    const formatted = officers.map(o => ({
      id: o.id,
      name: o.name,
      designation: o.designation,
      department: o.department,
      jurisdiction: o.jurisdiction,
      phone: o.phone,
      email: o.email,
      activeCases: o.active_cases,
      completedCases: o.completed_cases
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stakeholders/legal-teams
router.get('/legal-teams', async (req, res) => {
  try {
    const db = await getDb();
    const teams = toObjects(db.exec(`SELECT * FROM legal_teams`));
    const hearings = toObjects(db.exec(`SELECT * FROM legal_hearings`));

    const formatted = teams.map(t => ({
      id: t.id,
      firmName: t.firm_name,
      advocate: t.advocate,
      specialization: t.specialization,
      phone: t.phone,
      email: t.email,
      casesAssigned: t.cases_assigned,
      upcomingHearings: hearings.filter(h => h.legal_team_id === t.id).map(h => ({
        date: h.date,
        court: h.court,
        caseRef: h.case_ref,
        parcelId: h.parcel_id
      }))
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
