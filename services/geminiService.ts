import { GoogleGenAI, Type } from "@google/genai";
import { LoadoutBuild, OptimizationPriority } from "../types";
import * as scApi from './scApiService';

const getModel = () => {
  const API_KEY = process.env.API_KEY || "";
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  const genAI = new GoogleGenAI(API_KEY);

  const tools = [
    {
      functionDeclarations: [
        {
          name: "fetchShips",
          description: "Fetch a list of ships from the Star Citizen API. Supports pagination.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              page: { type: Type.NUMBER, description: "Page number to fetch" }
            }
          }
        },
        {
          name: "searchShip",
          description: "Search for a specific ship by name in the Star Citizen API.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the ship to search for" }
            },
            required: ["name"]
          }
        },
        {
          name: "fetchStarmap",
          description: "Fetch the list of star systems in the Stanton system.",
          parameters: { type: Type.OBJECT, properties: {} }
        }
      ]
    }
  ];

  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: tools as any,
  });
};

export const getBuildRecommendation = async (
  shipName: string | null,
  userIntent: string, 
  startLocation: string,
  priority: OptimizationPriority
): Promise<LoadoutBuild> => {
  const model = getModel();
  const prompt = `You are a Star Citizen loadout and logistics expert. 

  USER CONTEXT:
  - Current Location: "${startLocation}"
  - Selected Ship: "${shipName || 'None selected yet'}"
  - Intent: "${userIntent}"
  - Priority: ${priority === 'shortest' ? 'Shortest travel distance' : 'Lowest cost'}

  YOUR TASK:
  1. If no ship is selected or the user is asking for the "best" ship, use the API to search and compare ships based on their stats (speed, weapons, etc.).
  2. Once a ship is identified, recommend the best components (Shields, Weapons, Power Plant, Coolers, Quantum Drive) for the user's intent.
  3. Find shop locations for these components. (Note: If the API doesn't provide shop data directly, use your extensive knowledge of Star Citizen 3.24+).
  4. Create an optimized travel route starting from "${startLocation}".

  Always use the tools to get up-to-date ship information if you are unsure or need to compare.

  Return the final result as JSON matching this structure:
  {
    "ship": "Ship Name",
    "goal": "Description of the goal",
    "components": [
      { "name": "...", "type": "...", "location": "...", "shopName": "...", "price": 0, "description": "..." }
    ],
    "totalCost": 0,
    "route": ["Start", "Waypoint 1", "End"],
    "totalJumps": 0,
    "estimatedTravelTime": "..."
  }`;

  const chat = model.startChat();

  let result = await chat.sendMessage(prompt);
  let response = result.response;

  // Handle function calls
  while (response.functionCalls() && response.functionCalls().length > 0) {
    const callResults = await Promise.all(
      response.functionCalls().map(async (call) => {
        const { name, args } = call;
        let data;
        try {
            if (name === "fetchShips") data = await scApi.fetchShips((args as any).page || 1);
            else if (name === "searchShip") data = await scApi.searchShip((args as any).name);
            else if (name === "fetchStarmap") data = await scApi.fetchStarmap();
        } catch (e) {
            data = { error: (e as Error).message };
        }

        return {
          functionResponse: {
            name,
            response: { data }
          }
        };
      })
    );

    result = await chat.sendMessage(callResults);
    response = result.response;
  }

  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : text;

  return JSON.parse(jsonStr);
};
