import { Car } from './car.model';
import { User } from './user.model';

export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  user: string | User;
  car: string | Car;
  startDate: string;
  endDate: string;
  days: number;
  rentalPrice: number;
  totalCost: number;
  notes?: string;
  cancelledAt?: string | null;
  cancelReason?: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
}
