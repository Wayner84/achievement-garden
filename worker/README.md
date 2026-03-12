# Achievement Garden — Gateway Worker (optional)

This is a starter **Cloudflare Worker** you can deploy to provide two endpoints used by the frontend:

- `GET /search`
- `GET /achievements`

Right now it returns demo results (so the app works end-to-end). You can extend it to:
- query game databases (RAWG/IGDB/etc.)
- scrape public trophy sites server-side
- use Cloudflare AI / Browser Rendering / whatever you saw in the Cloudflare tweet

## Setup
```bash
cd worker
npm install
npm run dev
```

## Deploy
```bash
npm run deploy
```

Then set the deployed Worker URL in the app:
Settings → Data gateway (optional)
