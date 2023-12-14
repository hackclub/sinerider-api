# SineRider API

The SineRider externally available API

## How to use (endpoints)

- Send a `GET` request to `/generate` to generate a new level and store it in airtable. Does not return the URL to the generated game

- Send a `GET` request to `/daily` to get a random level from the airtable to play. Once the level is returned, the game url will be marked as *played* and may not be returned in the future.

- Send a `GET /level/:name/:highscoreType:` Retrieve scores for a specific level and score type. Parameters:
  - `:name`: Name of the level.
  - `:highscoreType`: Type of highscore to retrieve.
  
  (e.g `/level/HELLO_WORLD`)

- Send a `GET /levels:` Get a list of all available levels, sorted alphabetically.

- Send a `GET /puzzle/:nick:` Redirect to a specific puzzle by its nickname.

- Send a `GET /reddit/:nick:` Redirect to a Reddit post for a specific puzzle by its nickname.

### Authenticated Endpoints

_Note: These endpoints require basic authentication._

- Send a `POST /publishNewDailyPuzzle:` Publish a new daily puzzle across all bot services. Selects a puzzle from unplayed puzzles and marks it as active.

## Usage

Running the API:

1. Project Setup:

   ```bash
   npm run build
   ```
    ```bash
   npm start
   ```




