// src/config/nodeConfigUtils.ts (Node.js ONLY - no browser usage)
import fs from "fs";
import path from "path";
import type { AppConfig, ServerConfig } from "../types/config";
import { DEFAULT_APP_CONFIG } from "../types/config";

/**
 * Node.js-only utility to read and validate app config from JSON file
 * @param configPath - Optional path to JSON config file
 * @returns Validated AppConfig (falls back to defaults on error)
 */
export function getValidatedAppConfig(configPath?: string): AppConfig {
  try {
    // Resolve absolute path to config file (Node.js-only)
    const resolvedPath = configPath || path.resolve(process.cwd(), "public/Dictionary.json");
    
    // Check if file exists (Node.js-only fs API)
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Config file not found at: ${resolvedPath}`);
    }

    // Read and parse JSON (Node.js-only)
    const configContent = fs.readFileSync(resolvedPath, "utf-8");
    const rawConfig = JSON.parse(configContent) as unknown;

    // Validate root structure
    if (
      typeof rawConfig !== "object" ||
      rawConfig === null ||
      !("Server" in rawConfig) ||
      !("Dictionary" in rawConfig) ||
      !("ReciteWords" in rawConfig)
    ) {
      throw new Error("Invalid root config structure (missing Server/Dictionary/ReciteWords)");
    }

    // Validate Server config (critical for proxy)
    const serverConfig = (rawConfig as AppConfig).Server;
    const requiredServerFields: (keyof ServerConfig)[] = ["serverUrl", "apiPrefix", "timeout"];
    for (const field of requiredServerFields) {
      const value = serverConfig[field];
      switch (field) {
        case "serverUrl":
        case "apiPrefix":
          if (typeof value !== "string" || value.trim() === "") {
            throw new Error(`Invalid Server.${field}: non-empty string required`);
          }
          break;
        case "timeout":
          if (typeof value !== "number" || value <= 0) {
            throw new Error(`Invalid Server.${field}: positive number required`);
          }
          break;
      }
    }

    return rawConfig as AppConfig;

  } catch (error) {
    console.warn(`[Node Config Utils] Validation failed: ${(error as Error).message}`);
    console.warn("[Node Config Utils] Falling back to default config");
    return structuredClone(DEFAULT_APP_CONFIG);
  }
}
