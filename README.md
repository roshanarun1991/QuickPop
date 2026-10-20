# QuickPop — big quiz energy

A party-ready quiz for colleagues, friends and family. No accounts; join with a four-digit PIN and a nickname. Styled with Bite Rate's colours, typography, bold borders and hard shadows.

## What works

20 original quiz packs / 200 questions; live host and phone views; PIN and QR lobby; server-timed scoring; reconnects; host controls; per-question leaderboards; podium; rematches; optional teams and accuracy scoring; Daily Pop; untimed solo practice; private quiz builder; result sharing; dark mode.

See [DESIGN_REVIEW.md](DESIGN_REVIEW.md) for the review and deliberately deferred features, and [QA.md](QA.md) for checks and deployment acceptance.

## Runs without your computer

The entire site, room registry and multiplayer game server run on **Cloudflare Workers + SQLite Durable Objects**. Closing your computer does not stop it. GitHub stores the source and runs automated QA. There are no Google, AI or paid content APIs.

The website has not been deployed until `wrangler deploy` succeeds and the live checks below pass. A GitHub source repository alone does not host the live rooms.

## Local development

Requires Node 22+ (Node LTS recommended).

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
