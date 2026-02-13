import fs from 'fs';
import path from 'path';

// Note: Use the key from constants or environment
const API_KEY = process.env.SC_API_KEY || "";
const BASE_URL = "https://api.starcitizen-api.com";

async function fetchAllShips() {
  let allShips: any[] = [];
  let page = 1;
  let hasMore = true;

  console.log("Starting ship data collection...");

  if (!API_KEY) {
    throw new Error("SC_API_KEY is not set in environment.");
  }

  while (hasMore && page <= 50) { // Safety limit
    console.log(`Fetching page ${page}...`);
    try {
      const response = await fetch(`${BASE_URL}/${API_KEY}/v1/live/ships?page_max=${page}`);
      const result: any = await response.json();

      if (result.success === 1 && result.data && result.data.length > 0) {
        allShips = result.data;
        hasMore = false; // For now, assume one big call or handle pagination properly.
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error("Error fetching ships:", error);
      hasMore = false;
    }
    page++;
  }

  return allShips;
}

async function main() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const ships = await fetchAllShips();
    fs.writeFileSync(
      path.join(dataDir, 'raw_ships.json'),
      JSON.stringify(ships, null, 2)
    );
    console.log(`Saved ${ships.length} ships to data/raw_ships.json`);

    // Also grab starmap systems for the route planner
    console.log("Fetching starmap systems...");
    const starmapResponse = await fetch(`${BASE_URL}/${API_KEY}/v1/live/starmap/starsystems`);
    const starmapResult: any = await starmapResponse.json();
    if (starmapResult.success === 1) {
      fs.writeFileSync(
        path.join(dataDir, 'raw_starmap.json'),
        JSON.stringify(starmapResult.data, null, 2)
      );
      console.log("Saved starmap data to data/raw_starmap.json");
    }

  } catch (error) {
    console.error("Data collection failed:", error);
  }
}

main();
