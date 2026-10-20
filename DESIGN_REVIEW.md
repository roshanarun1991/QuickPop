# QuickPop: design review and launch decisions

## What carries over from Bite Rate

Cream canvas `#F3EAD5`, paper `#FFFAF0`, black ink `#161713`, pink `#FF5F91`, yellow `#FFD928`, cyan `#5DD9E7`, blue `#48A9F8`, green `#7FD06D`. Anton headings, Courier Prime labels and Arial body text. Square borders, solid offset shadows and playful flat colour; no copied brand artwork. Fonts are self-hosted.

## Improvements to the brief

| Original idea | Launch decision | Reason |
| --- | --- | --- |
| Show correct/wrong immediately | Lock immediately; reveal at the shared deadline | Prevents early players announcing the answer. |
| Speed scoring with latency compensation | Server arrival-time scoring, 1.5-second delivery lead-in; optional accuracy-only scoring | Client-reported latency can be manipulated. Avoid pretending network effects disappear. |
| Four-digit PIN | Serialized room registry plus independent secret host/player credentials | The PIN finds a room; it grants no host authority. |
| Automatic reveal and advance | Automatic reveal; host advances by default; optional auto-advance | Lets colleagues talk about an answer and keeps the presenter in control. |
| Flash green/red | Static feedback panels, words, shapes and check/cross marks | More comfortable for sensitive users and clearer without colour. |
| No personal data sent | Be precise: nicknames, answers and scores are sent for live play | Account-free does not mean server-free. |
| Return after a dropped connection | Reconnect with the same per-room device token | Refreshing keeps identity, score and a locked answer. |
| Two hours idle | Two-hour maximum session, or ten minutes after completion; host can close immediately | Bounds PIN reservations and data retention predictably. Start another room for longer sessions. |
| “Trending” quizzes | Curated topics, with no invented popularity counts | No analytics tracker or unsupported popularity claim. |
| Public creator publishing | Private, local builder with validated JSON import/export and live-room hosting | Public browsing needs reporting, moderation and abuse operations first. |
| AI-generated questions | Original curated bank and human-written private quizzes | No API key, billing dependency or unchecked AI answers at launch. |
| Server-rendered share card | Browser-generated PNG | No extra rendering service or personal result upload. |

## Implemented launch

- 20 packs, 200 questions, English first. Topic text is descriptive; no franchise logos or posters.
- Single choice, true/false, multi-select and a flag image question.
- Live PIN/QR lobby, optional host-as-player, avatar choice, duplicate-name checks, basic nickname filter, kick before start, locked rooms.
- Server-timed scoring, streak bonuses, tie-breaks, per-round answer counts and leaderboard, podium, rematch and series wins.
- Team totals as an optional extra. Teams are selected at join.
- Untimed practice for every pack; deterministic five-question Daily Pop, local streaks and first-completion results.
- Private builder: 3–20 questions, multi-select answers, duplicate/delete/move-up, saved draft, JSON import/export.
- Day/night mode, reduced motion, keyboard controls, colour + shape answer cues, optional sound and extra time.
- Text sharing and downloadable PNG result cards.
- Self-hosted assets and fonts; offline solo shell after the first successful visit.

## Deliberately deferred

Public community quizzes, public edit links, uploaded images, CSV import, AI generation, audio identification, wager rounds, power-ups, scheduled lobbies, translated packs, richer achievement profiles and seasonal pack rotation.

## Content care

The source bank records a reference URL per pack. Questions use original wording and stable facts. Festival questions acknowledge variation across communities. This has not been reviewed by a cultural advisory group; invite colleagues to flag wording or factual issues before expanding those packs. The 200-question bank provides changing daily combinations, not newly authored questions every day.

## Hosting and limits

Cloudflare Workers serves the website; SQLite Durable Objects coordinate games, WebSockets and expiry alarms. Hibernating WebSockets avoid keeping an idle server running. Neither a host computer nor a local AI model is required.

Use **Workers Free**. Free quotas are finite; exhausted limits can interrupt games. A single local room with 200 connected players is in the QA plan; 1,000 concurrent public rooms is not a verified launch claim. Public question banks and anonymous identities make this a social game, not a secure exam or prize competition.

References: [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [WebSocket hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).
