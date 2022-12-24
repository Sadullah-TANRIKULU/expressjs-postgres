import express from "express";
import pg from "pg";
require('dotenv').config({path: './.env'});

// Connect to the database using the DATABASE_URL environment
//   variable injected by Railway
const pool = new pg.Pool(
  {
    user: "postgres",
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: 6243
  }
);

pool.connect();

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/notes", async (req, res) => {
  await pool.query("SELECT * FROM notes", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

app.get("/note/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  await pool.query("SELECT * FROM notes WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);

  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get("*", (req, res) => {
  res.send('no routes specified with this name!!!')
});
