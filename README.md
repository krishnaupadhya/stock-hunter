# agents-hub

A small, extensible hub for automation agents that run on a manual click or a
schedule — no paid services required.

Current agent: **tradingview-pe-scanner** — pulls a TradingView India stock
scan and writes it into a Google Sheet.

---

## How it's structured

```
src/
  core/            <- shared plumbing: Sheets auth, logging, the Agent interface
  agents/
    tradingview-pe-scanner/   <- fetch.ts, transform.ts, index.ts
  runAgent.ts      <- generic CLI: `npm start -- --agent=<name>`
.github/workflows/ <- one workflow file per agent (manual + cron trigger)
```

Every agent implements the same tiny interface (`core/types.ts`):
`{ name, run() }`. `runAgent.ts` never needs to change when you add a new
agent — you just register it.

---

## Part 1 — Google Cloud: create a Service Account (one-time, free)

1. Go to https://console.cloud.google.com/ and create a project (or reuse one).
2. **APIs & Services → Library** → search "Google Sheets API" → **Enable**.
3. **APIs & Services → Credentials** → **Create Credentials → Service Account**.
   - Give it any name, e.g. `sheets-writer`. No roles needed at the project
     level — access is granted per-sheet in step 5.
4. Open the new service account → **Keys** tab → **Add Key → Create new key
   → JSON**. This downloads a `.json` file — treat it like a password.
5. Open the JSON file. Copy two fields:
   - `client_email` → this is your `GOOGLE_CLIENT_EMAIL`
   - `private_key` → this is your `GOOGLE_PRIVATE_KEY` (keep the `\n`
     sequences exactly as they appear)
6. Open your target Google Sheet → **Share** → paste the `client_email` →
   give it **Editor** access. This is the step people most often forget —
   the API call will fail with a 403 without it.
7. Copy the spreadsheet ID out of the sheet's URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

Nothing here costs money — Service Accounts and the Sheets API are free.

---

## Part 2 — Run it locally

```bash
cd agents-hub
npm install
cp .env.example .env
# edit .env: paste GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID,
# and set SHEET_NAME to the exact worksheet tab name

npm start -- --agent=tradingview-pe-scanner
```

You should see log lines for fetch → row count → write, and the configured
worksheet tab will populate. `SHEET_NAME` defaults to `Sheet1`; set it to the
exact tab name if your spreadsheet uses a different one. If you get a 403,
re-check step 6 above. If you get an auth error, re-check that the private
key's `\n` characters made it into `.env` intact (quote the whole value, as in
`.env.example`).

---

## Part 3 — Wire up GitHub Actions (manual button + schedule, both free)

1. Push this repo to GitHub (public or private — Actions has a generous free
   tier on both; private repos get 2,000 free minutes/month, and this job
   runs in seconds).
2. **Repo → Settings → Secrets and variables → Actions → New repository
   secret**. Add three:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste it exactly as in your `.env`)
   - `SPREADSHEET_ID`
   - `SHEET_NAME`
3. Go to the **Actions** tab → you'll see "Agent - TradingView PE Scanner" →
   click **Run workflow** to trigger it manually right now.
4. It will also run automatically every hour at 7 minutes past the hour on the
   cron schedule in the workflow file (`7 * * * *`). Cron time is always
   **UTC**, so convert your local time first
   (e.g. https://crontab.guru helps write the expression).

That's it — manual trigger and scheduled trigger, zero hosting, zero cost.

---

## Part 4 — Adding your next agent (including LLM-powered ones)

1. Create `src/agents/<your-agent-name>/index.ts` implementing `Agent`:

   ```ts
   import type { Agent } from '../../core/types.js';

   export const myNewAgent: Agent = {
     name: 'my-new-agent',
     async run() {
       // fetch data, call an LLM, write to a sheet/file/API — whatever it does
     },
   };
   ```

2. Register it in `src/runAgent.ts`:

   ```ts
   import { myNewAgent } from './agents/my-new-agent/index.js';
   const registry: Record<string, Agent> = {
     [tradingviewPeScannerAgent.name]: tradingviewPeScannerAgent,
     [myNewAgent.name]: myNewAgent,
   };
   ```

3. Copy `.github/workflows/tradingview-pe-scanner.yml` to a new file, change
   the `name:`, the `cron:` schedule, and the `--agent=` value.

Nothing in `core/` or `runAgent.ts` needs to change — that's the point of
the shared interface.

### Free LLM options for future agents

If a future agent needs an LLM call, these have usable free tiers (check
current limits before relying on them, they change over time):

- **Google Gemini API** — free tier via Google AI Studio, generous request
  limits, good fit since you're already in the Google ecosystem here.
- **Groq API** — free tier, very fast inference, OpenAI-compatible SDK.
- **Ollama** — run an open-weight model entirely locally/self-hosted if you
  want zero API dependency (won't work inside GitHub Actions' hosted
  runners for anything but small models, due to CPU-only, limited RAM).

Whichever you pick, it slots into `core/` as e.g. `llmClient.ts`, the same
way `sheetsClient.ts` does now — one shared client, used by any agent that
needs it.
