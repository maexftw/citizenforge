import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234/v1/chat/completions";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function generateBuildWithGemini(ship: any, goal: string) {
  if (!GEMINI_API_KEY) return null;

  const genAI = new GoogleGenAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a Star Citizen loadout optimizer.
Analyze the following ship data and provide the BEST buyable loadout for the goal: "${goal}".

SHIP DATA:
Name: ${ship.name}
Manufacturer: ${ship.manufacturer?.name}
Focus: ${ship.focus}
Hardpoints/Compiled Slots: ${JSON.stringify(ship.compiled)}

CONSTRAINTS:
1. ONLY use components that fit the slot sizes (Size 1, 2, 3, etc.).
2. ONLY use components available in the current Star Citizen 3.24/4.0 patches (buyable at shops like Dumper's Depot, Center Mass, etc.).
3. Prioritize: ${goal}.

Return the result as a raw JSON object (no markdown) matching this structure:
{
  "ship": "${ship.name}",
  "goal": "${goal}",
  "components": [
    { "name": "Component Name", "type": "Shield/Weapon/etc", "size": 1, "location": "City Name", "shopName": "Shop Name", "description": "Why this one?" }
  ],
  "totalCost": 0,
  "route": ["Starting Point", "Shop Location 1", "Shop Location 2"],
  "totalJumps": 0,
  "estimatedTravelTime": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error(`Gemini failure for ${ship.name}:`, error);
    return null;
  }
}

async function generateBuildWithLMStudio(ship: any, goal: string) {
  const prompt = `You are a Star Citizen loadout optimizer. Return JSON ONLY.
Analyze: ${ship.name} for goal: ${goal}.
Data: ${JSON.stringify(ship.compiled)}
Structure: { ship, goal, components: [{name, type, size, location, shopName, description}], totalCost, route, totalJumps, estimatedTravelTime }`;

  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "local-model",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    const result: any = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    // console.error(`LM Studio connection failed (ensure it is running at ${LM_STUDIO_URL})`);
    return null;
  }
}

async function main() {
  const rawShipsPath = path.join(process.cwd(), 'data/raw_ships.json');
  if (!fs.existsSync(rawShipsPath)) {
    console.error("raw_ships.json not found. Run npm run collect-data first.");
    return;
  }

  const rawShips = JSON.parse(fs.readFileSync(rawShipsPath, 'utf-8'));
  const goals = ["Maximum DPS Combat", "High-Endurance Stealth", "Fastest Quantum Travel", "Budget Balanced"];
  const offlineBuilds: any[] = [];

  const publicDataDir = path.join(process.cwd(), 'public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  console.log(`Starting optimization pipeline...`);
  if (GEMINI_API_KEY) {
    console.log("Using Gemini API for generation.");
  } else {
    console.log(`Attempting to use LM Studio at ${LM_STUDIO_URL}`);
  }

  // To avoid huge costs/time during testing, we'll process a subset if not specified
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : rawShips.length;
  const subset = rawShips.slice(0, limit);

  for (const ship of subset) {
    console.log(`Optimizing ${ship.name}...`);
    for (const goal of goals) {
      let build = await generateBuildWithGemini(ship, goal);
      if (!build) {
        build = await generateBuildWithLMStudio(ship, goal);
      }

      if (build) {
        offlineBuilds.push(build);
        process.stdout.write(".");
      } else {
        process.stdout.write("x");
      }
    }
    console.log("");
  }

  if (offlineBuilds.length > 0) {
    fs.writeFileSync(
      path.join(publicDataDir, 'offline_builds.json'),
      JSON.stringify(offlineBuilds, null, 2)
    );
    console.log(`\nSuccessfully generated ${offlineBuilds.length} builds in public/data/offline_builds.json`);
  } else {
    console.warn("\nNo builds were generated. Ensure LM Studio is running or GEMINI_API_KEY is set.");
  }
}

main();
