import { exec } from 'child_process';
import puppeteer, { Page, TimeoutError } from 'puppeteer';
import { base } from "./config.js";

declare interface Solution {
  expression: string,
  gameplay: string, // url to the gameplay video on cloudinary,
  level: string,
  charCount: number,
  playURL: string,
  T: number
}

export function saveLevel(levelUri: string) {
  return new Promise((resolve, reject) => {
    base("Levels").create([{
      fields: {
        URL: levelUri,
        played: false
      }
    }], (err, records) => {
      if (err) reject(err);

      records ? resolve({ id: records[0].getId() }) : console.error(err);
    }
    )
  });
}

export function getUnplayedLevel() {
  return new Promise((resolve, reject) => {
    base("Levels").select({
      view: "Grid view",
      filterByFormula: "NOT({played})"
    }).eachPage((records, _) => {
      const randomLevel = records[Math.floor(Math.random() * records.length)];
      console.log("gets here")
      base("Levels").update(randomLevel.getId(), {
        played: true
      }).then(() => resolve(randomLevel.get("URL")))
        .catch(err => console.log(err));

    }, (err) => reject(err))
  });
}

export function saveSolution({
  expression,
  level,
  T,
  charCount,
  playURL,
  gameplay,
}: Solution) {
  return new Promise((resolve, reject) => {
    base("Leaderboard").create(
      [
        {
          fields: {
            expression,
            level,
            T: parseFloat(T.toFixed(2)),
            playURL: playURL.split("?")[1],
            charCount,
            gameplay,
          },
        },
      ],
      (error, records) => {
        if (error) {
          reject(error);
        }

        records ? resolve({ id: records[0].getId() }) : console.error("Failed to write to airtable");
      }
    );
  });
}

export function getScoresByLevel(levelName: string) {
  return new Promise((resolve, reject) => {
    const scores: Partial<Solution>[] = [];
    base("Leaderboard")
      .select({
        view: "Grid view",
        sort: [
          { field: "charCount", direction: "asc" },
          { field: "T", direction: "asc" },
        ],
      })
      .eachPage(
        (records, nextPage) => {
          records.forEach((record) => {
            const level = record.get("level");
            // console.log(level);
            if (level === levelName) {
              const expression = record.get("expression");
              const T = record.get("T");
              const playURL = record.get("playURL");
              const charCount = record.get("charCount");
              const gameplay = record.get("gameplay") ?? "";

              scores.push({
                expression,
                T,
                playURL,
                charCount,
                gameplay,
              } as Solution);
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

export function getAllScores() {
  return new Promise((resolve, reject) => {
    const scores: Partial<Solution>[] = [];
    base("Leaderboard")
      .select({
        view: "Grid view",
        sort: [
          { field: "charCount", direction: "asc" },
          { field: "T", direction: "asc" },
        ],
      })
      .eachPage(
        (records, nextPage) => {
          records.forEach((record) => {
            const level = record.get("level");
            // console.log(level);
            const expression = record.get("expression");
            const T = record.get("T");
            const playURL = record.get("playURL");
            const charCount = record.get("charCount");

            scores.push({
              expression,
              T,
              playURL,
              charCount,
              level,
            } as Solution);
          });
          nextPage();
        },
        (err: any) => {
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