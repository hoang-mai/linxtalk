export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string | null;
  username: string | null;
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
  username: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface Account {
  username: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface SwitchAccountRequest {
  username: string | null;
  email: string | null;
  deviceId: string;
}

export interface LinkEmailRequest {
  email: string;
}

export interface UpdateProfileRequest {
  phoneNumber?: string;
  birthday?: string;
  displayName: string;
  bio?: string;
}

export interface ProfileResponse {
  phoneNumber: string | null;
  birthday: string | null;
  email: string | null;
  displayName: string;
  bio: string | null;
}