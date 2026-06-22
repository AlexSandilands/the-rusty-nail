# CLAUDE.md

Guidance for working in this repo. Read alongside `README.md`.

## What this is

**The Rusty Nail** — a small Discord utility bot for weekly D&D game-night logistics
(confirmation polls, calendar links/screenshots) plus flavor commands (mood GIFs, rules
links). Node.js + discord.js v14. Deployed on **Railway**.

## Critical: Node version

This project targets **Node 20–22** (`engines` in `package.json`, pinned in `.nvmrc` → 22).

- **Node 26+ breaks the bot.** Puppeteer 22's transitive dep `yargs@17` fails to load under
  Node 26's module loader, and since `bot.js` eagerly requires Puppeteer (via
  `calendar-commands` → `screenshot-helper`), the bot crashes at startup.
- The system Node on the dev machine (CachyOS/Arch `nodejs` package) may be too new. Use
  `fnm` to run Node 22. fnm auto-switch on `cd` is intentionally **not** configured — activate
  per shell: `fnm env --shell fish | source; and fnm use`. Or one-off: `fnm exec --using=22 <cmd>`.

## Architecture

- `src/bot.js` — entry point; wires Discord client + `interactionCreate` routing to command handlers.
- `src/deploy-commands.js` — registers slash commands (global, or guild-scoped if `GUILD_ID` set).
- `src/commands/<feature>/<feature>-commands.js` — one module per command group
  (confirm, calendar, react, rules, showtheway).
- `src/utils/` — `screenshot-helper.js` (Puppeteer/Chromium), `schedule-helper.js` (Saturday/NZ time logic).
- `src/constants.js` — shared config: `DndMoods`, `DndRules`, schedule constants, etc.

## Key dependencies & quirks

- **GIFs use the Giphy API** (`GIPHY_API_KEY`), not Tenor. Tenor was dropped because Google
  shut down the Tenor API on 2026-06-30. See `src/commands/react/react-commands.js`
  (`/v1/gifs/search`). The `/react` command degrades gracefully if the key is missing/the API errors.
- **`undici` is pinned to `6.27.0`** via `overrides` in `package.json` to clear security
  advisories without downgrading discord.js. Keep the override when bumping discord.js.
- **Puppeteer** downloads Chromium via an install script. `package.json` has an `allowScripts`
  entry permitting it (newer npm gates install scripts by default).

## Environment variables

`DISCORD_TOKEN`, `CLIENT_ID`, `GOOGLE_SHEETS_URL`, `PLAYERS_ROLE_ID`, `GIPHY_API_KEY`,
optional `GUILD_ID`. Local values live in `.env` (gitignored). **Railway has its own env vars** —
changes to `.env` do not propagate to production; update Railway separately.

## Common tasks

- Run locally: `npm start` (after activating Node 22).
- Register slash commands: `npm run deploy` (set `GUILD_ID` in `.env` for instant guild-scoped updates).
- A GitHub Action refreshes global commands daily (`.github/workflows/deploy-commands.yml`).

## No test suite

`npm test` is a placeholder. Verify changes by loading modules under Node 22 and/or running the bot.
