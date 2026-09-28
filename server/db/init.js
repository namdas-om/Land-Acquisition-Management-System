const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'nlams.db');
let _db = null;

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  // Load existing DB from file or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  // Enable foreign keys
  _db.run('PRAGMA foreign_keys = ON');

  return _db;
}

function saveDb() {
  if (!_db) return;
  const data = _db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Auto-save every 30 seconds
setInterval(() => {
  if (_db) saveDb();
}, 30000);

async function initializeDatabase() {
  const db = await getDb();

  // ── Create Tables ──────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT,
      dept TEXT,
      mobile TEXT,
      parcel_id TEXT,
      district TEXT,
      award_amount REAL,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS owners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      father_name TEXT,
      aadhaar TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      bank_account TEXT,
      compensation_status TEXT DEFAULT 'pending',
      total_compensation REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS officers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      designation TEXT,
      department TEXT,
      jurisdiction TEXT,
      phone TEXT,
      email TEXT,
      active_cases INTEGER DEFAULT 0,
      completed_cases INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS legal_teams (
      id TEXT PRIMARY KEY,
      firm_name TEXT NOT NULL,
      advocate TEXT,
      specialization TEXT,
      phone TEXT,
      email TEXT,
      cases_assigned INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parcels (
      id TEXT PRIMARY KEY,
      survey_no TEXT,
      village TEXT,
      tehsil TEXT,
      district TEXT,
      state TEXT,
      area REAL,
      area_notified REAL,
      area_acquired REAL,
      affected_families INTEGER DEFAULT 0,
      displaced_families INTEGER DEFAULT 0,
      rr_status TEXT,
      possession_status TEXT,
      section11_date TEXT,
      section19_date TEXT,
      section21_date TEXT,
      land_type TEXT,
      owner_id TEXT,
      current_stage TEXT,
      status TEXT,
      market_value REAL,
      acquiring_authority TEXT,
      purpose TEXT,
      priority TEXT,
      start_date TEXT,
      expected_completion TEXT,
      lat REAL,
      lng REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES owners(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS parcel_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_id TEXT NOT NULL,
      date TEXT,
      event TEXT,
      stage TEXT,
      officer TEXT,
      FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS finances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_id TEXT UNIQUE NOT NULL,
      land_market_value REAL,
      solatium REAL,
      additional_compensation REAL,
      rehabilitation_cost REAL,
      admin_cost REAL,
      total_award REAL,
      payment_status TEXT DEFAULT 'not-started',
      paid_amount REAL DEFAULT 0,
      payment_date TEXT,
      payment_method TEXT,
      FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      parcel_id TEXT,
      upload_date TEXT,
      status TEXT DEFAULT 'Draft',
      file_size TEXT,
      uploaded_by TEXT,
      description TEXT,
      file_path TEXT,
      FOREIGN KEY (parcel_id) REFERENCES parcels(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT,
      title TEXT,
      description TEXT,
      timestamp TEXT,
      is_read INTEGER DEFAULT 0,
      priority TEXT,
      related_parcel_id TEXT,
      action_label TEXT,
      action_target TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      title TEXT,
      description TEXT,
      timestamp TEXT,
      user_id TEXT,
      parcel_id TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS legal_hearings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      legal_team_id TEXT,
      date TEXT,
      court TEXT,
      case_ref TEXT,
      parcel_id TEXT,
      FOREIGN KEY (legal_team_id) REFERENCES legal_teams(id)
    )
  `);

  // ── Check if already seeded ────────────────────────────────────
  const countResult = db.exec('SELECT COUNT(*) as c FROM parcels');
  const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
  if (count > 0) {
    console.log('Database already seeded. Skipping.');
    saveDb();
    return;
  }

  console.log('Seeding database...');

  // ── Helpers ────────────────────────────────────────────────────
  const states = [
    { state: 'Maharashtra', districts: ['Pune', 'Thane', 'Raigad'], lat: 18.5, lng: 73.8 },
    { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur'], lat: 26.9, lng: 75.8 },
    { state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai'], lat: 13.0, lng: 80.2 },
    { state: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Agra'], lat: 26.8, lng: 80.9 },
    { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara'], lat: 23.0, lng: 72.6 }
  ];
  const authorities = ['NHAI', 'State PWD', 'Smart City Mission', 'Railway Board', 'Industrial Development Corp'];
  const purposes = ['National Highway Expansion', 'Metro Rail Corridor', 'Industrial Zone', 'Smart City Project', 'Railway Expansion', 'Irrigation Canal'];
  const stagesList = ['preliminary-survey', 'notification', 'survey-objections', 'declaration', 'negotiation', 'compensation', 'possession-transfer'];
  const landTypes = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Barren', 'Forest'];
  const firstNames = ['Aarav', 'Rahul', 'Mohammed', 'Arjun', 'Suresh', 'Vikram', 'Priya', 'Anjali', 'Fatima', 'Sneha', 'Rajesh', 'Amit', 'Ibrahim', 'Harpreet', 'Ravi', 'Ganesh', 'Kavita', 'Neha', 'Pooja', 'Sunil'];
  const lastNames = ['Sharma', 'Patil', 'Khan', 'Singh', 'Deshmukh', 'Iyer', 'Reddy', 'Das', 'Kumar', 'Gupta', 'Jain', 'Mehta', 'Nair', 'Ali', 'Yadav'];
  const designations = ['District Collector', 'Sub-Divisional Magistrate', 'Revenue Officer', 'Land Acquisition Officer', 'Tehsildar'];
  const docTypes = ['SIA Report', 'Section 11 Notification', 'Section 19 Declaration', 'Section 21 Notice', 'Award Letter', 'Compensation Agreement', 'Title Deed', 'Possession Certificate', 'R&R Compliance Order'];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rNum = (min, max, dec = 0) => Number((Math.random() * (max - min) + min).toFixed(dec));
  const rDate = (s, e) => new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()));
  const pad = (n, w = 3) => String(n).padStart(w, '0');

  // ── Seed Users ─────────────────────────────────────────────────
  const passwordHash = bcrypt.hashSync('admin123', 10);

  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-001', 'collector', passwordHash, 'official', 'Dr. Ananya Verma IAS', 'District Collector & Magistrate', 'Revenue & Land Resources (DoLR)', '👩‍💼']);
  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-002', 'lao', passwordHash, 'official', 'Shri Vikram Rathore', 'Nodal LAO – NHAI', 'Ministry of Road Transport & Highways', '👨‍💼']);
  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-003', 'engineer', passwordHash, 'official', 'Er. Priya Nair', 'Executive Engineer', 'Railway Land Development Authority', '👩‍🔬']);
  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-004', 'admin', passwordHash, 'official', 'System Administrator', 'Admin', 'IT Department', '🛡️']);

  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, mobile, parcel_id, district, award_amount, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-C01', 'citizen1', passwordHash, 'citizen', 'Ramesh Patil', 'Landowner – Agriculturist', 'Affected Family', '+91 98765 43210', 'PCL-2024-0001', 'Pune', 45.2, '👨‍🌾']);
  db.run(`INSERT INTO users (id, username, password_hash, role, name, title, dept, mobile, parcel_id, district, award_amount, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['USR-C02', 'citizen2', passwordHash, 'citizen', 'Fatima Sheikh', 'Landowner – Commercial', 'Displaced Family', '+91 87654 32109', 'PCL-2024-0012', 'Ahmedabad', 78.5, '👩‍💼']);

  // ── Seed Owners ────────────────────────────────────────────────
  const ownerIds = [];
  for (let i = 1; i <= 30; i++) {
    const fn = pick(firstNames), ln = pick(lastNames);
    const oid = `OWN-${pad(i)}`;
    ownerIds.push(oid);
    db.run(`INSERT INTO owners (id, name, father_name, aadhaar, phone, email, address, bank_account) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [oid, `${fn} ${ln}`, `${pick(firstNames)} ${ln}`, `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
       `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`, `${fn.toLowerCase()}${i}@gmail.com`,
       `House No ${rNum(1, 100)}, Ward ${rNum(1, 20)}, ${pick(['Main Market', 'Station Road', 'Gandhi Nagar', 'Shivaji Nagar'])}`,
       `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`]);
  }

  // ── Seed Officers ──────────────────────────────────────────────
  const officerNames = [];
  const officerIds = [];
  for (let i = 1; i <= 15; i++) {
    const oid = `OFF-${pad(i)}`;
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    officerIds.push(oid);
    officerNames.push(name);
    db.run(`INSERT INTO officers (id, name, designation, department, jurisdiction, phone, email, active_cases, completed_cases) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [oid, name, pick(designations), 'Revenue & Land Resources (DoLR)', states[i % states.length].state,
       `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`, `officer${i}@gov.in`, rNum(2, 10), rNum(5, 30)]);
  }

  // ── Seed Legal Teams ───────────────────────────────────────────
  for (let i = 1; i <= 5; i++) {
    db.run(`INSERT INTO legal_teams (id, firm_name, advocate, specialization, phone, email, cases_assigned) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`LEG-${pad(i)}`, `${pick(lastNames)} & Associates`, `${pick(firstNames)} ${pick(lastNames)}`,
       pick(['Land Acquisition', 'Revenue Law', 'Rehabilitation & Resettlement']),
       `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`, `legal${i}@lawfirm.in`, rNum(1, 10)]);
  }

  // ── Seed Parcels & Finances ────────────────────────────────────
  const stageCounts = { 'preliminary-survey': 3, 'notification': 5, 'survey-objections': 8, 'declaration': 7, 'negotiation': 10, 'compensation': 8, 'possession-transfer': 9 };
  let availableStages = [];
  Object.keys(stageCounts).forEach(s => { for (let k = 0; k < stageCounts[s]; k++) availableStages.push(s); });

  const parcelIds = [];

  for (let i = 1; i <= 50; i++) {
    const stateObj = states[i % states.length];
    const stage = availableStages[i - 1];
    const isCompleted = stage === 'possession-transfer';
    const status = isCompleted ? 'completed' : pick(['on-track', 'on-track', 'delayed', 'disputed', 'on-hold']);
    const ownerId = ownerIds[(i - 1) % ownerIds.length];
    const parcelId = `PCL-2024-${pad(i, 4)}`;
    parcelIds.push(parcelId);

    const isRural = Math.random() > 0.4;
    const landType = pick(landTypes);
    const marketValue = rNum(10, 150, 2);
    const area = rNum(0.5, 50, 2);
    const areaNotified = Number((area * 1.15).toFixed(2));
    const areaAcquired = isCompleted ? area : Number((area * rNum(0.3, 0.85, 2)).toFixed(2));
    const affectedFamilies = rNum(2, 25);
    const displacedFamilies = Math.floor(affectedFamilies * rNum(0.2, 0.6, 2));

    const sec11Date = '2024-01-15';
    const sec19Date = stage !== 'preliminary-survey' && stage !== 'notification' ? '2024-03-20' : null;
    const sec21Date = stage === 'compensation' || stage === 'possession-transfer' ? '2024-05-10' : null;
    const rrStatus = isCompleted ? 'Completed' : (stage === 'compensation' ? 'In-Progress' : 'Pending Verification');
    const possessionStatus = isCompleted ? 'Transferred to Agency' : (stage === 'compensation' ? 'Pending Handover' : 'Under Acquisition');

    db.run(`INSERT INTO parcels (id, survey_no, village, tehsil, district, state, area, area_notified, area_acquired, affected_families, displaced_families, rr_status, possession_status, section11_date, section19_date, section21_date, land_type, owner_id, current_stage, status, market_value, acquiring_authority, purpose, priority, start_date, expected_completion, lat, lng, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parcelId, `${rNum(1, 200)}/${pick(['A', 'B', 'C', '1A', '2B'])}`, `Village-${rNum(100, 999)}`, `Tehsil-${rNum(10, 99)}`,
       pick(stateObj.districts), stateObj.state, area, areaNotified, areaAcquired, affectedFamilies, displacedFamilies,
       rrStatus, possessionStatus, sec11Date, sec19Date, sec21Date, landType, ownerId, stage, status, marketValue,
       pick(authorities), pick(purposes), pick(['high', 'medium', 'low']),
       rDate(new Date('2024-01-01'), new Date('2024-06-30')).toISOString(),
       rDate(new Date('2024-12-01'), new Date('2025-12-31')).toISOString(),
       stateObj.lat + (Math.random() - 0.5) * 0.2, stateObj.lng + (Math.random() - 0.5) * 0.2,
       'Standard processing protocol initiated under LARR Act 2013.']);

    db.run(`INSERT INTO parcel_history (parcel_id, date, event, stage, officer) VALUES (?, ?, ?, ?, ?)`,
      [parcelId, '2024-01-15', 'Section 11 Preliminary Notification Issued', 'preliminary-survey', 'OFF-001']);

    // Finance
    const solatium = marketValue;
    const additionalCompensation = isRural ? marketValue : 0;
    const rehabilitationCost = rNum(2, 10, 2);
    const adminCost = Number((marketValue * 0.05).toFixed(2));
    const totalAward = Number((marketValue + solatium + additionalCompensation + rehabilitationCost + adminCost).toFixed(2));

    let paymentStatus = 'not-started';
    let paidAmount = 0;
    if (stage === 'possession-transfer' || stage === 'compensation') {
      paymentStatus = stage === 'possession-transfer' ? 'completed' : 'in-progress';
      paidAmount = stage === 'possession-transfer' ? totalAward : Number((totalAward * 0.5).toFixed(2));
    }

    db.run(`UPDATE owners SET total_compensation = total_compensation + ?, paid_amount = paid_amount + ?, compensation_status = ? WHERE id = ?`,
      [totalAward, paidAmount, paymentStatus === 'completed' ? 'completed' : (paymentStatus === 'in-progress' ? 'partial' : 'pending'), ownerId]);

    db.run(`INSERT INTO finances (parcel_id, land_market_value, solatium, additional_compensation, rehabilitation_cost, admin_cost, total_award, payment_status, paid_amount, payment_date, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [parcelId, marketValue, solatium, additionalCompensation, rehabilitationCost, adminCost, totalAward, paymentStatus, paidAmount,
       paymentStatus !== 'not-started' ? new Date().toISOString() : null, paymentStatus !== 'not-started' ? 'RTGS / DBT' : null]);
  }

  // ── Seed Documents ─────────────────────────────────────────────
  for (let i = 1; i <= 35; i++) {
    const docType = pick(docTypes);
    db.run(`INSERT INTO documents (id, name, type, parcel_id, upload_date, status, file_size, uploaded_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`DOC-${pad(i)}`, `${docType} - Case ${i}`, docType, parcelIds[rNum(0, 49)],
       rDate(new Date('2024-01-01'), new Date()).toISOString(), pick(['Draft', 'Under Review', 'Verified & Signed', 'Archived']),
       `${rNum(1, 10, 1)} MB`, pick(officerNames),
       'Official document associated with land acquisition statutory phase under LARR Act 2013.']);
  }

  // ── Seed Notifications ─────────────────────────────────────────
  for (let i = 1; i <= 20; i++) {
    db.run(`INSERT INTO notifications (id, type, title, description, timestamp, is_read, priority, related_parcel_id, action_label, action_target) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`NTF-${pad(i)}`, pick(['deadline', 'approval', 'payment', 'hearing', 'system']),
       'Statutory SLA Alert: LARR Review', 'Section 19 declaration verification pending for designated parcel.',
       new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
       Math.random() > 0.6 ? 1 : 0, pick(['high', 'medium', 'low']), parcelIds[rNum(0, 49)], 'View Parcel', 'parcels']);
  }

  // ── Seed Activity Log ──────────────────────────────────────────
  for (let i = 1; i <= 30; i++) {
    db.run(`INSERT INTO activity_log (type, title, description, timestamp, user_id, parcel_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [pick(['parcel-added', 'stage-change', 'payment', 'document-upload', 'approval', 'note-added']),
       'Workflow Milestone Achieved', 'The parcel has successfully transitioned to the next statutory LARR 2013 stage.',
       new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
       pick(officerIds), parcelIds[rNum(0, 49)]]);
  }

  // ── Seed Legal Hearings ────────────────────────────────────────
  for (let i = 1; i <= 5; i++) {
    db.run(`INSERT INTO legal_hearings (legal_team_id, date, court, case_ref, parcel_id) VALUES (?, ?, ?, ?, ?)`,
      [`LEG-${pad(i)}`, new Date().toISOString(), 'High Court', `HC-${rNum(1000, 9999)}`, parcelIds[rNum(0, 49)]]);
  }

  saveDb();
  console.log('Database seeded successfully!');
}

module.exports = { getDb, saveDb, initializeDatabase, DB_PATH };
