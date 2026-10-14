import { DEFAULT_SELECTION, type Favorite, type ResultSnapshot, type Selection, type StoredState } from '../inspiration/model';

export type StorageAdapter = {
  read(): { state: StoredState; persistent: boolean; canWrite: boolean };
  write(state: StoredState): { persistent: boolean };
};
export const STORAGE_KEY = 'klets.state';
export const defaultStoredState = (): StoredState => ({ version: 1, preferences: { selection: { ...DEFAULT_SELECTION }, soundEnabled: false, motionMode: 'system' }, favorites: [] });
export function addFavorite(favorites: Favorite[], snapshot: ResultSnapshot, savedAt: number): Favorite[] {
  if (favorites.some(favorite => favorite.ideaId === snapshot.ideaId)) return favorites;
  return [...favorites, { ...snapshot, selection: { ...snapshot.selection }, savedAt }];
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const timestamp = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
function validSelection(value: unknown): value is Selection {
  return record(value) && typeof value.situation === 'string' && ['together', 'remote'].includes(value.situation) && typeof value.tone === 'string' && ['warm', 'playful', 'direct'].includes(value.tone) && typeof value.intent === 'string' && ['request', 'tease', 'appreciation', 'desire'].includes(value.intent);
}
function validFavorite(value: unknown): value is Favorite {
  return record(value) && nonempty(value.actionId) && nonempty(value.ideaId) && nonempty(value.text) && validSelection(value.selection) && value.intent === value.selection.intent && timestamp(value.drawnAt) && timestamp(value.savedAt);
}
function validState(value: unknown): value is StoredState {
  if (!record(value) || value.version !== 1 || !record(value.preferences)) return false;
  const preferences = value.preferences;
  return validSelection(preferences.selection) && typeof preferences.soundEnabled === 'boolean' && typeof preferences.motionMode === 'string' && ['system', 'paused', 'full'].includes(preferences.motionMode) && Array.isArray(value.favorites) && value.favorites.every(validFavorite);
}
function cloneState(state: StoredState): StoredState {
  return { version: 1, preferences: { ...state.preferences, selection: { ...state.preferences.selection } }, favorites: state.favorites.map(favorite => ({ ...favorite, selection: { ...favorite.selection } })) };
}

export function createStorageAdapter(storage: Pick<Storage, 'getItem' | 'setItem'> | null): StorageAdapter {
  let state = defaultStoredState();
  let initialized = false;
  let canWrite = storage !== null;
  let persistent = canWrite;
  function initialize() {
    if (initialized) return;
    initialized = true;
    if (!storage) return;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw === null) return;
      const parsed: unknown = JSON.parse(raw);
      if (!validState(parsed)) { canWrite = false; persistent = false; return; }
      state = cloneState(parsed);
      state.favorites = state.favorites.filter((favorite, index, list) => list.findIndex(item => item.ideaId === favorite.ideaId) === index);
    } catch { canWrite = false; persistent = false; }
  }
  return {
    read() { initialize(); return { state: cloneState(state), persistent, canWrite }; },
    write(nextState) {
      initialize();
      if (!validState(nextState)) return { persistent: false };
      state = cloneState(nextState);
      if (canWrite && storage) {
        try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); persistent = true; }
        catch { canWrite = false; persistent = false; }
      } else persistent = false;
      return { persistent };
    },
  };
}
