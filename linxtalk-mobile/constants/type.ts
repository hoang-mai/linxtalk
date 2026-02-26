export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
  deviceId: string;
  platform: string;
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}

export interface LoginWithGoogleRequest {
  idTokenString: string;
  deviceId: string;
  platform: string;
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  displayName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  deviceId: string;
}

export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAccount {
    username: string;
    displayName: string;
    avatarUrl: string | null;
}

export interface Account {
  username: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}