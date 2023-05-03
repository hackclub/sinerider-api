import express from "express";
import cors from "cors";
import { getScoresByLevel, getLevels, createNewPuzzle, markPuzzleAsActive, getUnplayedPuzzle, PuzzleDefinition } from "./airtable.js";
import passport from "passport"
import { BasicStrategy } from "passport-http"
import { SINERIDER_API_SECRET, SINERIDER_TWITTER_BOT_URL, SINERIDER_REDDIT_BOT_URL } from "./config.js";
import lzs from "lz-string";
import generateRandomLevel from "./puzzle.js";

const app = express();

const BOT_SERVICES = {
  "TWITTER": SINERIDER_TWITTER_BOT_URL,
  "REDDIT": SINERIDER_REDDIT_BOT_URL
}

// setup json
app.use(express.json());
// should fix cors issues
app.use(cors());

passport.use(new BasicStrategy(
  function (username, password, done) {
    if (username == "hackclub" && password == SINERIDER_API_SECRET) {
      return done(null, "hackclub");
    } else {
      // Error
      return done(null, false);
    }
  }
));

const port = process.env.PORT ?? 3000;

app.get(
  "/",
  (req, res) => {
    res.send("I am alive");
  });

app.get("/level/:name/:highscoreType", (req, res) => {
  const levelName = req.params.name;
  const highscoreType = req.params.highscoreType;
  getScoresByLevel(levelName, highscoreType)
    .then((scores) => res.json({ success: true, scores }))
    .catch((err) => res.json({ success: false, reason: err }));
});

app.get("/levels", (req, res) => {
  getLevels()
  .then((levels) => {

    const sortAlphaNum = (a:string, b:string) => a.localeCompare(b, 'en', { numeric: true })
    const sortedLevels = Array.from(levels).sort(sortAlphaNum);
    return res.json({ success: true, levels: sortedLevels })
  })
  .catch((err) => res.json({ success: false, reason: err }));

})

// NOTE: Authentication required!
app.post("/publishNewDailyPuzzle",
  passport.authenticate('basic', { session: false }),
  async (_, res) => {
    try {
      const puzzleDesc = await getUnplayedPuzzle()
      await markPuzzleAsActive(puzzleDesc)

      const puzzleJson = JSON.stringify(puzzleDesc)
      console.log(`Puzzle payload: ${puzzleJson}`)

      const puzzleInfoJson = JSON.stringify(puzzleDesc)
      const puzzleInfo = lzs.compressToBase64(puzzleInfoJson)

      // Notify all bots they should publish the puzzle
      for (const [serviceName, url] of Object.entries(BOT_SERVICES)) {
        let headers = new Headers();
        let key = `SINERIDER_${serviceName}_API_KEY`
        let secret = process.env[key]
        headers.set('Authorization', 'Basic ' + Buffer.from("hackclub" + ":" + secret).toString('base64'));
  
        const fullUrl = `${url}/publishPuzzle?` + new URLSearchParams({ "publishingInfo": puzzleInfo })
        console.log(`Hitting ${serviceName} bot with URL: ${fullUrl}`)

        
        const response = await fetch(fullUrl, {method:'POST', headers:headers})
        if (response.status != 200) {
          console.log(`Error - response ${response.status} - ${response}`)
          throw new Error("Whoa, failure!")
        }
      }
      res.json({ "message": "Puzzle published!" })
    } catch (e) {
      res.status(500).json({ success: false, message: e })
    }
  });

// NOTE: Authentication required!
app.post("/generate",
  passport.authenticate('basic', { session: false }),
  async (req, res) => {

    const requiredFields = ["id", "title", "description", "order"];
    for (const field of requiredFields) {
      if (!(field in req.query)) {
        res.json({success:false, message:"Required field " + field + " not found"})
        return;  
      }
    }

    const id = req.query.id;
    const title = req.query.title;
    const description = req.query.description;
    const order = parseFloat(req.query.order as string);
    
    const level = generateRandomLevel() as any
    level.name = title as string;
    level.nick = id as string;
    level.isPuzzle = true

    const puzzleInfoJson = JSON.stringify(level)
    const puzzleInfo = lzs.compressToBase64(puzzleInfoJson)
    const url = "https://sinerider.hackclub.dev/?" + puzzleInfo
    await createNewPuzzle({
      id:id,
      puzzleTitle:title,
      puzzleURL:url,
      puzzleDescription:description,
      order: order,
      db_id: id
    } as PuzzleDefinition).then(resp => {
      res.json({ success:true, resp });
    }).catch(error => {
      res.json({ success:false, message: error.message })
    })
});

app.listen(port, () =>
  console.log(`Doing some black magic on port ${port}...`)
);