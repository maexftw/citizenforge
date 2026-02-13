export interface Component {
  id?: string;
  name: string;
  type: string;
  size: number;
  grade?: string;
  class?: string;
  description: string;
  price?: number;
  location: string;
  shopName: string;
}

export interface Ship {
  id: string;
  name: string;
  manufacturer: string;
  image: string;
  focus: string;
  description: string;
}

export interface LoadoutBuild {
  ship: string;
  goal: string;
  components: Component[];
  totalCost: number;
  route: string[];
  totalJumps: number;
  estimatedTravelTime: string;
}

export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'Planet' | 'Station' | 'Moon';
}

export interface MapLink {
  source: string;
  target: string;
}

export type OptimizationPriority = 'shortest' | 'cheapest';
