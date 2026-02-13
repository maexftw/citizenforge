import { GoogleGenAI, Type } from "@google/genai";
import { LoadoutBuild, OptimizationPriority } from "../types";

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;
  }
  // @ts-ignore
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const getBuildRecommendation = async (
  shipName: string, 
  userIntent: string, 
  startLocation: string,
  priority: OptimizationPriority
): Promise<LoadoutBuild> => {
  const genAI = new GoogleGenAI(getApiKey());
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `You are a Star Citizen loadout and logistics expert. 
  The user is currently at: "${startLocation}".
  They want to configure a ${shipName} for: "${userIntent}".
  Optimization Priority: ${priority === 'shortest' ? 'Shortest travel distance/time' : 'Lowest total UEC cost'}.

  CONTEXT:
  The Stanton system consists of major planets (Crusader, Hurston, ArcCorp, microTech), their moons (Cellin, Yela, Daymar, Magda, Ita, Arial, Aberdeen, Wala, Lyria, Calliope, Clio, Euterpe), and orbital stations (Seraphim, Everus Harbor, Port Tressler, Bajini Point).

  TASK:
  1. Recommend the absolute best components (Shields, Weapons, Power Plant, Coolers, Quantum Drive) for the specified intent.
  2. Find reputable shops (e.g., Center Mass, Dumper's Depot, Platinum Bay, Omega Pro) that stock these.
  3. Calculate an optimized route starting exactly from "${startLocation}".
  4. Include intermediate quantum jumps if a cross-system trip is required.

  Return the data in valid JSON matching the schema. Ensure shop locations match real Star Citizen shop locations (e.g., New Babbage, Area18, Orison, Lorville, GrimHEX, or specific moons).`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ship: { type: Type.STRING },
          goal: { type: Type.STRING },
          components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                size: { type: Type.NUMBER },
                grade: { type: Type.STRING },
                class: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                location: { type: Type.STRING },
                shopName: { type: Type.STRING }
              },
              required: ["name", "type", "location", "shopName"]
            }
          },
          totalCost: { type: Type.NUMBER },
          route: { 
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Ordered sequence of waypoints starting with the start location"
          },
          totalJumps: { type: Type.NUMBER },
          estimatedTravelTime: { type: Type.STRING }
        },
        required: ["ship", "components", "route", "totalJumps", "estimatedTravelTime"]
      },
    },
  });

  return JSON.parse(result.response.text());
};
