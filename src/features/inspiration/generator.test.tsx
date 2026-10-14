import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SELECTION, type Idea } from './model';
import { createStorageAdapter, defaultStoredState, STORAGE_KEY } from '../preferences/storage';
import { useGenerator } from './useGenerator';

const catalog: Idea[] = ['a', 'b', 'c'].map(id => ({ id, text: `Kom bij me zitten, ${id}.`, intent: 'request', situations: ['together'], tones: ['playful'], status: 'approved' }));
const remote: Idea = { id: 'remote', text: 'Stuur me een kleine groet.', intent: 'tease', situations: ['remote'], tones: ['warm'], status: 'approved' };
function setup(options: Partial<Parameters<typeof useGenerator>[0]> = {}) {
  return renderHook(() => useGenerator({ catalog: [...catalog, remote], storage: createStorageAdapter(null), random: () => 0, now: () => 100, ...options }));
}
function reveal(result: ReturnType<typeof setup>['result']) { act(() => { expect(result.current.activate()).toBe(true); result.current.finalizePending(); }); return result.current.state.current!; }
afterEach(() => { vi.restoreAllMocks(); Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' }); });
describe('generator controller', () => {
  it('reservesOriginalContextDespiteFilterChangeAndPublishesOnlyOnce', () => {
    const { result } = setup(); act(() => { expect(result.current.activate()).toBe(true); }); const pending = result.current.state.pending!;
    act(() => { result.current.confirmContext({ situation: 'remote', tone: 'warm', intent: 'tease' }); result.current.publish(pending.actionId); });
    const shown = result.current.state.current;
    act(() => { result.current.publish(pending.actionId); });
    expect(result.current.state.current).toBe(shown); expect(shown?.selection).toEqual(DEFAULT_SELECTION); expect(result.current.state.selection.intent).toBe('tease'); expect(result.current.state.pending).toBe(pending); expect(result.current.state.phase).toBe('running');
    act(() => { result.current.finish(pending.actionId); }); expect(result.current.state.phase).toBe('idle'); expect(result.current.state.pending).toBeNull();
  });
  it('ignoresDuplicateActivationAndStaleCallbacks', () => {
    const { result } = setup(); act(() => { expect(result.current.activate()).toBe(true); expect(result.current.activate()).toBe(false); });
    const pending = result.current.state.pending; act(() => { result.current.publish('stale'); result.current.finish('stale'); }); expect(result.current.state.pending).toBe(pending);
    act(() => result.current.finalizePending()); const shown = result.current.state.current; act(() => { result.current.finish(pending!.actionId); result.current.publish(pending!.actionId); }); expect(result.current.state.current).toBe(shown);
  });
  it('emptyPoolRetainsOldTextWithoutAcceptingAction', () => {
    const { result } = setup(); const shown = reveal(result);
    act(() => { result.current.setIntent('desire'); expect(result.current.activate()).toBe(false); });
    expect(result.current.state.current).toBe(shown); expect(result.current.state.pending).toBeNull(); expect(result.current.state.phase).toBe('idle'); expect(result.current.state.notice).toMatch(/geen|niets/i);
  });
  it('finalizesAnAcceptedDrawWhenTheTabIsHidden', () => {
    const { result } = setup(); act(() => { expect(result.current.activate()).toBe(true); }); const pending = result.current.state.pending;
    act(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current.state.current).toBe(pending); expect(result.current.state.phase).toBe('idle'); expect(result.current.state.pending).toBeNull();
  });
  it('finalizeAndFinishRevealWithoutAContactCallbackExactlyOnce', () => {
    const { result } = setup(); act(() => { result.current.activate(); }); const pending = result.current.state.pending!;
    act(() => { result.current.finish(pending.actionId); result.current.finalizePending(); }); expect(result.current.state.current).toBe(pending); expect(result.current.state.pending).toBeNull();
  });
  it('copyRejectionExplainsManualSelection', async () => {
    const { result } = setup(); reveal(result); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
    await act(async () => { await result.current.copyCurrent(); }); expect(result.current.state.notice).toMatch(/selecteer.*tekst/i);
  });
  it('copyUsesDisplayedSnapshotAndLateStatusDoesNotAttachToNextResult', async () => {
    let resolve!: () => void; let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (text: string) => { copied = text; return new Promise<void>(done => { resolve = done; }); } } });
    const { result } = setup(); const old = reveal(result); let copying!: Promise<void>;
    act(() => { copying = result.current.copyCurrent(); }); const next = reveal(result);
    expect(copied).toBe(old.text); expect(next.actionId).not.toBe(old.actionId);
    await act(async () => { resolve(); await copying; }); expect(result.current.state.notice).toBeNull();
  });
  it('sessionSaveDeduplicatesByIdeaAndPreservesOriginalSnapshot', () => {
    const { result } = setup({ catalog: [catalog[0]] }); const original = reveal(result);
    act(() => result.current.saveCurrent()); const saved = result.current.favorites[0]; reveal(result); act(() => result.current.saveCurrent());
    expect(result.current.favorites).toHaveLength(1); expect(saved.actionId).toBe(original.actionId); expect(result.current.favorites[0]).toBe(saved); expect(result.current.persistence).toBe(false); expect(result.current.state.notice).toBe('Dit idee is al bewaard.');
  });
  it('saveConfirmationDoesNotMigrateWhenPendingResultIsPublished', () => {
    const { result } = setup(); const first = reveal(result); act(() => { result.current.activate(); result.current.saveCurrent(); });
    expect(result.current.favorites[0].actionId).toBe(first.actionId); expect(result.current.state.notice).toMatch(/bewaard/i); const pending = result.current.state.pending!;
    act(() => result.current.publish(pending.actionId)); expect(result.current.state.current).toBe(pending); expect(result.current.state.notice).toBeNull();
  });
  it('copyCompletedBeforeContactDoesNotMigrateToTheNextResult', async () => {
    let resolve!: () => void;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => new Promise<void>(done => { resolve = done; }) } });
    const { result } = setup(); reveal(result); let copying!: Promise<void>;
    act(() => { result.current.activate(); copying = result.current.copyCurrent(); }); const pending = result.current.state.pending!;
    await act(async () => { resolve(); await copying; }); expect(result.current.state.notice).toBe('Gekopieerd.');
    act(() => result.current.publish(pending.actionId)); expect(result.current.state.notice).toBeNull();
  });
  it('interruptedFinalizationClearsThePreviousResultsSaveConfirmation', () => {
    const { result } = setup(); reveal(result); act(() => { result.current.activate(); result.current.saveCurrent(); }); const pending = result.current.state.pending!;
    act(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current.state.current).toBe(pending); expect(result.current.state.notice).toBeNull(); expect(result.current.state.phase).toBe('idle');
  });
  it('newResultsOwnSaveConfirmationSurvivesSettlement', () => {
    const { result } = setup(); reveal(result); act(() => result.current.activate()); const pending = result.current.state.pending!;
    act(() => { result.current.publish(pending.actionId); result.current.saveCurrent(); }); const notice = result.current.state.notice;
    expect(notice).toBe('Bewaard voor deze sessie.'); act(() => result.current.finish(pending.actionId)); expect(result.current.state.notice).toBe(notice); expect(result.current.favorites[0].actionId).toBe(pending.actionId);
  });
  it('duplicateSaveHasExplicitNoticeWithoutWritingAgain', () => {
    let writes = 0;
    const storage = createStorageAdapter({ getItem: () => null, setItem: () => { writes++; } });
    const { result } = setup({ storage }); reveal(result); act(() => result.current.saveCurrent()); const saved = result.current.favorites[0];
    expect(writes).toBe(1); act(() => result.current.saveCurrent()); expect(writes).toBe(1); expect(result.current.favorites).toEqual([saved]); expect(result.current.state.notice).toBe('Dit idee is al bewaard.');
  });
  it('saveSnapshotPersistsCapturedIdeaWithoutAssigningItsNoticeToCurrent', () => {
    const { result } = setup(); const captured = reveal(result); const displayed = reveal(result);
    act(() => { result.current.saveSnapshot(captured); }); expect(result.current.state.current).toBe(displayed); expect(result.current.favorites[0].actionId).toBe(captured.actionId); expect(result.current.state.notice).toBeNull();
  });
  it('saveDuringPendingDrawCapturesDisplayedResult', () => {
    const { result } = setup(); const shown = reveal(result); act(() => { result.current.activate(); result.current.saveCurrent(); }); expect(result.current.favorites[0].actionId).toBe(shown.actionId);
  });
  it('removesAndUndoesOneDeletionWithOriginalSnapshot', () => {
    const { result } = setup(); const original = reveal(result); act(() => result.current.saveCurrent()); const saved = result.current.favorites[0];
    act(() => result.current.removeFavorite(original.ideaId)); expect(result.current.favorites).toEqual([]); act(() => { result.current.undoRemoval(); result.current.undoRemoval(); }); expect(result.current.favorites).toEqual([saved]);
  });
  it('persistsImmediateIntentAndConfirmedContextAndFeedback', () => {
    const backing = new Map<string, string>(); const storage = createStorageAdapter({ getItem: key => backing.get(key) ?? null, setItem: (key, value) => { backing.set(key, value); } });
    const { result } = setup({ storage }); act(() => { result.current.setIntent('appreciation'); result.current.confirmContext({ situation: 'remote', tone: 'direct', intent: 'appreciation' }); result.current.setFeedback({ soundEnabled: true, motionMode: 'paused' }); });
    expect(result.current.preferences).toEqual({ selection: { situation: 'remote', tone: 'direct', intent: 'appreciation' }, soundEnabled: true, motionMode: 'paused' }); expect(JSON.parse(backing.get(STORAGE_KEY)!)).toMatchObject({ preferences: result.current.preferences });
  });
  it('unknownStoredVersionSupportsSessionWithoutOverwritingRaw', () => {
    const raw = JSON.stringify({ ...defaultStoredState(), version: 99 }); let currentRaw = raw;
    const storage = createStorageAdapter({ getItem: () => currentRaw, setItem: (_key, value) => { currentRaw = value; } }); const { result } = setup({ storage }); reveal(result); act(() => { result.current.saveCurrent(); result.current.setIntent('tease'); });
    expect(result.current.favorites).toHaveLength(1); expect(result.current.persistence).toBe(false); expect(currentRaw).toBe(raw);
  });
});
