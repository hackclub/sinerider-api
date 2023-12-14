# SineRider API

The SineRider externally available API

## How to use (endpoints)

- Send a `GET /generate` to generate a new level, which is then stored in Airtable. It returns the id from Airtable but does not return the URL of the generated game.

- Send a `GET /level/name/highscoreType` Retrieve scores for a specific level and score type. Parameters:
  - `:name`: Name of the level.
  - `:highscoreType`: Type of highscore to retrieve.

  (e.g `/level/HELLO_WORLD`)

- Send a `GET /levels` Get a list of all available levels, sorted alphabetically.

- Send a `GET /puzzle/nick` Redirect to a specific puzzle by its nickname.

- Send a `GET /reddit/nick` Redirect to a Reddit post for a specific puzzle by its nickname.

### Authenticated Endpoints

_Note: This endpoint require basic authentication._

- Send a `POST /publishNewDailyPuzzle` Publish a new daily puzzle across all bot services. Selects a puzzle from unplayed puzzles and marks it as active.

## Contributing

Contributions are encouraged and welcome! There are two GitHub repositories that contain code for Sinerider: the [Sinerider website](https://github.com/hackclub/sinerider) and [Sinerider API](https://github.com/hackclub/sinerider-api#contributing). Each repository has a section on contributing guidelines and how to run each project locally.


## Running locally

1. Clone this repository
   - `git clone https://github.com/hackclub/sinerider-api && cd sinerider-api`

1. Install dependencies
   - `npm i`
1. Create `.env` file at root of project
   - `touch .env`
   - Send a message in [hq-engineering](https://app.slack.com/client/T0266FRGM/C05SVRTCDGV) asking for the `.env` file contents

1. Run build
   - `npm run build`
1. Start server
   - `npm start`

  ## Enviorment Variables
  `GRAPHITE_HOST=<exampele>` 

  `NODE_ENV=production`

  `SINERIDER_AIRTABLE_API_KEY=<exampele>`

  `SINERIDER_AIRTABLE_BASE=<exampele>`

  `SINERIDER_API_SECRET=<exampele>`

  `SINERIDER_REDDIT_API_KEY=<exampele>`

  `SINERIDER_REDDIT_BOT_URL=<exampele>`

  `SINERIDER_TWITTER_API_KEY=<exampele>`

  `SINERIDER_TWITTER_BOT_URL=<exampele>`


