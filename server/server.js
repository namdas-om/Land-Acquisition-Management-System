const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const { initializeDatabase } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'nlams-secret-key-2024-larr',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ── Serve Frontend Static Files ──────────────────────────────────
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// ── Serve uploaded files ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parcels', require('./routes/parcels'));
app.use('/api/stakeholders', require('./routes/stakeholders'));
app.use('/api/finances', require('./routes/finances'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stats', require('./routes/stats'));

// ── Catch-all: serve index.html for SPA routing ─────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// ── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start Server ─────────────────────────────────────────────────
async function start() {
  try {
    await initializeDatabase();
    console.log('Database initialized.');

    app.listen(PORT, () => {
      console.log(`\n🏛️  NLAMS Server running at http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend served from ${frontendPath}\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
