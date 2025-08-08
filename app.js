import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import dotenv from "dotenv";

const app = express();
const PORT = 3000;

dotenv.config();

// Accessing Postgres DB
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
  process.exit(-1);
});

// Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

// Routing
app.get("/", async (req, res) => {
  try {
    totalCorrect = 0;

    const result = await pool.query("SELECT * FROM flags");
    quiz = result.rows;
    console.log("Success fetching data from flags DB");

    await nextQuestion();
    console.log(currentQuestion);

    res.render("index", { question: currentQuestion, score: totalCorrect, wasCorrect: null });
  } catch (err) {
    console.error("Error fetching flags DB:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/`);
});
