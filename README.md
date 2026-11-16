# Dyod

A small, fast chatbot that answers questions about the **Design Your Own Degree (DYOD)** programme at IUST (Islamic University of Science & Technology). Short answers, simple English. No login, no admin, no backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # retrieval tests
npm run build    # type-check + production build into dist/
```

## How it works

- **Stack:** Vue 3, Vite, TypeScript. Font: Inter Tight (self-hosted). About 57 KB of JavaScript, gzipped.
- **Answers:** `src/lib/knowledge.ts` holds every fact, written in plain English. `src/lib/search.ts` scores the question against it (BM25-style, with synonyms, typo repair and exact rules for "basket 3", "semester 2", course names). If nothing matches well, Dyod says so instead of guessing. Everything runs in the browser, so replies are instant and nothing is invented.
- **The blob:** the animated avatar from [bloub](https://github.com/jeremy-prt/bloub) by Jérémy Perret (MIT, see `THIRD_PARTY_LICENSE_bloub.txt`). Engine in `src/bot/`, mood logic in `src/components/BotAvatar.vue`.

| Moment | Blob |
|---|---|
| Resting | Eyes follow your cursor |
| You type | Eyes open wide |
| Dyod thinks | Three pulsing dots |
| Answer found | Wink |
| No answer in the documents | "!" |
| You click it | Bursts |
| Left alone for 1 minute | Falls asleep |

## Sources

- IUST DIC slides, *4 year BS programme through DYOD mode* (27 Apr 2024)
- IUST DIC slides, *Design your own degree @IUST* (29 May 2025). **Newer, so used first.** Answers mention the 2024 plan where it differed (for example 5 baskets and 7 majors in 2024, 8 baskets and 10 majors in 2025).
- IUST Design Innovation Centre page, IUST DYOD activity report (2025), Rising Kashmir launch report (2023)

Not in any source, so Dyod says "I don't know": fees, seats, dates, placements, hostel, UGC recognition.

## Updating the answers

Edit `src/lib/knowledge.ts` (facts) or `src/lib/courses.ts` (baskets and courses). Add a question to `src/lib/search.test.ts` and run `npm test`.
