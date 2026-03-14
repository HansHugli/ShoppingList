import { create } from 'zustand';
import { ShoppingItemData, SyncStatus } from '../types/shopping';
import { OneDriveSync } from '../services/onedrive-sync';
import { generateId } from '../utils/format';

interface ShoppingState {
  items: ShoppingItemData[];
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncService: OneDriveSync | null;

  // Lifecycle
  initSync: (getAccessToken: () => Promise<string>) => void;

  // Remote sync
  fetchFromRemote: () => Promise<void>;
  syncToRemote: () => Promise<void>;
  loadCached: () => Promise<void>;

  // Item actions
  toggleItem: (id: string) => void;
  addManualItem: (item: string, quantity: number, unit: string, style?: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItemData>) => void;
  clearChecked: () => void;
}

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  syncStatus: 'idle',
  lastSyncedAt: null,
  syncService: null,

  initSync: (getAccessToken) => {
    set({ syncService: new OneDriveSync(getAccessToken) });
  },

  fetchFromRemote: async () => {
    const { syncService } = get();
    if (!syncService) return;

    set({ syncStatus: 'syncing' });
    try {
      const result = await syncService.fetch();
      if (result) {
        set({ items: result.items, lastSyncedAt: new Date(), syncStatus: 'idle' });
      } else {
        set({ items: [], lastSyncedAt: new Date(), syncStatus: 'idle' });
      }
    } catch {
      set({ syncStatus: 'error' });
    }
  },

  syncToRemote: async () => {
    const { syncService, items } = get();
    if (!syncService) return;

    set({ syncStatus: 'syncing' });
    try {
      await syncService.save(items);
      set({ lastSyncedAt: new Date(), syncStatus: 'idle' });
    } catch {
      set({ syncStatus: 'error' });
    }
  },

  loadCached: async () => {
    const { syncService } = get();
    if (!syncService) return;

    const cached = await syncService.loadCached();
    if (cached) {
      set({ items: cached });
    }
  },

  toggleItem: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
    debouncedSync(get);
  },

  addManualItem: (item, quantity, unit, style = '') => {
    const newItem: ShoppingItemData = {
      id: generateId(),
      item,
      quantity,
      unit,
      style,
      checked: false,
      sources: ['Manual'],
    };
    set((state) => ({ items: [...state.items, newItem] }));
    debouncedSync(get);
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
    debouncedSync(get);
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
    debouncedSync(get);
  },

  clearChecked: () => {
    set((state) => ({
      items: state.items.filter((item) => !item.checked),
    }));
    debouncedSync(get);
  },
}));

/** Debounce remote sync — batch rapid actions, flush after 2s idle */
function debouncedSync(get: () => ShoppingState) {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    get().syncToRemote();
  }, 2000);
}
