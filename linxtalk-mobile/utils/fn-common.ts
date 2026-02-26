import {jwtDecode, JwtPayload} from "jwt-decode";
import {Platform} from "react-native";
import * as Application from "expo-application";

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