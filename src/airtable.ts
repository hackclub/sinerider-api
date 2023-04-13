import { base } from "./config.js";
import puppeteer, { Page, TimeoutError } from 'puppeteer';

declare interface PuzzleDefinition {
  id:string,
  puzzleTitle: string, // url to the gameplay video on cloudinary,
  puzzleURL: string,
  puzzleDescription: string,
  order: number
}

export function saveLevel(levelUri: string) {
  return new Promise((resolve, reject) => {
    base("Levels").create([{
      fields: {
        url: levelUri,
        played: false
      }
    }], (err, records) => {
      if (err) reject(err);

      records ? resolve({ id: records[0].getId() }) : console.error(err);
    }
    )
  });
}

export function getUnplayedPuzzle() {
  return new Promise<PuzzleDefinition>((resolve, reject) => {
    
    base("Puzzles").select({
      view: "Grid view",
      filterByFormula: "NOT({active})",
      sort: [
        { field: "order", direction: "asc" }
      ],
      maxRecords:1
    }).eachPage((records, _) => {
      if (records.length == 0) {
        reject("No puzzle available!")
        return;
      }
      const puzzle = records[0]
      const result = {
        id:puzzle.getId(),
        puzzleTitle:puzzle.get("puzzleTitle"), // url to the gameplay video on cloudinary,
        puzzleURL:puzzle.get("puzzleURL"),
        puzzleDescription:puzzle.get("puzzleDescription"),
        order: puzzle.get("order")      
      } as PuzzleDefinition
      resolve(result)
      return;
    })
  })
}

export function markPuzzleAsActive(puzzleDefinition: PuzzleDefinition) {
  return new Promise((resolve, reject) => {
    base("Puzzles").update(puzzleDefinition.id, {active: true}).then(() => {
      resolve(true)
    }).catch(err => resolve(false));
  })
}

export function getLevels() : Promise<Set<string>> {
  let levels = new Set<string>();

  return new Promise((resolve, reject) => {
    base("Leaderboard")
    .select({
      view: "Grid view",
    })
    .eachPage(
      (records, nextPage) => {
        records.forEach((record) => {
          levels.add(record.get("level") as string)
        });
        nextPage();
      },
      (err) => {
        if (err) reject(err);

        resolve(levels);
      }
    );
});

}

export function getScoresByLevel(levelName: string, highscoreType: string) {
  if (highscoreType != "charCount" && highscoreType != "time")
    throw new Error("Invalid highscoreType");

  return new Promise((resolve, reject) => {
    const scores: Partial<Solution>[] = [];
    base("Leaderboard")
      .select({
        view: "Grid view",
        filterByFormula: `{level}=\"${levelName}\"`,
        sort: [
          { field: highscoreType, direction: "asc" }
        ],
      })
      .eachPage(
        (records, nextPage) => {
          records.forEach((record) => {
            const level = record.get("level");
            // console.log(level);
            if (level === levelName) {
              const expression = record.get("expression");
              const time = record.get("time");
              const playURL = record.get("playURL");
              const charCount = record.get("charCount");
              const gameplay = record.get("gameplay") ?? "";
              const player = record.get("player") ?? "";
              const timestamp = record.get("timestamp") ?? 0;

              scores.push({
                expression,
                time,
                playURL,
                charCount,
                gameplay,
                player,
                timestamp
              } as Solution);
            } else {
              console.log("We should never get here");
            }
          });
          nextPage();
        },
        (err) => {
          if (err) reject(err);

          resolve(scores);
        }
      );
  });
}

export async function generateLevel() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  page
    .on('console', (message: any) =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }: { message: any }) => console.log(message))
    .on('response', (response: any) =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', (request: any) =>
      console.log(`${request.failure().errorText} ${request.url()}`))

  await page.setViewport({ width: 1280, height: 720 });

  // selectors
  const clickToBeginSelector = "#loading-string"; // will have to wait until page is fully loaded before clicking
  const runButtonSelector = "#run-button";
  // const victoryLabelSelector = '#victory-label'

  const gameUrl = "https://sinerider.hackclub.dev/#random";

  // goto and wait until all assets are loaded
  await page.goto(gameUrl, { waitUntil: "networkidle0" });

  // will be better to page.waitForSelector before doing anything else
  await page.waitForSelector(clickToBeginSelector);
  const clickToBeginCTA = await page.$(clickToBeginSelector);
  await clickToBeginCTA?.click();

  // wait for selector here, too
  await page.waitForSelector(runButtonSelector);
  const runButton = await page.$(runButtonSelector);
  await runButton?.click();

  // sleep for 3s
  setTimeout(() => undefined, 3000);

  const levelURl = await page.evaluate("location.href");

  await browser.close();

  return levelURl as string;

}