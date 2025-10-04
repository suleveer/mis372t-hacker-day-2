// server.js (CommonJS)
const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

(async function main() {
  console.log("🔌 Connecting to MySQL at", process.env.DB_HOST, "…");

  // Connect (no SSL first; if your prof enforced TLS, we’ll add it later)
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    connectTimeout: 10000
  });

  await conn.ping();
  console.log("✅ Connected to AWS MySQL");

  const app = express();
  app.use(express.json());
  app.use(cors()); // lets your React dev server call this API

  // List tables
  app.get("/tables", async (_req, res) => {
    try {
      const [rows] = await conn.query("SHOW TABLES;");
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // List columns for a table: /columns?table=employees
  app.get("/columns", async (req, res) => {
    const table = req.query.table;
    if (!table) return res.status(400).json({ error: "Missing ?table=" });

    try {
      const [rows] = await conn.execute(
        `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME, table]
      );
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // GET /employees  -> list existing rows (for initial render / refresh)
app.get("/employees", async (_req, res) => {
  try {
    const [rows] = await conn.query(
      `SELECT employee_id, first_name, last_name, email, birthdate, salary
       FROM employees
       ORDER BY employee_id`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /employees -> insert one row, return the inserted row
app.post("/employees", async (req, res) => {
  try {
    const { first_name, last_name, email, birthdate, salary } = req.body;

    // basic validation
    if (!first_name || !last_name || !email || !birthdate) {
      return res.status(400).json({ error: "first_name, last_name, email, birthdate are required" });
    }

    // salary may be nullable; if provided, coerce to number
    const sal = salary === undefined || salary === "" ? null : Number(salary);
    if (sal !== null && Number.isNaN(sal)) {
      return res.status(400).json({ error: "salary must be a number" });
    }

    // parameterized insert
    const [result] = await conn.execute(
      `INSERT INTO employees (first_name, last_name, email, birthdate, salary)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, birthdate, sal]
    );

    // fetch the row we just inserted
    const [rows] = await conn.execute(
      `SELECT employee_id, first_name, last_name, email, birthdate, salary
       FROM employees
       WHERE employee_id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.delete("/employees/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log("DELETE /employees/:id ->", req.params.id, "parsed:", id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const [result] = await conn.execute(
      "DELETE FROM employees WHERE employee_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not found" });
    }

    res.status(204).end();
  } catch (e) {
    console.error("DELETE failed:", e);
    res.status(500).json({ error: e.message });
  }
});

app.put("/employees/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

    const { first_name, last_name, email, birthdate, salary } = req.body;

    const fields = [];
    const vals = [];
    if (first_name !== undefined) { fields.push("first_name = ?"); vals.push(first_name); }
    if (last_name  !== undefined) { fields.push("last_name = ?");  vals.push(last_name); }
    if (email      !== undefined) { fields.push("email = ?");      vals.push(email); }
    if (birthdate  !== undefined) { fields.push("birthdate = ?");  vals.push(birthdate); }
    if (salary     !== undefined) { fields.push("salary = ?");     vals.push(salary === "" ? null : Number(salary)); }

    if (fields.length === 0) return res.status(400).json({ error: "no fields to update" });

    vals.push(id);
    const [r] = await conn.execute(`UPDATE employees SET ${fields.join(", ")} WHERE employee_id = ?`, vals);
    if (r.affectedRows === 0) return res.status(404).json({ error: "not found" });

    const [rows] = await conn.execute(
      `SELECT employee_id, first_name, last_name, email, birthdate, salary FROM employees WHERE employee_id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error("PUT failed:", e);
    res.status(500).json({ error: e.message });
  }
});

  const PORT = 3001;
  app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
})().catch((err) => {
  console.error("💥 Startup error:", err);
  process.exit(1);
});


