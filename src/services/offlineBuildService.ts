import { LoadoutBuild } from "../types";

export const getOfflineBuild = async (
  shipName: string | null,
  userIntent: string
): Promise<LoadoutBuild | null> => {
  try {
    const response = await fetch('/data/offline_builds.json');
    if (!response.ok) return null;

    const builds: LoadoutBuild[] = await response.json();

    // Simple matching logic
    const filtered = builds.filter(b => {
      const shipMatch = !shipName || b.ship.toLowerCase().includes(shipName.toLowerCase());
      const intentMatch = b.goal.toLowerCase().includes(userIntent.toLowerCase()) ||
                          userIntent.toLowerCase().split(' ').some(word => b.goal.toLowerCase().includes(word));
      return shipMatch && intentMatch;
    });

    return filtered.length > 0 ? filtered[0] : builds[0]; // Return first match or just first
  } catch (error) {
    console.error("Offline build service error:", error);
    return null;
  }
};
