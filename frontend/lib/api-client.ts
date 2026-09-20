import { setBaseUrl } from "@workspace/api-client-react";

function resolveBaseUrl(): string {
  // 1. Explicit environment variable (set on Vercel or in .env)
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;

  // 2. In web browser environment
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // Local web development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    // Deployed web (e.g., Vercel) - uses Vercel proxy rewrite
    return window.location.origin;
  }

  // 3. Production standalone / mobile Expo fallback (Render backend URL)
  return "https://medigo-api.onrender.com";
}

const base = resolveBaseUrl();
if (base) {
  setBaseUrl(base);
}

export const API_BASE_URL = base;
