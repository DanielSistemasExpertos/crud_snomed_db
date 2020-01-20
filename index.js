const express = require("express");
const path = require("path");
const { Pool } = require("pg");

// Création du serveur Express
const app = express();

// Configuration du serveur
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Connexión a la base de PostgreSQL de snomed
const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: '123',
  database: 'snomedct',
  port: '5432'
});

console.log("Connexión exitosa");

// Inicio del servidor
app.listen(3000, () => {
  console.log("Servidor iniciado (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  // res.send("Hola mundo...");
  res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /data
app.get("/data", (req, res) => {
  const test = {
    titre: "Test",
    items: ["uno", "dos", "tres"]
  };
  res.render("data", { model: test });
});

// GET /terminos
app.get("/terminos", (req, res) => {
  const sql = "SELECT * FROM description_f ORDER BY codigo DESC limit 100";
  pool.query(sql, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    // console.log(result.rows);

    res.render("terminos", { model: result.rows });
  });
});

// GET /create
app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

// POST /create
app.post("/create", (req, res) => {
  const sql = "INSERT INTO description_f (active, conceptid, term) VALUES ($1, $2, $3)";
  const termino = [req.body.estado, req.body.idConcepto, req.body.termino];
  console.log(termino);
  pool.query(sql, termino, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/terminos");
  });
});

// GET /edit/5
app.get("/edit/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const sql = "SELECT * FROM description_f WHERE codigo = $1";
  pool.query(sql, [codigo], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", { model: result.rows[0] });
  });
});

// POST /edit/5
app.post("/edit/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const termino = [req.body.estado, req.body.idConcepto, req.body.termino, codigo];
  const sql = "UPDATE description_f SET active = $1, conceptid = $2, term = $3 WHERE (codigo = $4)";
  pool.query(sql, termino, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/terminos");
  });
});

// GET /delete/5
app.get("/delete/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const sql = "SELECT * FROM description_f WHERE codigo = $1";
  pool.query(sql, [codigo], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", { model: result.rows[0] });
  });
});

// POST /delete/5
app.post("/delete/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const sql = "DELETE FROM description_f WHERE codigo = $1";
  pool.query(sql, [codigo], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/terminos");
  });
});
