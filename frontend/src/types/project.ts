export interface Project {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  fully_diluted_valuation?: number;
  total_supply?: number;
  max_supply?: number;
  circulating_supply?: number;
  preview_listing: boolean;
  tvl?: number;
}

export interface ProjectsResponse {
  total: number;
  data: Project[];
  cached: boolean;
  timestamp: string;
}

export type SortField = 'market_cap' | 'total_volume';
export type SortDirection = 'asc' | 'desc';
