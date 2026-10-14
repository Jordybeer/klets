import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SupportView, { Icon } from './SupportView';
import GeneratorView, { IntentChoices } from '../features/inspiration/GeneratorView';
import ContextPanel from '../features/inspiration/ContextPanel';
import RoomCheck from '../features/inspiration/RoomCheck';
import SavedIdeas from '../features/inspiration/SavedIdeas';
import type { ResultSnapshot } from '../features/inspiration/model';
import { CATALOG } from '../features/inspiration/catalog';
import { useGenerator } from '../features/inspiration/useGenerator';
import { createStorageAdapter } from '../features/preferences/storage';

type View = 'context' | 'intent' | 'room-check' | 'saved' | 'settings';
type SupportRoute = { view: View; returnTo: SupportRoute | null; id: number; snapshot?: ResultSnapshot };
type FocusTarget = { element: HTMLElement; key: string | null };
type HistoryEntry = { route: SupportRoute | null; opener: FocusTarget | null };
const titles: Record<View, string> = { context: 'Wat past bij jullie?', intent: 'Waar heb je zin in?', 'room-check': 'Past dit nu?', saved: 'Voor een ander moment.', settings: 'Op jouw manier.' };
function makeStorage() { try { return createStorageAdapter(window.localStorage); } catch { return createStorageAdapter(null); } }

export default function App() {
  const storage = useMemo(makeStorage, []);
  const generator = useGenerator({ catalog: CATALOG, storage, random: Math.random, now: Date.now });
  const { state, preferences, favorites, persistence } = generator;
  const [route, setRoute] = useState<SupportRoute | null>(null);
  const routeRef = useRef<SupportRoute | null>(null);
  const session = useRef(`klets-${Math.random().toString(36).slice(2)}`);
  const entries = useRef(new Map<number, HistoryEntry>([[0, { route: null, opener: null }]]));
  const counter = useRef(0);
  const restoreFocus = useRef<FocusTarget | null>(null);
  const afterBack = useRef<(() => void) | null>(null);
  const open = useCallback((view: View) => {
    if (routeRef.current?.view === view) return;
    const snapshot = view === 'room-check' ? state.current : null;
    if (view === 'room-check' && !snapshot) return;
    generator.finalizePending();
    const next: SupportRoute = { view, returnTo: routeRef.current, id: ++counter.current, ...(snapshot ? { snapshot } : {}) };
    const element = document.activeElement;
    const opener = element instanceof HTMLElement ? { element, key: element.getAttribute('data-focus') } : null;
    entries.current.set(next.id, { route: next, opener });
    window.history.pushState({ ...window.history.state, kletsView: { session: session.current, id: next.id } }, '');
    routeRef.current = next;
    setRoute(next);
  }, [generator.finalizePending, state.current]);
  const back = useCallback(() => { if (routeRef.current) window.history.back(); }, []);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, kletsView: { session: session.current, id: 0 } }, '');
    const onPop = (event: PopStateEvent) => {
      const marker = event.state?.kletsView;
      if (marker?.session !== session.current) return;
      const target = entries.current.get(marker.id);
      if (!target) return;
      const leaving = entries.current.get(routeRef.current?.id ?? 0);
      restoreFocus.current = leaving?.opener ?? null;
      routeRef.current = target.route;
      setRoute(target.route);
      if (afterBack.current) { const action = afterBack.current; afterBack.current = null; action(); }
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && routeRef.current) { event.preventDefault(); window.history.back(); } };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    if (!route && !restoreFocus.current) return;
    const frame = requestAnimationFrame(() => {
      const target = restoreFocus.current;
      restoreFocus.current = null;
      const opener = target?.element.isConnected ? target.element : target?.key ? document.querySelector<HTMLElement>(`[data-focus="${target.key}"]`) : null;
      if (opener?.isConnected && opener.getClientRects().length) opener.focus();
      else document.getElementById(route ? 'view-title' : 'generator-title')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);

  return <div className={`app-shell ${route ? 'is-supporting' : ''}`} data-motion={preferences.motionMode}>
    <header className="app-header"><a className="wordmark" href="#" aria-label="Klets, terug naar inspiratie" onClick={event => { event.preventDefault(); if (routeRef.current) { let depth = 0; let current: SupportRoute | null = routeRef.current; while (current) { depth++; current = current.returnTo; } window.history.go(-depth); } }}>klets<span aria-hidden="true">.</span></a><span className="brand-note">klein gebaar, grote glimlach</span><button className="icon-button settings-button" aria-label="Instellingen" data-focus="settings" onClick={() => open('settings')}><Icon name="settings" /></button></header>
    {route ? <SupportView title={titles[route.view]} onBack={back} intro={route.view === 'context' ? 'Kies de situatie en de toon voor je volgende tik.' : route.view === 'intent' ? 'Je keuze geldt meteen voor het volgende idee.' : undefined}>
      {route.view === 'context' && <ContextPanel selection={state.selection} onConfirm={selection => { generator.confirmContext(selection); back(); }} onCancel={back} />}
      {route.view === 'intent' && <IntentChoices selected={state.selection.intent} onSelect={intent => { generator.setIntent(intent); back(); }} />}
      {route.view === 'room-check' && route.snapshot && <RoomCheck current={route.snapshot} onBack={back} onSave={() => { generator.saveSnapshot(route.snapshot!); back(); }} onAnother={() => { afterBack.current = () => { generator.activate(); }; back(); }} onContext={() => open('context')} />}
      {route.view === 'saved' && <SavedIdeas favorites={favorites} persistence={persistence} onRemove={generator.removeFavorite} onUndo={generator.undoRemoval} onBack={back} />}
      {route.view === 'settings' && <div className="settings-content"><p className="support-intro">Een beetje levendig, of juist lekker rustig.</p><label className="setting-row"><span><strong>Geluid bij een tik</strong><small>Een zacht tikje. Staat standaard uit.</small></span><input type="checkbox" checked={preferences.soundEnabled} onChange={event => generator.setFeedback({ soundEnabled: event.target.checked })} /><span className="switch" aria-hidden="true" /></label><label className="setting-row"><span><strong>Beweging pauzeren</strong><small>Je kunt gewoon nieuwe ideeën blijven trekken.</small></span><input type="checkbox" checked={preferences.motionMode === 'paused'} onChange={event => generator.setFeedback({ motionMode: event.target.checked ? 'paused' : 'system' })} /><span className="switch" aria-hidden="true" /></label><p className="quiet-note settings-note">Je systeemvoorkeur voor minder beweging wordt automatisch gevolgd.</p><div className="storage-note"><Icon name="heart" /><p>{persistence ? 'Je keuzes en bewaarde ideeën blijven op dit apparaat. Ze zijn zichtbaar voor wie deze browser gebruikt.' : 'Opslaan op dit apparaat lukt nu niet. Je keuzes en ideeën blijven bewaard zolang deze sessie open is.'}</p></div></div>}
    </SupportView> : <GeneratorView selection={state.selection} current={state.current} pending={state.pending} running={state.phase === 'running'} preferences={preferences} saved={!!state.current && favorites.some(favorite => favorite.ideaId === state.current?.ideaId)} onIntent={generator.setIntent} onContext={() => open('context')} onIntentPanel={() => open('intent')} onActivate={() => { generator.activate(); }} onContact={generator.publish} onSettled={generator.finish} onCopy={() => { void generator.copyCurrent(); }} onSave={generator.saveCurrent} onCheck={() => open('room-check')} />}
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.current?.text ?? ''}</span>
    <footer className="app-footer"><div className="footer-status" role="status" aria-live="polite">{state.notice}{state.notice?.includes('geen') && state.notice.includes('idee') && <button className="text-button" onClick={() => open('context')}>Selectie aanpassen</button>}</div>{!route && <button className="saved-access text-button" data-focus="saved" onClick={() => open('saved')}><Icon name="heart" /><span>Opgeslagen ideeën</span>{favorites.length > 0 && <span className="favorite-count">{favorites.length}</span>}</button>}</footer>
  </div>;
}
