// server.js
import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database
const db = new sqlite3.Database("lostfound.db");
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- lost or found
    title TEXT,
    description TEXT,
    location TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// API route: submit item
app.post("/api/report", (req, res) => {
  const { type, title, description, location, email } = req.body;
  if (!type || !title || !description || !location || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  db.run(
    `INSERT INTO items (type, title, description, location, email) VALUES (?,?,?,?,?)`,
    [type, title, description, location, email],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// API route: get all items
app.get("/api/items", (req, res) => {
  db.all(`SELECT * FROM items ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
