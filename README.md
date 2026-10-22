# QuickPop — big quiz energy

A party-ready quiz for colleagues, friends and family. No accounts; join with a four-digit PIN and a nickname. Styled with Bite Rate's colours, typography, bold borders and hard shadows.

## What works

26 original quiz packs / 520 questions (plus owner-approved generated packs); live host and phone views; PIN and QR lobby; server-timed scoring; reconnects; host controls; per-question leaderboards; podium; rematches; accuracy scoring; Daily Pop; untimed solo practice; private quiz builder; result sharing; dark mode.

See [DESIGN_REVIEW.md](DESIGN_REVIEW.md) for the review and deliberately deferred features, and [QA.md](QA.md) for checks and deployment acceptance.

## Public GitHub Pages edition

The site at https://roshanarun1991.github.io/QuickPop/ is built and published by GitHub Actions after QA. It supports 6- or 10-question solo rounds, Daily Pop, the private builder, result sharing and themes. Join a Quiz, PIN/nickname/avatar entry and hosting setup are visible. New games use individual scores; team selection is hidden for now. A clear notice explains that creating or joining a live room requires the multiplayer service; attempted submissions display this notice without making unavailable API requests. Publishing raw source from a branch will not work: use the Actions source and the bundled dist artifact.

## Runs without your computer

The published solo website runs on **GitHub Pages**. Quiz generation runs on GitHub Actions using an open-source model on the runner. Neither needs your computer. Multiplayer is prepared for **Cloudflare Workers + SQLite Durable Objects**, but Cloudflare connection and deployment are still pending. No paid AI API key is required.

The multiplayer service is not deployed until `wrangler deploy` succeeds and the live checks below pass. A GitHub source repository alone does not host the live rooms.

## Local development

Requires Node 24+ (Node LTS recommended).

```sh
npm ci
npm run build
npm run dev
```

Open the local address printed by Wrangler. Use separate browser profiles/phones for host and player sessions. Local development binds to your computer; use the deployed HTTPS address for actual colleagues.

## Deploy once

Confirm the account is on **Workers Free**, then:

```sh
npx wrangler login --scopes account:read user:read workers:write workers_scripts:write
npm run deploy
```

Approve the browser login yourself. `wrangler.toml` selects the owner's Cloudflare account. The first deployment creates the SQLite Durable Object namespaces and publishes static assets. No KV ID copying, database provisioning or administrator secret is needed for this app.

Open the printed `https://quickpop.<account-subdomain>.workers.dev` address. Host a six-question room, join from a second device, answer, reconnect, finish and rematch. See QA.md before announcing it to colleagues.

## Automatic checks and future deployment

The GitHub workflow runs engine tests, builds assets, runs the local Worker, tests 200 connected players and runs browser/accessibility checks on every push.

For automatic production updates, either connect this GitHub repository in Cloudflare Workers Builds, or add a scoped `CLOUDFLARE_API_TOKEN` to GitHub Actions secrets and set the repository variable `CLOUDFLARE_DEPLOY` to `true`. The workflow's deployment job is disabled until that variable is set. Keep API tokens out of files and commits.

This optional update automation is separate from runtime hosting: a deployed site continues to run even when deployment automation is not configured.

## Checks

```sh
npm test
npm run build
npx playwright install chromium
# Start npm run dev in another terminal, then:
node integration-tests.mjs
npm run test:browser
```

`test-results/browser-report.json` and screenshots record browser results. Integration load tests refuse non-local URLs unless `ALLOW_LIVE_QA=yes` is explicitly set. Do not point the 200-player load test at production during a quiz night.

## Add or edit questions

Edit `quiz-bank.js`. Each pack includes a category, colour, icon, original questions, answer indices, short explanations and a source URL. The bank varies option order for practice; the server shuffles again for live rooms. Run `npm test` after editing.

The private builder saves drafts on-device. Export JSON as a backup or to transfer a quiz. Losing the browser data loses unexported drafts. Custom quizzes are sent to the server only when you host them.

## Privacy and practical limits

- No account, ads, analytics SDKs or external font requests.
- Nicknames, answers and scores exist on the server during a live room. Secret recovery tokens stay in the browser and are never placed in share links.
- Room data expires after two hours maximum or ten minutes after finishing; host close deletes it immediately.
- Basic English nickname filtering is not comprehensive moderation. A host can remove players from the lobby. Four-digit PINs are intentionally easy to share and guess.
- Host/player authorization and scores are server-controlled. Speed scoring still reflects network delay; use accuracy mode for relaxed or geographically distributed groups.
- Daily Pop switches at midnight UTC. Streaks/results are local to a browser.
- Rematches reuse and reorder the pack's questions; they do not invent a new question set.
- Free Cloudflare quotas may stop requests if exceeded. No script upgrades the plan.
- Local 200-player QA is not a guarantee of 1,000 simultaneous rooms or performance on every corporate network.

Font licenses are included in the built assets. Runtime dependencies and tooling are recorded in `package-lock.json`.

## Topics, difficulty and admin

Food illustrations, logo marks and flag diagrams are bundled locally, with optional text clues. Artists use album and career clues. Capitals, currencies and science join the existing pop-culture packs. Each curated pack has ten Easy and ten Hard questions; selecting difficulty changes the bank used in both solo and live games. Search supports topic aliases and keyboard suggestions. Unknown searches show Coming soon. See [MEDIA_CREDITS.md](MEDIA_CREDITS.md).

Open `#admin` using the owner-provided passcode. Enter a topic and difficulty, prepare a request, then confirm the prepared issue while signed into GitHub as the repository owner. The free model may take several minutes (up to the 25-minute job limit). Return to Admin and check for the ten-question draft. Review every answer and explanation, tick the review box, then confirm publication on GitHub. QA must pass before Pages deploys.

The client passcode is a convenience gate, not secure server authentication. GitHub owner checks authorize jobs; no GitHub credential is stored in the website. Topics, requests and drafts are public. Avoid confidential workplace information. AI output can contain factual errors: schema checks cannot establish truth. Use the inline review editor to correct any question, choices, answer or explanation before publication. The prepared GitHub request includes the corrected quiz. Builder exports remain private. There is no paid fallback. Standard GitHub-hosted jobs in this public repository are used; availability and GitHub usage policies still apply.

The agent retrieves a public Wikipedia reference, then uses `qwen2.5:3b` through Ollama. Each generated question must include an exact excerpt containing its answer; Admin shows the source link and excerpt for review. This evidence check reduces unsupported content but cannot prove the question or answer is correct. Wikipedia material is attributed under CC BY-SA 4.0. It does not use the retired GitHub Models API. Agent publication calls the reusable QA workflow explicitly because pushes made using GITHUB_TOKEN do not trigger ordinary push workflows.

Generation uses two small model batches. If the model cannot supply ten supported items, the agent completes the draft with source-based fill-the-gap questions using names from the reference. These are marked `reference-clue` in the saved JSON. All questions still require owner review; topics with insufficient reference material fail clearly instead of inventing facts.
