// src/config/browserConfigUtils.ts (Browser ONLY - no Node.js APIs)
import type { AppConfig } from "../types/config";
import { DEFAULT_APP_CONFIG } from "../types/config";

/**
 * Browser-only utility to fetch config from public folder (async)
 * For Pinia store (no Node.js APIs like fs/path)
 * @returns Validated AppConfig (falls back to defaults on error)
 */
export async function fetchConfigFromPublicFolder(): Promise<AppConfig> {
  try {
    // Fetch JSON from public folder (browser-only fetch API)
    // Ensure app.config.json is copied to /public folder!
    const response = await fetch("/Dictionary.json");
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} (${response.statusText})`);
    }

    const rawConfig = await response.json();

    // Simplified validation for browser (focus on critical Server config)
    if (
      typeof rawConfig !== "object" ||
      rawConfig === null ||
      !("Server" in rawConfig) ||
      typeof (rawConfig as AppConfig).Server.proxyUrl !== "string"
    ) {
      throw new Error("Invalid Server config in browser (missing proxyUrl)");
    }

    return rawConfig as AppConfig;

  } catch (error) {
    console.warn(`[Browser Config Utils] Fetch failed: ${(error as Error).message}`);
    console.warn("[Browser Config Utils] Falling back to default config");
    return structuredClone(DEFAULT_APP_CONFIG);
  }
}
