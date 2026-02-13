# CitizenForge Development & Deployment

## 1. Deployment (Vercel)
The project is ready for Vercel.
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Add `VITE_GEMINI_API_KEY` in Vercel settings if you want to use the live AI engine.

## 2. Local Data Pipeline
To update the ship database or the offline build cache:

### Step A: Collect Ship Data
Fetches the latest data from the Star Citizen API.
```bash
npm run collect-data
```
*Requires `SC_API_KEY` in environment.*

### Step B: Generate Offline Builds
Generates the pre-calculated builds stored in `public/data/offline_builds.json`.
```bash
npm run generate-builds
```
**Options:**
- Uses **Gemini** if `VITE_GEMINI_API_KEY` is set.
- Falls back to **LM Studio** (localhost:1234) if no key is found.
- Use `LIMIT=5 npm run generate-builds` to test with only 5 ships.

## 3. Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS
- **Visualization:** D3.js (Starmap)
- **AI:** Google Gemini 1.5 Flash (Online) / LM Studio (Offline Build Generation)
