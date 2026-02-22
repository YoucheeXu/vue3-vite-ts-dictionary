/**
 * Shared type definitions for User & Level management
 * Centralized to avoid duplicate definitions across components
 */

// Existing user type
export interface User {
  name: string; // Unique identifier
  desc: string;
}

// Existing level type
export interface Level {
  value: string;
  label: string;
}

// Confirm result type (emitted by dialog)
export interface ConfirmResult {
  type: 'user' | 'level';
  isNew: boolean;
  value: string;
}

// 1:N Mapping: Key = unique username, Value = array of levels
export type UserLevelMap = Record<string, string[]>;
