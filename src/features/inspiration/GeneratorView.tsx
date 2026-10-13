import PlayStage from '../stage/PlayStage';
import { Icon, type IconName } from '../../app/SupportView';
import Result, { selectionsMatch } from './Result';
import { INTENT_LABELS, SITUATION_LABELS, TONE_LABELS, type Intent, type Preferences, type ResultSnapshot, type Selection } from './model';

export const INTENT_ICONS: Record<Intent, IconName> = { request: 'hand', tease: 'smile', appreciation: 'spark', desire: 'heart' };
export function IntentChoices({ selected, onSelect }: { selected: Intent; onSelect(intent: Intent): void }) {
  return <div className="intent-grid" role="group" aria-label="Soort idee">{(Object.keys(INTENT_LABELS) as Intent[]).map(intent => <button type="button" key={intent} className={`intent-button ${selected === intent ? 'is-selected' : ''}`} aria-pressed={selected === intent} onClick={() => onSelect(intent)}><Icon name={INTENT_ICONS[intent]} /><span>{INTENT_LABELS[intent]}</span>{selected === intent && <span className="selection-dot" aria-hidden="true" />}</button>)}</div>;
}
type Props = {
  selection: Selection; current: ResultSnapshot | null; pending: ResultSnapshot | null; running: boolean; preferences: Preferences; saved: boolean;
  onIntent(intent: Intent): void; onContext(): void; onIntentPanel(): void; onActivate(): void; onContact(actionId: string): void; onSettled(actionId: string): void; onCopy(): void; onSave(): void; onCheck(): void;
};
export default function GeneratorView(props: Props) {
  const { selection, current } = props;
  return <main className="generator" aria-labelledby="generator-title">
    <h1 id="generator-title" className="sr-only" tabIndex={-1}>Een passend idee voor jullie</h1>
    <div className="context-line"><button className="context-button" data-focus="context" onClick={props.onContext}><span>{SITUATION_LABELS[selection.situation]}<span className="context-dot">·</span>{TONE_LABELS[selection.tone]}</span><span className="context-edit">Aanpassen<Icon name="chevron" /></span></button><span className="next-context">{current && !selectionsMatch(current.selection, selection) ? 'Voor je volgende tik' : '\u00a0'}</span></div>
    <div className="expanded-intents"><IntentChoices selected={selection.intent} onSelect={props.onIntent} /></div>
    <button className="compact-intent" data-focus="intent" onClick={props.onIntentPanel}><Icon name={INTENT_ICONS[selection.intent]} /><span>{INTENT_LABELS[selection.intent]}</span><span className="compact-change">Wijzigen</span><Icon name="chevron" /></button>
    <div className="stage-slot"><PlayStage actionId={props.pending?.actionId ?? null} running={props.running} motionMode={props.preferences.motionMode} soundEnabled={props.preferences.soundEnabled} onActivate={props.onActivate} onContact={props.onContact} onSettled={props.onSettled} /></div>
    <Result current={current} selection={selection} />
    <div className="result-controls">{current ? <><div className="result-actions"><button className="button button-primary" onClick={props.onCopy}><Icon name="copy" />Kopiëren</button><button className={`button button-secondary ${props.saved ? 'is-saved' : ''}`} onClick={props.onSave}><Icon name={props.saved ? 'check' : 'heart'} />{props.saved ? 'Bewaard' : 'Bewaren'}</button></div><button className="text-button moment-button" data-focus="moment" onClick={props.onCheck}>Past dit nu?<Icon name="chevron" /></button></> : <p className="first-hint">Tik op het broekje.<br /><span>Een klein idee, helemaal aan jullie.</span></p>}</div>
  </main>;
}
