export type AdvertStatus = 'draft' | 'active' | 'paused' | 'expired';

export interface Advert {
  _id: string;
  owner: string | { _id: string; name?: string; phone?: string };
  car?: string | null;
  title: string;
  description?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  contactPhone?: string;
  images?: string[];
  priority: number;
  priorityUntil?: string | null;
  startsAt?: string;
  expiresAt?: string | null;
  status: AdvertStatus;
  views: number;
  clicks: number;
  createdAt?: string;
  updatedAt?: string;
}
