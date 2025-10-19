<div align="center">
  <img src="RustyNail.png" alt="The Rusty Nail logo" width="160" />
  <h1>The Rusty Nail</h1>
  <p><em>Discord companion bot for our D&D server</em></p>

  <!-- Badges -->
  <p>
    <a href="https://nodejs.org/">
      <img alt="Node.js" src="https://img.shields.io/badge/Node.js-≥18.x-informational" />
    </a>
    <a href="https://discord.com/developers/docs/intro">
      <img alt="Discord API" src="https://img.shields.io/badge/Discord%20API-slash%20commands-5865F2" />
    </a>
    <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey" />
  </p>
</div>

---

## Table of Contents
- [Overview](#overview)
- [Slash Commands](#slash-commands)
- [Environment Variables](#environment-variables)
  - [Where to get the keys](#where-to-get-the-keys)
- [Local Development](#local-development)
- [Deploy Slash Commands Locally (Guild Scope)](#deploy-slash-commands-locally-guild-scope)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Troubleshooting](#troubleshooting)

## Overview
The Rusty Nail is a small utility bot that helps run weekly game-night logistics (confirmation polls, calendar links and screenshots) and adds a touch of flavor with mood-based GIFs and quick links to rules references. 【7†source】

## Slash Commands
<details>
<summary><strong>Quick reference</strong></summary>

| Command | Purpose |
|---|---|
| <code>/nail confirm prompt [date] [time] [tag]</code> | Post a confirmation message for the requested Saturday (defaults to the next upcoming Saturday at 8 PM NZ). Optional <code>date</code> (ISO <code>YYYY-MM-DD</code> from the next four Saturdays), <code>time</code> (half‑hour slots from 5 PM–9 PM NZ), and <code>tag</code> (boolean to mention the players role). |
| <code>/nail confirm list [time] [tag]</code> | List the next four scheduled Saturdays in a numbered message with the same optional time/tag overrides and adds emoji reactions. |
| <code>/nail calendar link</code> | Reply with the shared Google Sheet URL. |
| <code>/nail calendar pic [size]</code> | Capture a screenshot of the calendar (<code>small</code>/<code>large</code>). Defaults to small. |
| <code>/nail react mood &lt;mood&gt;</code> | Post a D&D-themed GIF with moods: excited, worried, scared, happy, sad, angry. |
| <code>/nail rules phb</code> | Link to the 2024 Player’s Handbook. |
| <code>/nail rules class &lt;class&gt;</code> | Link directly to the selected class section (Cleric, Druid, Ranger, Rogue, Wizard). |
</details>

<sup>Source: original command list.</sup>【7†source】

---

## Environment Variables
Create a `.env` file (already ignored by git) with:
- `DISCORD_TOKEN` – Bot token from the Discord Developer Portal.
- `CLIENT_ID` – Application (bot) client ID.
- `GOOGLE_SHEETS_URL` – Spreadsheet URL for the calendar.
- `PLAYERS_ROLE_ID` – Role ID to mention when `tag` is true.
- `TENOR_API_KEY` – Tenor GIF API key.
- *(Optional)* `GUILD_ID` – Populate only for guild‑scoped deploys during local testing.

<sup>Source: original env var section.</sup>【7†source】

### Where to get the keys
- **Discord credentials:** Developer Portal → Applications → your bot → **Bot** (token) and **OAuth2 → General** (client ID). Copy the role ID by right‑clicking the role in Discord with Developer Mode enabled.
- **Tenor API key:** See Google’s Tenor quickstart and create an API key under **Credentials**.
- **Google Sheets URL:** Share the target sheet and use the published viewable URL. 【7†source】

---

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure `.env` contains the required keys.
3. Start the bot:
   ```bash
   npm start
   ```
   The bot logs in using `DISCORD_TOKEN` and responds to slash commands. 【7†source】

---

## Deploy Slash Commands Locally (Guild Scope)
Guild deploys are useful when iterating on command structure:
1. Add `GUILD_ID` to `.env` (or export it in your shell) with the testing server ID.
2. Run:
   ```bash
   npm run deploy
   ```
3. Commands update instantly for that guild. Remove or unset `GUILD_ID` to revert to global deploys. 【7†source】

---

## GitHub Actions Workflow
The scheduled workflow lives at `.github/workflows/deploy-commands.yml`. It runs daily at 00:00 UTC (and can be triggered manually) to refresh the global slash commands.

### Setup
1. In GitHub, open **Settings → Secrets and variables → Actions**.
2. Add repository secrets:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - *(Optional)* `GUILD_ID` for guild‑scoped deploys. Otherwise leave it unset for global commands.
3. The workflow checks out the repo, installs with `npm ci`, and runs `npm run deploy`. 【7†source】

---

## Troubleshooting
- **Commands not updating?** If you previously set `GUILD_ID`, make sure it’s unset for global deploys. Then re‑run `npm run deploy` or the scheduled workflow.
- **Calendar screenshot issues?** Confirm the `GOOGLE_SHEETS_URL` is a viewable/published URL and the bot has network access.
- **GIFs not appearing?** Verify your `TENOR_API_KEY` and that Tenor API access is enabled in your Google Cloud project.

---