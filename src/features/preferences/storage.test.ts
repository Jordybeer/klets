import { describe, expect, it } from 'vitest';
import { DEFAULT_SELECTION, type ResultSnapshot } from '../inspiration/model';
import { addFavorite, createStorageAdapter, defaultStoredState, STORAGE_KEY } from './storage';

const snapshot: ResultSnapshot = { actionId: 'action-1', ideaId: 'a', text: 'Kom eens naast me zitten.', intent: 'request', selection: { ...DEFAULT_SELECTION }, drawnAt: 10 };
function memoryStorage(raw: string | null = null) {
  const map = new Map<string, string>(); if (raw !== null) map.set(STORAGE_KEY, raw);
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
}
describe('local storage', () => {
  it('deniedReadUsesSession', () => {
    let writes = 0;
    const adapter = createStorageAdapter({ getItem: () => { throw new Error('denied'); }, setItem: () => { writes++; } });
    expect(adapter.read()).toMatchObject({ persistent: false, canWrite: false });
    const state = defaultStoredState(); state.preferences.soundEnabled = true;
    expect(adapter.write(state).persistent).toBe(false); expect(adapter.read().state.preferences.soundEnabled).toBe(true); expect(writes).toBe(0);
  });
  it('deniedWriteKeepsSessionState', () => {
    const adapter = createStorageAdapter({ getItem: () => null, setItem: () => { throw new Error('quota'); } });
    expect(adapter.read().persistent).toBe(true); const state = defaultStoredState(); state.favorites = addFavorite([], snapshot, 20);
    expect(adapter.write(state).persistent).toBe(false); expect(adapter.read().state).toEqual(state);
  });
  it('unknownVersionIsNotOverwritten', () => {
    const raw = '{"version":23,"future":"keep these bytes"}'; const backing = memoryStorage(raw); const adapter = createStorageAdapter(backing);
    expect(adapter.read()).toMatchObject({ persistent: false, canWrite: false });
    expect(adapter.write(defaultStoredState()).persistent).toBe(false); expect(backing.getItem(STORAGE_KEY)).toBe(raw);
    const withoutRead = createStorageAdapter(backing); withoutRead.write(defaultStoredState()); expect(backing.getItem(STORAGE_KEY)).toBe(raw);
  });
  it('malformedStateDoesNotCrash', () => {
    for (const raw of ['not JSON', JSON.stringify({ version: 1, preferences: { selection: { situation: 'moon' } }, favorites: [] }), JSON.stringify({ ...defaultStoredState(), favorites: [{ ...snapshot, savedAt: 'yesterday' }] }), JSON.stringify({ ...defaultStoredState(), preferences: { ...defaultStoredState().preferences, selection: { ...DEFAULT_SELECTION, situation: ['together'] } } }), JSON.stringify({ ...defaultStoredState(), preferences: { ...defaultStoredState().preferences, motionMode: ['system'] } })]) {
      const backing = memoryStorage(raw); const adapter = createStorageAdapter(backing);
      expect(adapter.read()).toEqual({ state: defaultStoredState(), persistent: false, canWrite: false }); adapter.write(defaultStoredState()); expect(backing.getItem(STORAGE_KEY)).toBe(raw);
    }
  });
  it('duplicateFavoriteKeepsOriginalSnapshot', () => {
    const original = addFavorite([], snapshot, 20); const duplicate = addFavorite(original, { ...snapshot, text: 'Gewijzigde tekst', actionId: 'action-2' }, 40);
    expect(duplicate).toHaveLength(1); expect(duplicate[0]).toEqual({ ...snapshot, savedAt: 20 });
  });
  it('roundTripsValidatedPreferencesAndFavorites', () => {
    const backing = memoryStorage(); const adapter = createStorageAdapter(backing); const state = defaultStoredState(); state.preferences.motionMode = 'paused'; state.favorites = addFavorite([], snapshot, 20);
    expect(adapter.write(state).persistent).toBe(true); expect(createStorageAdapter(backing).read().state).toEqual(state);
  });
  it('nullStorageIsSessionOnly', () => { expect(createStorageAdapter(null).read()).toMatchObject({ persistent: false, canWrite: false }); });
});
