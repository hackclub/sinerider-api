import express from "express";
import cors from "cors";
import { getScoresByLevel, getAllScores, saveLevel, getUnplayedLevel, generateLevel } from "./airtable.js";

const app = express();

// setup json
app.use(express.json());
// should fix cors issues
app.use(cors());

const port = process.env.PORT ?? 3000;

app.get("/", (req, res) => {
  res.send("SineRider is cool!");
});

app.get("/level/:name", (req, res) => {
  const levelName = req.params.name;

  getScoresByLevel(levelName)
    .then((scores) => res.json({ success: true, scores }))
    .catch((err) => res.json({ success: false, reason: err }));
});

app.get("/all", (req, res) => {
  getAllScores()
    .then((scores) => res.json({ success: true, scores }))
    .catch((err) => res.json({ success: false, reason: err }));
});

app.get("/daily", (_, res) => {
  getUnplayedLevel()
    .then(level => res.json({ level, success: true }))
    .catch((err) => res.json({ success: false }));
});

app.get("/generate", async (req, res) => {
  const newLevel = await generateLevel();
  saveLevel(newLevel)
    .then(() => res.json({ success: true }))
    .catch(() => res.json({ success: false }));
});

app.listen(port, () =>
  console.log(`Doing some black magic on port ${port}...`)
);