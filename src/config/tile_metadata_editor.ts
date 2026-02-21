/**
 * Tile Metadata Editor
 * Allows editing and persisting custom tile metadata (name, ASCII, category, function)
 */

export interface CustomTileMetadata {
  name?: string;
  ascii?: string;
  category?: string;
  function?: string;
}

const TILE_METADATA_KEY = "cotw_ai_tile_metadata";

class TileMetadataEditor {
  private customMetadata: Record<number, CustomTileMetadata> = {};
  private listeners: Set<(frameIndex: number, metadata: CustomTileMetadata) => void> = new Set();

  constructor() {
    this.loadCustomMetadata();
  }

  /**
   * Load custom metadata from localStorage
   */
  private loadCustomMetadata(): void {
    try {
      const stored = localStorage.getItem(TILE_METADATA_KEY);
      if (stored) {
        this.customMetadata = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load tile metadata from localStorage", e);
    }
  }

  /**
   * Save custom metadata to localStorage
   */
  private saveCustomMetadata(): void {
    try {
      localStorage.setItem(TILE_METADATA_KEY, JSON.stringify(this.customMetadata));
    } catch (e) {
      console.warn("Failed to save tile metadata to localStorage", e);
    }
  }

  /**
   * Get custom metadata for a tile frame
   */
  getCustomMetadata(frameIndex: number): CustomTileMetadata | undefined {
    return this.customMetadata[frameIndex];
  }

  /**
   * Update tile metadata
   */
  updateMetadata(frameIndex: number, metadata: CustomTileMetadata): void {
    const trimmed = {
      name: metadata.name?.trim(),
      ascii: metadata.ascii?.trim(),
      category: metadata.category?.trim(),
      function: metadata.function?.trim(),
    };

    // Remove empty values
    const filtered = Object.fromEntries(
      Object.entries(trimmed).filter(([, v]) => v && v.length > 0),
    ) as CustomTileMetadata;

    if (Object.keys(filtered).length === 0) {
      delete this.customMetadata[frameIndex];
    } else {
      this.customMetadata[frameIndex] = filtered;
    }

    this.saveCustomMetadata();
    this.notifyListeners(frameIndex, this.customMetadata[frameIndex] || {});
  }

  /**
   * Reset tile metadata to default
   */
  resetMetadata(frameIndex: number): void {
    delete this.customMetadata[frameIndex];
    this.saveCustomMetadata();
    this.notifyListeners(frameIndex, {});
  }

  /**
   * Subscribe to metadata changes
   */
  subscribe(listener: (frameIndex: number, metadata: CustomTileMetadata) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(frameIndex: number, metadata: CustomTileMetadata): void {
    for (const listener of this.listeners) {
      listener(frameIndex, metadata);
    }
  }

  /**
   * Get all custom metadata
   */
  getAllCustomMetadata(): Record<number, CustomTileMetadata> {
    return { ...this.customMetadata };
  }

  /**
   * Clear all custom metadata
   */
  clearAllMetadata(): void {
    this.customMetadata = {};
    this.saveCustomMetadata();
  }
}

// Singleton instance
export const tileMetadataEditor = new TileMetadataEditor();
