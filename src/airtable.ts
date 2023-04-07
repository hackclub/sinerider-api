import { base } from "./config.js";
import puppeteer, { Page, TimeoutError } from 'puppeteer';

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

export function getUnplayedLevel() {
  return new Promise((resolve, reject) => {
    base("Levels").select({
      view: "Grid view",
      filterByFormula: "NOT({played})"
    }).eachPage((records, _) => {
      const randomLevel = records[Math.floor(Math.random() * records.length)];
      base("Levels").update(randomLevel.getId(), {
        played: true
      }).then(() => resolve(randomLevel.get("url")))
        .catch(err => console.log(err));

    }, (err) => reject(err))
  });
}

export function saveSolution({
  expression,
  level,
  time,
  charCount,
  playURL,
  gameplay,
  player,
  timestamp
}: Solution) {
  return new Promise((resolve, reject) => {
    base("Leaderboard").create(
      [
        {
          fields: {
            expression,
            level,
            time: parseFloat(time.toFixed(2)),
            playURL: playURL.split("?")[1],
            charCount,
            gameplay,
            player,
            timestamp,
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
          { field: "time", direction: "asc" },
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
          { field: "time", direction: "asc" },
        ],
      })
      .eachPage(
        (records, nextPage) => {
          records.forEach((record) => {
            const level = record.get("level");
            // console.log(level);
            const expression = record.get("expression");
            const time = record.get("time");
            const playURL = record.get("playURL");
            const charCount = record.get("charCount");
            const player = record.get("player") ?? "";
            const timestamp = record.get("timestamp") ?? 0;

            scores.push({
              expression,
              time,
              playURL,
              charCount,
              level,
              timestamp,
              player,
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