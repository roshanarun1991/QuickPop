# QuickPop QA specification

## Release gates

1. Engine/content tests pass.
2. Browser suite passes on 1440, 1024, 768, 390 and 320-pixel widths.
3. Accessibility scans report no WCAG A/AA violations on checked screens.
4. One local room supports 200 players and WebSocket connections; the next player is refused.
5. Cloudflare deployment succeeds on the free plan.
6. A real game on the public HTTPS site works in independent host and player sessions, including refresh, reveal, final score, rematch and close.

Local results do not satisfy gates 5–6. Do not label a repository upload as a successful multiplayer deployment.

## Engine and content

| Area | Acceptance |
| --- | --- |
| Packs | 20 valid packs, 200 unique questions; 2–4 distinct options, valid correct indices, explanations and source references. |
| Daily | Five distinct questions; deterministic by UTC date; a new date changes the selection. |
| Inputs | Reject missing/oversized quizzes, duplicate answers, unsafe/long names and invalid choices. |
| PIN | Four characters including leading zero; host token unrelated to PIN. |
| Timing | Reject answers before start, after deadline or for an old question. |
| Answer lock | First valid answer is immutable; client-supplied timing never determines points. |
| Reveal | No answer key, fact, correctness or new score in active-question payloads. Reveal exactly once at deadline. |
| Scoring | 1000–500 base points, zero for wrong/missing answers, 10%/20% streak bonus, optional 1000-point accuracy mode. |
| Ranking | Score descending, then total answer time ascending. |
| Multi-select | Exact set required, order independent, partial answer earns zero. |
| Rematch | Retains players and series wins; clears round answers/scores and reorders questions. |
| Expiry | Room lifetime cannot outlast the registry PIN reservation. |

## HTTP and multiplayer integration

- Create, join, invalid nickname, room full and late-join rejection.
- 200 players behind one simulated office network can join; successful lookups are not mistaken for PIN guesses.
- 200 player sockets receive consistent lobby state.
- Invalid authentication gets no room state.
- Player cannot advance; host can advance, rematch, kick in lobby and close.
- Cross-origin requests and oversized bodies are rejected.
- Closure removes room data and refuses further joins.

## Browser journeys

- Find every pack; search, empty state, clear and category filters.
- Day/night switch persists after reload; default follows system theme.
- No document-level horizontal overflow at five tested widths.
- Numeric PIN input, leading zeros, safe nickname rendering and avatar selection.
- Quiz builder: invalid input feedback, import, literal HTML text, reorder, duplicate and preview.
- Daily five-question completion; first results survive refresh.
- Host creates room and QR; player joins independently.
- Answer locks; refresh reconnects; timed reveal; leaderboard; final podium; rematch; closure.
- No unhandled JavaScript errors.
- Axe checks: light/dark home, mobile join, daily results, mobile reveal and host podium.

## Manual and post-deployment checks

- Inspect desktop and phone screenshots in both themes.
- Check focus order and focus visibility with a keyboard; verify buttons do not rely on colour alone.
- Check QR with a real phone camera and the public HTTPS URL.
- Run a real two-device game on a normal workplace network.
- Disconnect/reconnect a player briefly; confirm score and locked answer remain.
- Try result text sharing and PNG download on the intended phones.
- Confirm free plan, actual Workers URL and namespace creation in Cloudflare.
- Confirm privacy copy, room expiry and no analytics requests.
- Review festival/culture wording with willing colleagues before adding more such packs.

## Evidence

Tests produce `test-results/browser-report.json`, screenshots and terminal test summaries. The release notes must distinguish automated local evidence from actual public deployment checks.

### Local release run — 20 October 2026

- 19 engine/content tests passed.
- 117 browser checks passed across five viewport widths, with no unhandled JavaScript exceptions.
- Six axe scans passed with zero violations on the checked screens.
- 12 server integration checks passed, including 200 simultaneous authenticated player connections.
- Offline cached homepage/practice and Daily Pop with blocked browser storage passed.
- A complete six-question game, refresh recovery, timed reveals, podium, rematch and host closure passed using independent browser sessions.
- PNG result download passed; phone reveal and result image inspected visually.
- Dependency audit reported zero known vulnerabilities at installation.

**Pending:** Cloudflare authorization/deployment, public HTTPS game verification, real phone-camera QR scan and workplace-network testing. Automated accessibility checks are not a full assistive-technology audit. The load test verifies room capacity and connected lobby delivery, not sustained production throughput.

### Layout update

Removed the decorative hero card and slogan strip. Added a centred introduction, spaced result note and persistent Powered by RANS credit. The credit types and erases with reduced-motion support. All 20 packs now have 10 questions and offer 6 or 10 per hosted game. Tests cover both lengths without repeats and the animated footer across routes.
