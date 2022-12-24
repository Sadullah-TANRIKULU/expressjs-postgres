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
});

app.post("/note", (req, res) => {
  
  const { id, note, title } = req.body;

  pool.query(
    "INSERT INTO notes VALUES ($1, $2, $3)",
    [id, note, title],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(`Note added with ID: ${id}`);
      console.log(results);
    }
  );
});

app.put("/note/:id", (req, res) => {
  const { note, title } = req.body;
  const id = parseInt(req.params.id);

  pool.query(
    "UPDATE notes SET note = $1, title = $2 WHERE id = $3",
    [note, title, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`Note modified with ID: ${id}`);
    }
  );
});

app.delete("/note/:id", (req, res) => {
  const id = parseInt(req.params.id);
  // const { id } = req.body;

  pool.query('DELETE FROM notes WHERE id = $1', [id], (error, results) => {
      if (error) {
          throw error
      }
      res.status(200).send(`Note deleted with ID: ${id}`)
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get("*", (req, res) => {
  res.send('no routes specified with this name!!!')
});
