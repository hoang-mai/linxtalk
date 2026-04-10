import {jwtDecode, JwtPayload} from "jwt-decode";
import {Platform} from "react-native";
import * as Application from "expo-application";
import { useAuthStore } from "@/store/auth-store";
import i18n from "@/i18n";

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
    return i18n.t('time.justNow');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return i18n.t(diffInMinutes === 1 ? 'time.minuteAgo' : 'time.minutesAgo', { count: diffInMinutes });
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return i18n.t(diffInHours === 1 ? 'time.hourAgo' : 'time.hoursAgo', { count: diffInHours });
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return i18n.t(diffInDays === 1 ? 'time.dayAgo' : 'time.daysAgo', { count: diffInDays });
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return i18n.t(diffInMonths === 1 ? 'time.monthAgo' : 'time.monthsAgo', { count: diffInMonths });
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return i18n.t(diffInYears === 1 ? 'time.yearAgo' : 'time.yearsAgo', { count: diffInYears });
}

export function formatFriendDuration(dateString?: string | null): string {
  if (!dateString) {
    return "";
  }

  const startDate = new Date(dateString);
  if (Number.isNaN(startDate.getTime())) {
    return "";
  }

  const now = new Date();
  const years = now.getFullYear() - startDate.getFullYear();
  const months = now.getMonth() - startDate.getMonth() + years * 12;
  const days = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 1) {
    return i18n.t('time.today');
  }

  if (months >= 12) {
    const totalYears = Math.floor(months / 12);
    return i18n.t(totalYears === 1 ? 'time.year' : 'time.years', { count: totalYears });
  }

  if (months >= 1) {
    return i18n.t(months === 1 ? 'time.month' : 'time.months', { count: months });
  }

  return i18n.t(days === 1 ? 'time.day' : 'time.days', { count: days });
}

