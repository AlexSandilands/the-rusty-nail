# The Rusty Nail
Discord companion bot for our D&D server. This document covers the available slash commands, environment setup, local workflows, and the GitHub Actions deployment job.

## Slash Commands
- `/nail confirm prompt [date] [time] [tag]` – Post a confirmation message for the requested Saturday (defaults to the next upcoming Saturday at 8 PM NZ). Optional `date` ( ISO `YYYY-MM-DD` from the next four Saturdays), `time` (half-hour slots from 5 PM–9 PM NZ), and `tag` (boolean to mention the players role).
- `/nail confirm list [time] [tag]` – List the next four scheduled Saturdays in a numbered message with the same optional time/tag overrides and adds emoji reactions.
- `/nail calendar link` – Reply with the shared Google Sheet URL.
- `/nail calendar pic [size]` – Capture a screenshot of the calendar (`small`/`large`). Defaults to small.
- `/nail react mood <mood>` – Post a D&D-themed GIF with moods: excited, worried, scared, happy, sad, angry.
- `/nail rules phb` – Link to the 2024 Player’s Handbook.
- `/nail rules class <class>` – Link directly to the selected class section (Cleric, Druid, Ranger, Rogue, Wizard).

## Environment Variables
Create a `.env` file (already ignored by git) with:
- `DISCORD_TOKEN` – Bot token from the Discord Developer Portal.
- `CLIENT_ID` – Application (bot) client ID.
- `GOOGLE_SHEETS_URL` – Spreadsheet URL for the calendar.
- `PLAYERS_ROLE_ID` – Role ID to mention when `tag` is true.
- `TENOR_API_KEY` – Tenor GIF API key (see below).
- *(Optional)* `GUILD_ID` – Populate only when you want guild-scoped deploys during local testing.

### Where to get the keys
- **Discord credentials:** Developer Portal → Applications → {your bot} → *Bot* (token) and *OAuth2 → General* (client ID). Copy the role ID by right-clicking the role in Discord (Developer Mode must be enabled).
- **Tenor API key:** Follow Google’s Tenor quickstart (<https://developers.google.com/tenor/guides/quickstart>), enable the Tenor API for a Google Cloud project, and create an API key under *Credentials*.
- **Google Sheets URL:** Share the target sheet and use the published viewable URL.

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
   The bot logs in using `DISCORD_TOKEN` and responds to slash commands.

## Deploy Slash Commands Locally (Guild Scope)
Guild deploys are useful when iterating on command structure:
1. Add `GUILD_ID` to `.env` (or export it in your shell) with the testing server ID.
2. Run:
   ```bash
   npm run deploy
   ```
3. Commands update instantly for that guild. Remove or unset `GUILD_ID` to revert to global deploys.

## GitHub Actions Workflow
The scheduled workflow lives at `.github/workflows/deploy-commands.yml`. It runs daily at 00:00 UTC (and can be triggered manually) to refresh the global slash commands.

### Setup
1. In GitHub, open **Settings → Secrets and variables → Actions**.
2. Add repository secrets:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - *(Optional)* `GUILD_ID` only if you want the workflow to perform guild-scoped deploys; otherwise leave it unset for global commands.
3. The workflow handles checkout, installs with `npm ci`, and runs `npm run deploy`.

To run the workflow locally (for troubleshooting), mimic the same steps: export the secrets and call `npm run deploy`.
