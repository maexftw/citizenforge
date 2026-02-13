
import { Ship, MapNode, MapLink } from './types';

export const SHIPS: Ship[] = [
  { id: 'arrow', name: 'Anvil Arrow', manufacturer: 'Anvil Aerospace', image: 'https://media.robertsspaceindustries.com/v8tjs6y8y20w5/store_slideshow_large.jpg', focus: 'Light Fighter', description: 'Agile and lethal light fighter with a focus on speed and evasion.' },
  { id: 'titan', name: 'Avenger Titan', manufacturer: 'Aegis Dynamics', image: 'https://media.robertsspaceindustries.com/xsc0n97n8dshw/store_slideshow_large.jpg', focus: 'Multirole', description: 'The legendary workhorse, perfect for starters who want to do a bit of everything.' },
  { id: 'gladius', name: 'Gladius', manufacturer: 'Aegis Dynamics', image: 'https://media.robertsspaceindustries.com/v86e2469b0gty/store_slideshow_large.jpg', focus: 'Light Fighter', description: 'A quintessential light fighter used by the UEE Navy.' },
  { id: 'cutlass_black', name: 'Cutlass Black', manufacturer: 'Drake Interplanetary', image: 'https://media.robertsspaceindustries.com/7p6p6u8p7n2p9/store_slideshow_large.jpg', focus: 'Multirole', description: 'A versatile ship favored by militias and less-than-legal entrepreneurs.' },
  { id: 'prospector', name: 'Prospector', manufacturer: 'MISC', image: 'https://media.robertsspaceindustries.com/6v6p6u8p7n2p9/store_slideshow_large.jpg', focus: 'Mining', description: 'The gold standard for solo mining operations.' },
  { id: 'c8x_pisces', name: 'C8X Pisces Expedition', manufacturer: 'Anvil Aerospace', image: '', focus: 'Pathfinder', description: 'Small shuttle designed for exploration and quick transport.' },
  { id: 'constellation_andromeda', name: 'Constellation Andromeda', manufacturer: 'RSI', image: 'https://media.robertsspaceindustries.com/8p6p6u8p7n2p9/store_slideshow_large.jpg', focus: 'Gunship', description: 'Multi-crew freighter with a massive missile loadout.' },
  { id: 'corsair', name: 'Drake Corsair', manufacturer: 'Drake Interplanetary', image: '', focus: 'Exploration', description: 'Deep space explorer with enough firepower to defend itself.' },
  { id: 'mercury', name: 'Mercury Star Runner', manufacturer: 'Crusader Industries', image: 'https://media.robertsspaceindustries.com/vsc0n97n8dshw/store_slideshow_large.jpg', focus: 'Courier', description: 'The ultimate data runner and blockade runner.' },
];

export const STANTON_NODES: MapNode[] = [
  // Planets
  { id: 'crusader', name: 'Crusader', x: 200, y: 200, type: 'Planet' },
  { id: 'hurston', name: 'Hurston', x: 600, y: 150, type: 'Planet' },
  { id: 'microtech', name: 'microTech', x: 750, y: 400, type: 'Planet' },
  { id: 'arc_corp', name: 'ArcCorp', x: 100, y: 400, type: 'Planet' },
  
  // Major Landing Zones
  { id: 'orison', name: 'Orison', x: 215, y: 215, type: 'Station' },
  { id: 'lorville', name: 'Lorville', x: 615, y: 165, type: 'Station' },
  { id: 'new_babbage', name: 'New Babbage', x: 765, y: 415, type: 'Station' },
  { id: 'area18', name: 'Area18', x: 115, y: 415, type: 'Station' },

  // Orbital Stations
  { id: 'seraphim', name: 'Seraphim Station', x: 235, y: 175, type: 'Station' },
  { id: 'everus_harbor', name: 'Everus Harbor', x: 635, y: 125, type: 'Station' },
  { id: 'port_tressler', name: 'Port Tressler', x: 785, y: 375, type: 'Station' },
  { id: 'bajini', name: 'Bajini Point', x: 135, y: 375, type: 'Station' },
  
  // Crusader Moons
  { id: 'cellin', name: 'Cellin', x: 255, y: 225, type: 'Moon' },
  { id: 'yela', name: 'Yela', x: 175, y: 185, type: 'Moon' },
  { id: 'daymar', name: 'Daymar', x: 245, y: 255, type: 'Moon' },
  { id: 'grim_hex', name: 'GrimHEX', x: 165, y: 165, type: 'Station' },

  // Hurston Moons
  { id: 'arial', name: 'Arial', x: 645, y: 185, type: 'Moon' },
  { id: 'aberdeen', name: 'Aberdeen', x: 585, y: 105, type: 'Moon' },
  { id: 'magda', name: 'Magda', x: 655, y: 135, type: 'Moon' },
  { id: 'ita', name: 'Ita', x: 565, y: 185, type: 'Moon' },

  // ArcCorp Moons
  { id: 'wala', name: 'Wala', x: 75, y: 375, type: 'Moon' },
  { id: 'lyria', name: 'Lyria', x: 135, y: 445, type: 'Moon' },

  // microTech Moons
  { id: 'calliope', name: 'Calliope', x: 725, y: 365, type: 'Moon' },
  { id: 'clio', name: 'Clio', x: 795, y: 435, type: 'Moon' },
  { id: 'euterpe', name: 'Euterpe', x: 825, y: 385, type: 'Moon' },

  // Lagrange Points
  { id: 'hur_l1', name: 'HUR-L1', x: 505, y: 155, type: 'Station' },
  { id: 'hur_l2', name: 'HUR-L2', x: 655, y: 255, type: 'Station' },
  { id: 'cru_l1', name: 'CRU-L1', x: 355, y: 205, type: 'Station' },
  { id: 'arc_l1', name: 'ARC-L1', x: 205, y: 355, type: 'Station' },
  { id: 'mic_l1', name: 'MIC-L1', x: 605, y: 355, type: 'Station' },
];

export const STANTON_LINKS: MapLink[] = [
  { source: 'crusader', target: 'hurston' },
  { source: 'hurston', target: 'microtech' },
  { source: 'microtech', target: 'arc_corp' },
  { source: 'arc_corp', target: 'crusader' },
];

export const SC_API_BASE_URL = "https://api.starcitizen-api.com";
export const SC_API_KEY = import.meta.env.VITE_SC_API_KEY;
