// src/types/config.d.ts

/** Server proxy configuration */
export interface ServerConfig {
  proxyUrl: string;
  apiPrefix: string;
  timeout: number;
  enableMock: boolean;
}

/** 
 * Base GUI configuration (unified for all modules)
 * Shared fields: Skin, FullScreen, Height, Width, BackColor
 */
export interface BaseGUIConfig {
  Skin: string;
  FullScreen: boolean;
  Height: number;
  Width: number;
  BackColor: string;
}

/** 
 * Dictionary module GUI configuration (extends base + unique fields)
 */
export interface DictionaryGUIConfig extends BaseGUIConfig {
  ShowHiRatio: number;
  ShowWiRatio: number;
}

/** 
 * ReciteWords module GUI configuration (directly uses base interface)
 * No unique fields, fully aligns with BaseGUIConfig
 */
export type ReciteWordsGUIConfig = BaseGUIConfig;

/** Tab item configuration in Dictionary module */
export interface DictionaryTabItem {
  TabId: number;
  Label: string;
  DictId: number;
}

/** Dictionary module configuration */
export interface DictionaryConfig {
  GUI: DictionaryGUIConfig; // Use extended interface
  Tabs: DictionaryTabItem[];
  TabId: number;
  User: string;
}

/** ReciteWords module configuration */
export interface ReciteWordsConfig {
  GUI: ReciteWordsGUIConfig; // Use base interface
  User: string;
  Target: string;
  DictId: number;
  AudioId: number;
}

/** Root application configuration (combines all modules) */
export interface AppConfig {
  Server: ServerConfig;
  Dictionary: DictionaryConfig;
  ReciteWords: ReciteWordsConfig;
}

/** Default fallback configuration (updated to use unified GUI types) */
export const DEFAULT_APP_CONFIG: AppConfig = {
  Server: {
    proxyUrl: "http://localhost:5000",
    apiPrefix: "/api",
    timeout: 5000,
    enableMock: false,
  },
  Dictionary: {
    GUI: {
      // BaseGUIConfig fields
      Skin: "Skin/",
      FullScreen: false,
      Height: 548,
      Width: 701,
      BackColor: "67,160,255",
      // Unique fields of DictionaryGUIConfig
      ShowHiRatio: 0.5,
      ShowWiRatio: 0.5,
    },
    Tabs: [
      { TabId: 1, Label: "Google", DictId: 1 },
      { TabId: 2, Label: "牛津英语搭配词典", DictId: 2 },
    ],
    TabId: 1,
    User: "anonymous",
  },
  ReciteWords: {
    GUI: {
      // All fields from BaseGUIConfig (no unique fields)
      Skin: "Skin/",
      BackColor: "67,160,255",
      FullScreen: true,
      Height: 551,
      Width: 701,
    },
    User: "anonymous",
    Target: "IELTS",
    DictId: 1,
    AudioId: 1,
  },
};
