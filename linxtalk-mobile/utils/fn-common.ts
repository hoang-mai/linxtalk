import {jwtDecode, JwtPayload} from "jwt-decode";
import {Platform} from "react-native";
import * as Application from "expo-application";
import { useAuthStore } from "@/store/auth-store";

export function isTokenExpired(token: string): boolean {
  const decoded = jwtDecode<JwtPayload>(token);
  if (!decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 60;
  return decoded.exp - bufferTime < currentTime;
}

export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId() || "unknown";
    } else if (Platform.OS === "ios") {
      return (await Application.getIosIdForVendorAsync()) || "unknown";
    }
  } catch (e) {
    console.error("Failed to get device ID", e);
  }
  return "unknown";
}

export function getUserId(): string | null {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) {
    return null;
  }
  const decoded = jwtDecode<JwtPayload>(accessToken);
  return decoded.sub || null;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}