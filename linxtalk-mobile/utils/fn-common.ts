import {jwtDecode, JwtPayload} from "jwt-decode";

export function isTokenExpired(token: string): boolean {
  const decoded = jwtDecode<JwtPayload>(token);
  if (!decoded.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 60;
  return decoded.exp - bufferTime < currentTime;
}