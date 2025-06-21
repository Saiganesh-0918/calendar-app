// // index.js
// const express = require('express');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const cors = require('cors');
// const pool = require('./db');

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());



// // Set up multer for file uploads
// const upload = multer({ storage: multer.memoryStorage() });

// // Create table if not exists
// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS transactions (
//   id SERIAL PRIMARY KEY,
//   date DATE,
//   transaction_id TEXT,
//   retailer_name TEXT,
//   opening_balance NUMERIC,
//   credit NUMERIC,
//   debit NUMERIC,
//   closing_balance NUMERIC
// )`;

// pool.query(createTableQuery);

// // Upload Excel
// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     for (const row of rows) {
//       // Replace column names with dynamic access
//       const keys = Object.keys(row);
//       const values = keys.map(k => row[k] || null);

//       // Build query
//       const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
//       const sql = `INSERT INTO transactions (${keys.join(", ")}) VALUES (${placeholders})`;

//       await pool.query(sql, values);
//     }

//     res.json({ message: "Excel uploaded and saved" });
//   } catch (err) {
//     console.error("❌ Upload error:", err);
//     res.status(500).json({ error: "Failed to process file" });
//   }
// });


// // Filter API (add query params later)
// app.get("/transactions", async (req, res) => {
//   try {
//     const filters = req.query;
//     let query = "SELECT * FROM transactions WHERE 1=1";
//     const values = [];

//     Object.entries(filters).forEach(([key, value], index) => {
//       query += ` AND ${key}::text ILIKE $${index + 1}`;
//       values.push(`%${value}%`);
//     });

//     const result = await pool.query(query, values);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to fetch transactions");
//   }
// });


// app.get('/', (req, res) => {
//     res.send('Backend is working ✅');
//   });

//   app.get('/columns', async (req, res) => {
//     try {
//       const result = await pool.query(`
//         SELECT column_name 
//         FROM information_schema.columns 
//         WHERE table_name = 'transactions'
//       `);
//       const columns = result.rows.map(r => r.column_name);
//       res.json(columns);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Failed to fetch columns");
//     }
//   });
  
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "myuser",
  password: "mypass",
  host: "postgres",
  port: 5432,
  database: "mydb",
});
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date DATE,
    transaction_id TEXT,
    retailer_name TEXT,
    opening_balance NUMERIC,
    credit NUMERIC,
    debit NUMERIC,
    closing_balance NUMERIC
  );
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ 'transactions' table is ready"))
  .catch(err => console.error("❌ Error creating 'transactions' table:", err.message));

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    // Normalize keys to snake_case
    const normalizeKey = key =>
      key.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const normalizedRows = rawRows.map(row => {
      const newRow = {};
      for (let key in row) {
        newRow[normalizeKey(key)] = row[key];
      }
      return newRow;
    });

    if (normalizedRows.length === 0) {
      return res.status(400).json({ error: "No data found in Excel" });
    }

    const keys = Object.keys(normalizedRows[0]);

    await pool.query("DELETE FROM transactions");

    const excelDateToISO = (serial) => {
      const utcDays = Math.floor(serial - 25569);
      const utcValue = utcDays * 86400;
      const date = new Date(utcValue * 1000);
      return date.toISOString().split("T")[0];
    };
    
    for (const row of normalizedRows) {
      // Fix Excel serial date
      if (row.date && typeof row.date === "number") {
        row.date = excelDateToISO(row.date);
      }
    
      // Fix empty string values in numeric fields
      ["opening_balance", "credit", "debit", "closing_balance"].forEach((col) => {
        if (row[col] === "") {
          row[col] = null; // Or 0 if you want zeros instead
        }
      });
    
      const values = keys.map((k) => row[k] ?? null);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO transactions (${keys.join(", ")}) VALUES (${placeholders})`;
    
      try {
        await pool.query(sql, values);
      } catch (insertErr) {
        console.error("Insert error for row:", row, "\\nError:", insertErr.message);
      }
    }
    

    res.json({ message: "File processed and data saved!" });
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).json({ error: "Internal server error while uploading" });
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const { from, to, ...filters } = req.query;
    let query = "SELECT * FROM transactions WHERE 1=1";
    const values = [];
    let index = 1;

    if (from) {
      query += ` AND date >= $${index++}`;
      values.push(from);
    }
    if (to) {
      query += ` AND date <= $${index++}`;
      values.push(to);
    }

    for (const [key, value] of Object.entries(filters)) {
      query += ` AND ${key}::text ILIKE $${index++}`;
      values.push(`%${value}%`);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch transactions");
  }
});
app.get("/columns", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    const columns = result.rows.map((r) => r.column_name).filter(col => col !== "id");
    res.json(columns);
  } catch (err) {
    console.error("❌ Failed to fetch columns:", err);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});
app.get("/column-values", async (req, res) => {
  const { column } = req.query;
  if (!column) return res.status(400).json({ error: "Column is required" });

  // Whitelist column names to prevent SQL injection
  const allowedColumns = [
    "date", "transaction_id", "retailer_name",
    "opening_balance", "credit", "debit", "closing_balance"
  ];
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: "Invalid column" });
  }

  try {
    const result = await pool.query(`SELECT DISTINCT ${column} FROM transactions`);
    const values = result.rows.map(row => row[column]).filter(v => v !== null);
    res.json(values);
  } catch (err) {
    console.error("Error fetching column values:", err);
    res.status(500).json({ error: "Failed to fetch values" });
  }
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
