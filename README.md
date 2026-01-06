<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI-Driven Smart Traffic Management

A small demo app that simulates and visualizes AI-assisted traffic control, with live density, phase queues, and an analyst component.

View the app in AI Studio: https://ai.studio/apps/drive/19k1aA0SWnNJqnxcEW6NSUqx55Xu0nSwo

## Features
- Local development with Vite + React + TypeScript
- Simulation hooks and visual components for traffic intersections
- Integration point for Gemini (set `GEMINI_API_KEY`) to enable AI-driven analysis

## Prerequisites
- Node.js (16+ recommended)
- A Gemini API key (optional — required for AI features)

## Quickstart
1. Install dependencies

```bash
npm install
```

2. Provide your Gemini API key (optional, used by AI features)

- Create a `.env.local` file in the project root with:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

- Or on Windows PowerShell for a quick temporary value:

```powershell
$env:GEMINI_API_KEY="your_gemini_api_key_here"
npm run dev
```

3. Run the dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

5. Preview the production build

```bash
npm run preview
```

## Project Structure
- `App.tsx` — root app component
- `index.tsx`, `index.html` — app entry and HTML template
- `vite.config.ts`, `tsconfig.json`, `package.json` — build tooling
- `components/` — UI components: `AIAnalyst.tsx`, `Dashboard.tsx`, `Intersection.tsx`, `LiveDensity.tsx`, `PhaseQueue.tsx`
- `hooks/useTrafficSimulation.ts` — simulation logic
- `constants.ts`, `types.ts` — shared types and constants

## Enabling AI features
The AI features call Gemini; ensure `GEMINI_API_KEY` is set. Without it, the app still runs but AI-driven analysis will be disabled or mocked.

## Development notes
- This project uses Vite for fast HMR during development.
- Tests: (none included) — add your preferred test runner if needed.

## Contributing
- Open issues or PRs for bugs, enhancements, or documentation updates.

## License
MIT

---
If you want, I can also:
- run the app locally and verify it starts
- add a sample `.env.local.example` file
Tell me which you'd like next.
