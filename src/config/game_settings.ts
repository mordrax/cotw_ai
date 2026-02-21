/**
 * Game Settings & User Preferences
 * Stores settings in localStorage and provides reactive access
 */

export interface GameSettings {
  fontScale: number; // Multiplier: 0.8 (small), 1.0 (normal), 1.2 (large), 1.5 (xl)
  volume: number; // 0-100
}

const SETTINGS_KEY = "cotw_ai_settings";

const DEFAULT_SETTINGS: GameSettings = {
  fontScale: 1.0,
  volume: 80,
};

class SettingsManager {
  private settings: GameSettings;
  private listeners: Set<(settings: GameSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Load settings from localStorage or use defaults
   */
  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Failed to load settings from localStorage", e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Failed to save settings to localStorage", e);
    }
  }

  /**
   * Get all settings
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Update a single setting
   */
  updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Get a specific setting
   */
  getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  /**
   * Subscribe to setting changes
   */
  subscribe(listener: (settings: GameSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getSettings());
    }
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Calculate font size based on scale
   */
  getFontSize(baseSize: number): number {
    return Math.round(baseSize * this.settings.fontScale);
  }
}

// Singleton instance
export const gameSettings = new SettingsManager();
