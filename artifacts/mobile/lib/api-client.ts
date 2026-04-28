import { setBaseUrl } from "@workspace/api-client-react";
import Constants from "expo-constants";

function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;

  const expoHost =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri;
  if (expoHost) {
    const host = expoHost.split(":")[0];
    return `http://${host}`;
  }

  return "";
}

const base = resolveBaseUrl();
if (base) {
  setBaseUrl(base);
}

export const API_BASE_URL = base;
