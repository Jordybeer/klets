import { useCallback, useEffect, useRef, useState } from 'react';
import type { Favorite, Idea, Intent, PoolState, Preferences, ResultSnapshot, Selection, StoredState } from './model';
import { addFavorite, type StorageAdapter } from '../preferences/storage';
import { eligibleIdeas, reserveIdea } from './selection';
export type GeneratorState = { selection: Selection; current: ResultSnapshot | null; pending: ResultSnapshot | null; phase: 'idle' | 'running'; notice: string | null };
export type GeneratorOptions = { catalog: readonly Idea[]; storage: StorageAdapter; random: () => number; now: () => number };
type Controller = { state: GeneratorState; stored: StoredState; persistence: boolean; noticeActionId: string | null };

function resultNotice(current: Controller, actionId: string): Pick<Controller, 'noticeActionId'> & { notice: string | null } {
  const obsolete = current.noticeActionId !== null && current.noticeActionId !== actionId;
  return { noticeActionId: obsolete ? null : current.noticeActionId, notice: obsolete ? null : current.state.notice };
}

export function useGenerator(options: GeneratorOptions) {
  const inputs = useRef(options);
  inputs.current = options;
  const [view, setView] = useState<Controller>(() => {
    const { state: stored, persistent } = options.storage.read();
    return { stored, persistence: persistent, noticeActionId: null, state: { selection: stored.preferences.selection, current: null, pending: null, phase: 'idle', notice: persistent ? null : 'Je keuzes worden alleen voor deze sessie bewaard.' } };
  });
  // Synchronous ownership also guards two activations within the same React event.
  const controller = useRef(view);
  const pools = useRef(new Map<string, PoolState>());
  const sequence = useRef(0);
  const removed = useRef<{ favorite: Favorite; index: number } | null>(null);
  const mounted = useRef(true);
  const update = useCallback((next: Controller) => { controller.current = next; setView(next); }, []);
  const persist = useCallback((stored: StoredState) => {
    const persistence = inputs.current.storage.write(stored).persistent;
    const next = { ...controller.current, stored, persistence };
    update(next);
    return persistence;
  }, [update]);

  const activate = useCallback(() => {
    const current = controller.current;
    if (current.state.phase === 'running') return false;
    const selection = { ...current.state.selection };
    const key = JSON.stringify([selection.situation, selection.tone, selection.intent]);
    const { catalog, random, now } = inputs.current;
    const draw = reserveIdea(catalog, selection, pools.current.get(key), current.state.current?.ideaId ?? null, random);
    if (!draw.idea) {
      update({ ...current, noticeActionId: null, state: { ...current.state, notice: 'Voor deze selectie zijn er geen ideeën. Pas je selectie aan.' } });
      return false;
    }
    pools.current.set(key, draw.pool);
    const drawnAt = now();
    const pending: ResultSnapshot = { actionId: `draw-${drawnAt}-${++sequence.current}`, ideaId: draw.idea.id, text: draw.idea.text, intent: draw.idea.intent, selection, drawnAt };
    update({ ...current, noticeActionId: null, state: { ...current.state, pending, phase: 'running', notice: eligibleIdeas(catalog, selection).length === 1 ? 'Voor deze selectie is er één idee.' : null } });
    return true;
  }, [update]);

  const publish = useCallback((actionId: string) => {
    const current = controller.current;
    const pending = current.state.pending;
    if (!pending || pending.actionId !== actionId || current.state.current?.actionId === actionId) return;
    const { noticeActionId, notice } = resultNotice(current, actionId);
    update({ ...current, noticeActionId, state: { ...current.state, current: pending, notice } });
  }, [update]);
  const finish = useCallback((actionId: string) => {
    const current = controller.current;
    const pending = current.state.pending;
    if (!pending || pending.actionId !== actionId) return;
    const { noticeActionId, notice } = resultNotice(current, actionId);
    update({ ...current, noticeActionId, state: { ...current.state, current: pending, pending: null, phase: 'idle', notice } });
  }, [update]);
  const finalizePending = useCallback(() => {
    const actionId = controller.current.state.pending?.actionId;
    if (actionId) finish(actionId);
  }, [finish]);
  useEffect(() => {
    mounted.current = true;
    const onVisibility = () => { if (document.visibilityState === 'hidden') finalizePending(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { mounted.current = false; document.removeEventListener('visibilitychange', onVisibility); };
  }, [finalizePending]);

  const confirmContext = useCallback((selection: Selection) => {
    const current = controller.current;
    const nextSelection = { ...selection };
    const stored = { ...current.stored, preferences: { ...current.stored.preferences, selection: nextSelection } };
    persist(stored);
    update({ ...controller.current, noticeActionId: null, state: { ...controller.current.state, selection: nextSelection, notice: null } });
  }, [persist, update]);
  const setIntent = useCallback((intent: Intent) => confirmContext({ ...controller.current.state.selection, intent }), [confirmContext]);
  const setFeedback = useCallback((patch: Partial<Pick<Preferences, 'soundEnabled' | 'motionMode'>>) => {
    const stored = controller.current.stored;
    persist({ ...stored, preferences: { ...stored.preferences, ...patch } });
  }, [persist]);

  const copyCurrent = useCallback(async () => {
    const snapshot = controller.current.state.current;
    if (!snapshot) return;
    let notice: string;
    try {
      await navigator.clipboard.writeText(snapshot.text);
      notice = 'Gekopieerd.';
    } catch { notice = 'Kopiëren lukt niet. Selecteer de tekst en kopieer zelf.'; }
    const current = controller.current;
    if (mounted.current && current.state.current?.actionId === snapshot.actionId) update({ ...current, noticeActionId: snapshot.actionId, state: { ...current.state, notice } });
  }, [update]);
  const saveSnapshot = useCallback((snapshot: ResultSnapshot) => {
    const current = controller.current;
    if (current.stored.favorites.some(favorite => favorite.ideaId === snapshot.ideaId)) {
      if (current.state.current?.actionId === snapshot.actionId) update({ ...current, noticeActionId: snapshot.actionId, state: { ...current.state, notice: 'Dit idee is al bewaard.' } });
      return;
    }
    const favorites = addFavorite(current.stored.favorites, snapshot, inputs.current.now());
    const persistent = persist({ ...current.stored, favorites });
    const latest = controller.current;
    if (latest.state.current?.actionId === snapshot.actionId) update({ ...latest, noticeActionId: snapshot.actionId, state: { ...latest.state, notice: persistent ? 'Bewaard.' : 'Bewaard voor deze sessie.' } });
  }, [persist, update]);
  const saveCurrent = useCallback(() => {
    const snapshot = controller.current.state.current;
    if (snapshot) saveSnapshot(snapshot);
  }, [saveSnapshot]);
  const removeFavorite = useCallback((ideaId: string) => {
    const current = controller.current;
    const index = current.stored.favorites.findIndex(favorite => favorite.ideaId === ideaId);
    if (index < 0) return;
    removed.current = { favorite: current.stored.favorites[index], index };
    persist({ ...current.stored, favorites: current.stored.favorites.filter(favorite => favorite.ideaId !== ideaId) });
    update({ ...controller.current, noticeActionId: null, state: { ...controller.current.state, notice: 'Verwijderd.' } });
  }, [persist, update]);
  const undoRemoval = useCallback(() => {
    const deletion = removed.current;
    if (!deletion) return;
    removed.current = null;
    const current = controller.current;
    const favorites = [...current.stored.favorites];
    if (!favorites.some(favorite => favorite.ideaId === deletion.favorite.ideaId)) favorites.splice(Math.min(deletion.index, favorites.length), 0, deletion.favorite);
    const persistent = persist({ ...current.stored, favorites });
    update({ ...controller.current, noticeActionId: null, state: { ...controller.current.state, notice: persistent ? 'Teruggezet.' : 'Teruggezet voor deze sessie.' } });
  }, [persist, update]);
  return { state: view.state, preferences: view.stored.preferences, favorites: view.stored.favorites, persistence: view.persistence, activate, publish, finish, setIntent, confirmContext, finalizePending, copyCurrent, saveCurrent, saveSnapshot, removeFavorite, undoRemoval, setFeedback };
}
