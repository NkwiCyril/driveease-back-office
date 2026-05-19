export interface Rating {
  _id: string;
  seller: string | { _id: string; name: string };
  rater: string | { _id: string; name: string };
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  car?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingSummary {
  average: number;
  count: number;
  breakdown: { 1: number; 2: number; 3: number; 4: number; 5: number };
}
