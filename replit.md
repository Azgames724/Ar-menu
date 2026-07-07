# Dagi Fast Food — Interactive 3D & AR Menu

A React + Express app exported from Google AI Studio. It's an Amharic-language restaurant menu app with interactive 3D model viewing and AR inspection of menu items.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router
- **Backend:** Express (serves Vite in dev mode; serves `dist/` in production)
- **AI:** Google Gemini API (`@google/genai`)
- **3D/AR:** `@google/model-viewer`
- **Animations:** Motion (Framer Motion)

## Running the app

```bash
npm run dev
```

The server starts on port 5000 (configured via `server.ts`). Vite runs in middleware mode — no separate frontend process needed.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (set as a Replit Secret) |

## Key files

- `server.ts` — Express server; runs Vite in dev, serves `dist/` in production
- `src/App.tsx` — Root React component and routing
- `src/data/menu.ts` — Menu item data (Amharic + English)
- `vite.config.ts` — Vite config; injects `GEMINI_API_KEY` at build time
- `public/qhom/` — 3D model (.glb) and image assets for menu items

## Building for production

```bash
npm run build   # bundles frontend + server
npm start       # runs the compiled server
```

## User preferences

- Keep project structure as imported from AI Studio.
