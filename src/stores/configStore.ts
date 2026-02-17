// src/stores/configStore.ts
import { defineStore, type StoreDefinition } from "pinia";
import { reactive, computed } from "vue";
// Import type definitions for app configuration structure
import type {
  AppConfig,
  ServerConfig,
  DictionaryConfig,
  ReciteWordsConfig,
  DictionaryTabItem,
  BaseGUIConfig,
} from "@/types/config";
// Import default fallback configuration (type-safe defaults)
import { DEFAULT_APP_CONFIG } from "@/types/config";
// Import persistence type for pinia-plugin-persistedstate v4.7.1 (latest)
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { fetchConfigFromPublicFolder } from "@/config/browserConfigUtils";

// ==========================
// 1. Define Store State Type (Reactive State Only)
// - Only includes reactive state properties (excludes actions/getters)
// - Ensures type safety for persistence and state manipulation
// ==========================
interface ConfigStoreState {
  config: AppConfig; // Root nested configuration object
}

// ==========================
// 2. Persistence Configuration
// ==========================
const persistOptions: PersistenceOptions<ConfigStoreState> = {
  key: "app-complete-config", // Unique localStorage/sessionStorage key (avoids conflicts)
  // Persistence strategies (supports multiple storage targets)

    storage: localStorage, // Explicitly define storage medium (default: localStorage)
    // Paths to persist (nested under config state - matches original requirements)
    // Only persist critical fields to avoid bloating storage
    pick: [
        "config.Server",          // Full server proxy configuration
        "config.Dictionary.TabId",// Active dictionary tab ID
        "config.ReciteWords.User",// ReciteWords module user
        "config.ReciteWords.Target"// ReciteWords learning target (e.g., IELTS)
    ],
    // Custom serializer for deep nested objects (ensures proper JSON parsing/stringifying)
    serializer: {
        serialize: (value) => JSON.stringify(value),
        deserialize: (value) => JSON.parse(value),
    },
};

// ==========================
// 3. Setup-Mode Pinia Store (Type-Safe)
// - Uses Vue Composition API (reactive/computed) instead of Options API
// - Explicit type definition for StoreDefinition ensures full type safety
// ==========================
// export const useConfigStore: StoreDefinition<
//   "appConfig",        // Unique store ID (required for Pinia)
//   ConfigStoreState,   // Reactive state type (only config object)
//   {},                 // Getters type (empty - computed properties handled in setup)
//   {}                  // Actions type (empty - plain functions used for state modification)
// > = defineStore(
export const useConfigStore = defineStore(
  "appConfig",
  () => {
    // Reactive state initialization (deep clone to avoid mutating default config)
    // structuredClone ensures a fresh copy of DEFAULT_APP_CONFIG (no reference sharing)
    const config = reactive<AppConfig>(structuredClone(DEFAULT_APP_CONFIG));

    // Call this async function to load config into Pinia (run in main.ts)
    const loadConfig = async (): Promise<void> => {
      const validatedConfig = await fetchConfigFromPublicFolder();
      Object.assign(config, validatedConfig);
    };

    // ==========================
    // Action: Update Full Configuration
    // Merges new configuration values with existing state (partial updates supported)
    // @param newConfig - Partial AppConfig (supports updating any nested field)
    // ==========================
    const setConfig = (newConfig: Partial<AppConfig>): void => {
      Object.assign(config, newConfig);
    };

    // ==========================
    // Action: Update Server Configuration Only
    // Type-safe partial update for server/proxy settings
    // @param serverConfig - Partial ServerConfig (e.g., proxyUrl, timeout)
    // ==========================
    const setServerConfig = (serverConfig: Partial<ServerConfig>): void => {
      Object.assign(config.Server, serverConfig);
    };

    // ==========================
    // Action: Update Dictionary Configuration Only
    // Type-safe partial update for dictionary module settings
    // @param dictionaryConfig - Partial DictionaryConfig (e.g., GUI, Tabs)
    // ==========================
    const setDictionaryConfig = (dictionaryConfig: Partial<DictionaryConfig>): void => {
      Object.assign(config.Dictionary, dictionaryConfig);
    };

    // ==========================
    // Action: Update ReciteWords Configuration Only
    // Type-safe partial update for recite words module settings
    // @param reciteWordsConfig - Partial ReciteWordsConfig (e.g., User, Target)
    // ==========================
    const setReciteWordsConfig = (reciteWordsConfig: Partial<ReciteWordsConfig>): void => {
      Object.assign(config.ReciteWords, reciteWordsConfig);
    };

    // ==========================
    // Action: Update GUI Configuration for Specific Module
    // Unified method to update GUI settings for Dictionary/ReciteWords
    // @param module - Target module ("Dictionary" | "ReciteWords")
    // @param guiConfig - Partial BaseGUIConfig (shared GUI fields)
    // ==========================
    const setModuleGUIConfig = (
      module: "Dictionary" | "ReciteWords",
      guiConfig: Partial<BaseGUIConfig>
    ): void => {
      if (module === "Dictionary") {
        Object.assign(config.Dictionary.GUI, guiConfig);
      } else if (module === "ReciteWords") {
        Object.assign(config.ReciteWords.GUI, guiConfig);
      }
    };

    // ==========================
    // Action: Add New Tab to Dictionary Tabs
    // Type-safe array operation with duplicate TabId check
    // @param newTab - New tab item (strictly typed DictionaryTabItem)
    // @throws Error if TabId already exists (prevents duplicate tabs)
    // ==========================
    const addDictionaryTab = (newTab: DictionaryTabItem): void => {
      if (config.Dictionary.Tabs.some((tab) => tab.TabId === newTab.TabId)) {
        throw new Error(`Tab with ID ${newTab.TabId} already exists`);
      }
      config.Dictionary.Tabs.push(newTab);
    };

    // ==========================
    // Action: Reset Configuration to Defaults
    // Deep clones DEFAULT_APP_CONFIG to overwrite current state (no reference leaks)
    // ==========================
    const resetConfig = (): void => {
      Object.assign(config, structuredClone(DEFAULT_APP_CONFIG));
    };

    // ==========================
    // Getter: Full API Base URL
    // Computed (reactive) derived value: Server.proxyUrl + Server.apiPrefix
    // @returns string - Full API endpoint base URL (e.g., "http://192.168.1.5:5000/api")
    // ==========================
    const apiBaseUrl = computed<string>(() => {
      return `${config.Server.serverUrl}${config.Server.apiPrefix}`;
    });

    // ==========================
    // Getter: Active Dictionary Tab
    // Finds the currently active tab by Dictionary.TabId
    // @returns DictionaryTabItem | undefined - Active tab (or undefined if not found)
    // ==========================
    const activeDictionaryTab = computed<DictionaryTabItem | undefined>(() => {
      return config.Dictionary.Tabs.find((tab) => tab.TabId === config.Dictionary.TabId);
    });

    // ==========================
    // Getter: ReciteWords Window Size
    // Formatted window size string (Width x Height) for ReciteWords GUI
    // @returns string - e.g., "701x551"
    // ==========================
    const reciteWordsWindowSize = computed<string>(() => {
      return `${config.ReciteWords.GUI.Width}x${config.ReciteWords.GUI.Height}`;
    });

    // ==========================
    // Getter: Dictionary Window Ratio
    // Formatted ratio string (ShowHiRatio x ShowWiRatio) for Dictionary GUI
    // @returns string - e.g., "0.5x0.5"
    // ==========================
    const dictionaryWindowRatio = computed<string>(() => {
      return `${config.Dictionary.GUI.ShowHiRatio}x${config.Dictionary.GUI.ShowWiRatio}`;
    });

    // ==========================
    // Export Reactive State, Actions, and Getters
    // - Only expose necessary properties/methods to components
    // - Reactive state: config (full nested configuration)
    // - Actions: state modification functions
    // - Getters: computed derived values
    // ==========================
    return {
      // Reactive state
      config,
      loadConfig,
      // Actions (state modification)
      setConfig,
      setServerConfig,
      setDictionaryConfig,
      setReciteWordsConfig,
      setModuleGUIConfig,
      addDictionaryTab,
      resetConfig,
      // Getters (computed derived values)
      apiBaseUrl,
      activeDictionaryTab,
      reciteWordsWindowSize,
      dictionaryWindowRatio,
    };
  },
  // Attach persistence configuration
  {
    persist: persistOptions,
  }
);
