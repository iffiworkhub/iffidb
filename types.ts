export interface Record {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'ERROR' | 'SYSTEM';
  details: string;
  user?: string;
}

export type ThemeName = 'default' | 'purple' | 'emerald' | 'rose';

export interface DashboardStats {
  totalRecords: number;
  newToday: number;
  deletedCount: number; // Simulated
  lastAdded: Record[];
}