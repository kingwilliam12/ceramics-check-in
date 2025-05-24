// Auth types
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  NotFound: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Data types
export interface Member {
  id: string;
  email: string;
  full_name: string;
  photo_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  member_id: string;
  check_in: string;
  check_out: string | null;
  auto_closed: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  status: number;
}

// Location types
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationData {
  coords: LocationCoords;
  timestamp: number;
}

// Offline queue types
export type QueueItem = {
  id: string;
  type: 'check_in' | 'check_out';
  timestamp: string;
  payload: Record<string, unknown>;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
};

// Error types
export type AppError = {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
};
