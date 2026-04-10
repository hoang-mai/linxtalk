import { MessageType } from "./enum";

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

export interface UserSearchResponse {
  id: string;
  username: string | null;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  friendRequestResponse: FriendRequestResponse | null;
}

export interface FriendRequestResponse {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  respondedAt: string;
  createdAt: string;
  updatedAt: string;
  sender: UserSearchResponse | null;
}

export interface CreateFriendRequestRequest {
  receiverId: string;
  message: string;
}

export interface UpdateFriendRequestStatusRequest {
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
}

export interface PrivateMessageRequest {
  receiverId: string;
  chatId?: string;
  messageContent: string;
  messageType: MessageType;
}