const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initDb, seedDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Init DB
initDb();
seedDb();

// --- Existing Student Endpoints ---
app.get('/api/pgs', (req, res) => {
  db.all("SELECT * FROM pgs", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/rooms', (req, res) => {
  const { pg_id } = req.query;
  let query = "SELECT * FROM rooms";
  let params = [];
  if (pg_id) {
    query += " WHERE pg_id = ?";
    params.push(pg_id);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/users/:id/stay', (req, res) => {
  db.get(`
    SELECT bookings.*, rooms.room_number, rooms.price, rooms.type, pgs.name as pg_name
    FROM bookings
    JOIN rooms ON bookings.room_id = rooms.id
    JOIN pgs ON rooms.pg_id = pgs.id
    WHERE bookings.user_id = ? AND bookings.status = 'active'`, 
  [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

app.get('/api/users/:id/payments', (req, res) => {
  db.all("SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/users/:id/complaints', (req, res) => {
  db.all("SELECT * FROM complaints WHERE user_id = ? ORDER BY date DESC", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users/:id/complaints', (req, res) => {
  const { title, description } = req.body;
  db.run("INSERT INTO complaints (user_id, title, description, status, date) VALUES (?, ?, ?, ?, ?)", 
    [req.params.id, title, description, 'open', new Date().toISOString()], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, status: 'success' });
  });
});

app.get('/api/notices', (req, res) => {
  db.all("SELECT * FROM notices ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Owner / Manager Endpoints ---
app.get('/api/owner/overview', (req, res) => {
  // Returns global business stats
  const queries = {
    totalPgs: new Promise((res, rej) => db.get("SELECT COUNT(*) as count FROM pgs", (err, row) => err ? rej(err) : res(row.count))),
    totalBeds: new Promise((res, rej) => db.get("SELECT SUM(capacity) as count FROM rooms", (err, row) => err ? rej(err) : res(row.count || 0))),
    occupiedBeds: new Promise((res, rej) => db.get("SELECT SUM(occupied) as count FROM rooms", (err, row) => err ? rej(err) : res(row.count || 0))),
    collection: new Promise((res, rej) => db.get("SELECT SUM(amount) as total FROM payments WHERE status = 'paid' AND date LIKE ?", [new Date().toISOString().slice(0, 7) + '%'], (err, row) => err ? rej(err) : res(row.total || 0))),
    pendingRent: new Promise((res, rej) => db.get("SELECT SUM(amount) as total FROM payments WHERE status = 'pending'", (err, row) => err ? rej(err) : res(row.total || 0))),
  };

  Promise.all(Object.values(queries)).then(results => {
    const keys = Object.keys(queries);
    const data = {};
    keys.forEach((k, i) => data[k] = results[i]);
    res.json(data);
  }).catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/manager/overview', (req, res) => {
  // In a real app, this would be filtered by the manager's assigned PG(s).
  // For demo, we just return the same as owner, or a subset.
  // We'll simulate fetching for PG_ID 1
  const pgId = 1;
  const queries = {
    totalPgs: Promise.resolve(1),
    totalBeds: new Promise((res, rej) => db.get("SELECT SUM(capacity) as count FROM rooms WHERE pg_id = ?", [pgId], (err, row) => err ? rej(err) : res(row.count || 0))),
    occupiedBeds: new Promise((res, rej) => db.get("SELECT SUM(occupied) as count FROM rooms WHERE pg_id = ?", [pgId], (err, row) => err ? rej(err) : res(row.count || 0))),
    collection: new Promise((res, rej) => db.get("SELECT SUM(amount) as total FROM payments p JOIN users u ON p.user_id = u.id WHERE u.pg_id = ? AND p.status = 'paid' AND p.date LIKE ?", [pgId, new Date().toISOString().slice(0, 7) + '%'], (err, row) => err ? rej(err) : res(row.total || 0))),
    pendingRent: new Promise((res, rej) => db.get("SELECT SUM(amount) as total FROM payments p JOIN users u ON p.user_id = u.id WHERE u.pg_id = ? AND p.status = 'pending'", [pgId], (err, row) => err ? rej(err) : res(row.total || 0))),
  };

  Promise.all(Object.values(queries)).then(results => {
    const keys = Object.keys(queries);
    const data = {};
    keys.forEach((k, i) => data[k] = results[i]);
    res.json(data);
  }).catch(err => res.status(500).json({ error: err.message }));
});


app.listen(PORT, () => {
  console.log(`PG Manager backend running on http://localhost:${PORT}`);
});
