# J.A.R.V.I.S Mobile Edition

A mobile-first personal AI assistant built with vanilla HTML, CSS and JavaScript. Designed to be edited from a phone and deployed with GitHub Pages. Optional scheduled Telegram briefings run on Cloudflare Workers.

## Features

- Gemini-powered chat and image understanding
- Browser speech recognition and text-to-speech
- Local conversation memory and personal notes
- Fifteen client-side tools: time, weather, timer, dice/coin, jokes, quotes, tech news, Telugu translation, currency, dictionary, password generation, Wikipedia, app links, YouTube search and crypto prices
- Goal mode that plans a task, runs supported read-only tools and summarizes results
- Installable PWA with offline app shell
- Optional Telegram morning briefing through a Cloudflare Worker

## Quick start (phone-friendly)

1. Open this repository in GitHub and enable **Settings → Pages → Deploy from a branch → main → / (root)**.
2. Wait for the Pages deployment to finish.
3. Open `https://akarshbantu58-hub.github.io/Jk/frontend/` in Chrome.
4. In **Settings**, paste your own Gemini API key. It is stored only in this browser's local storage and is sent to Google's Gemini API when you chat. Never paste it into a source file or GitHub.
5. Allow microphone/camera/location permissions only when using those features.

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/). The app currently uses the Gemini `generateContent` REST endpoint and the `gemini-3.8-flash` model. Model availability and account quotas are controlled by Google.

## Security and privacy

- No API key, Telegram token or chat ID is included in this repository.
- The browser key is stored locally on the device. Anyone with access to that browser profile may be able to use it; clear site data to remove it.
- Browser-side API keys are convenient for a personal prototype, not a hardened public multi-user service. For a public deployment, put Gemini requests behind a server-side proxy with rate limits and abuse protection.
- Conversation memory and reminders stay in this browser's local storage. Clearing browser data removes them.
- The optional Worker uses Cloudflare secrets named `TOKEN` and `CHAT_ID`; never commit those values.
- The experimental wake-word mode works only while the app is open and the browser supports continuous speech recognition. It is not an always-on background assistant.

## Optional Telegram automation

1. Deploy `functions/worker.js` as a Cloudflare Worker.
2. Add Worker secrets `TOKEN` and `CHAT_ID` (create a bot with Telegram's official @BotFather and send it /start first).
3. Add environment variables `WEATHER_LAT` and `WEATHER_LON` if you want a location other than the default.
4. Add a Cron Trigger: `30 1 * * *` (07:00 India Standard Time).
5. Test with a temporary schedule, then restore `30 1 * * *`.

The Worker sends a weather and AI-news briefing to the configured Telegram chat. It does not read private messages.

## Project structure

```
frontend/
  index.html
  styles.css
  app.js
  manifest.json
  sw.js
  icon.svg
functions/
  worker.js
LICENSE
README.md
```

## Limitations

- Speech recognition, camera access, geolocation and PWA installation depend on browser support and HTTPS.
- A browser PWA cannot guarantee background microphone listening on Android. Tap-to-talk is the reliable mode.
- Some third-party public APIs may be rate-limited or unavailable in certain regions.
- The agent only executes the app's explicitly supported tools; it does not perform purchases, send messages, or make changes to external accounts.

## License

MIT. See [LICENSE](LICENSE).
