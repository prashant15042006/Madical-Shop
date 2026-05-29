import { setBaseUrl } from "@workspace/api-client-react";
import Constants from "expo-constants";

function resolveBaseUrl(): string {
  // Production API URL - bhai, yahan apna server domain daalein
  const PROD_API_URL = "https://medigo-api.apkaapna.com"; // TODO: replace with actual domain

  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;

  // Production standalone ke liye fallback domain
  return PROD_API_URL;
}

const base = resolveBaseUrl();
if (base) {
  setBaseUrl(base);
}

export const API_BASE_URL = base;
