import { base } from "./config.js";
import puppeteer, { Page, TimeoutError } from 'puppeteer';

export declare interface PuzzleDefinition {
  id:string,
  puzzleTitle: string, // url to the gameplay video on cloudinary,
  puzzleURL: string,
  puzzleDescription: string,
  order: number,
  db_id:string
}

export function createNewPuzzle(puzzle: PuzzleDefinition) {
  return new Promise((resolve, reject) => {
    base("Puzzles").create([{
      fields: {
        id: puzzle.id,
        puzzleURL: puzzle.puzzleURL,
        puzzleTitle: puzzle.puzzleTitle,
        puzzleDescription:puzzle.puzzleDescription,
        order: puzzle.order
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
        id:puzzle.get("id"),
        puzzleTitle:puzzle.get("puzzleTitle"), // url to the gameplay video on cloudinary,
        puzzleURL:puzzle.get("puzzleURL"),
        puzzleDescription:puzzle.get("puzzleDescription"),
        order: puzzle.get("order"),
        db_id: puzzle.id
      } as PuzzleDefinition
      resolve(result)
      return;
    })
  })
}

export function markPuzzleAsActive(puzzleDefinition: PuzzleDefinition) {
  return new Promise((resolve, reject) => {
    base("Puzzles").update(puzzleDefinition.db_id, {active: true}).then(() => {
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