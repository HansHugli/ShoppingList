import { File, Paths } from 'expo-file-system';
import { GraphClient, GraphError } from './graph-client';
import { ShoppingItemData } from '../types/shopping';

const CACHE_FILENAME = 'shopping-list-cache.json';

export class OneDriveSync {
  private client: GraphClient;
  private lastETag: string | null = null;
  private cacheFile: File;

  constructor(getAccessToken: () => Promise<string>) {
    this.client = new GraphClient(getAccessToken);
    this.cacheFile = new File(Paths.document, CACHE_FILENAME);
  }

  /** Fetch shopping list from OneDrive */
  async fetch(): Promise<{ items: ShoppingItemData[]; eTag: string } | null> {
    const result = await this.client.downloadShoppingList();
    if (!result) return null;

    this.lastETag = result.eTag;
    const items = result.items as ShoppingItemData[];

    // Cache locally for offline access
    await this.cacheLocally(items);

    return { items, eTag: result.eTag };
  }

  /** Check if remote has changed (cheap metadata-only call) */
  async hasRemoteChanged(): Promise<boolean> {
    if (!this.lastETag) return true;

    const meta = await this.client.getFileMetadata();
    if (!meta) return true;

    return meta.eTag !== this.lastETag;
  }

  /** Save shopping list to OneDrive with conflict detection */
  async save(items: ShoppingItemData[]): Promise<string> {
    try {
      const newETag = await this.client.uploadShoppingList(items, this.lastETag);
      this.lastETag = newETag;
      await this.cacheLocally(items);
      return newETag;
    } catch (err) {
      if (err instanceof GraphError && (err.statusCode === 412 || err.statusCode === 409)) {
        // Conflict — re-fetch remote and merge
        const remote = await this.fetch();
        if (!remote) {
          // File was deleted? Just upload
          const newETag = await this.client.uploadShoppingList(items, null);
          this.lastETag = newETag;
          return newETag;
        }

        const merged = this.mergeItems(remote.items, items);
        const newETag = await this.client.uploadShoppingList(merged, remote.eTag);
        this.lastETag = newETag;
        await this.cacheLocally(merged);
        return newETag;
      }
      throw err;
    }
  }

  /** Load cached items for offline use */
  async loadCached(): Promise<ShoppingItemData[] | null> {
    try {
      if (!this.cacheFile.exists) return null;
      const text = await this.cacheFile.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /** Get user profile */
  async getUserProfile() {
    return this.client.getMe();
  }

  private async cacheLocally(items: ShoppingItemData[]) {
    try {
      this.cacheFile.write(JSON.stringify(items));
    } catch {
      // Non-critical — ignore cache write failures
    }
  }

  /** Merge remote and local items. Local checked state wins; new items from either side are kept. */
  private mergeItems(remote: ShoppingItemData[], local: ShoppingItemData[]): ShoppingItemData[] {
    const merged = new Map<string, ShoppingItemData>();

    // Start with remote items
    for (const item of remote) {
      merged.set(item.id, { ...item });
    }

    // Overlay local changes
    for (const item of local) {
      const existing = merged.get(item.id);
      if (existing) {
        // Local checked state wins (user just tapped it)
        existing.checked = item.checked;
      } else {
        // New local item (e.g., manually added on phone)
        merged.set(item.id, { ...item });
      }
    }

    return Array.from(merged.values());
  }
}
