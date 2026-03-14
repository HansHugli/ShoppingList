/**
 * Shopping item data — matches the eCookbook desktop app's schema exactly.
 * File format: bare JSON array of ShoppingItemData[]
 * Location: <library>/_data/shopping-list.json
 */
export interface ShoppingItemData {
  id: string;
  item: string;
  unit: string;
  quantity: number;
  style: string;
  checked: boolean;
  /** Recipe names that contributed this item, or ["Manual"] for user-added items */
  sources: string[];
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface CategoryGroup {
  category: string;
  items: ShoppingItemData[];
}
