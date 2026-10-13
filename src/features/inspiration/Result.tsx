import { INTENT_LABELS, SITUATION_LABELS, TONE_LABELS, type ResultSnapshot, type Selection } from './model';

export function selectionsMatch(a: Selection, b: Selection) { return a.intent === b.intent && a.situation === b.situation && a.tone === b.tone; }
export default function Result({ current, selection }: { current: ResultSnapshot | null; selection: Selection }) {
  const changed = current && !selectionsMatch(current.selection, selection);
  return <section className={`result ${current ? 'has-result' : 'is-empty'}`} aria-label="Jouw idee">
    {current && <div className="result-context">{changed ? 'Dit idee: ' : ''}{INTENT_LABELS[current.intent]}<span> · </span>{SITUATION_LABELS[current.selection.situation]}<span> · </span>{TONE_LABELS[current.selection.tone]}</div>}
    <p className="result-text" key={current?.actionId ?? 'empty'}>{current ? current.text : <>Eén tik.<br />Iets leuks tussen jullie.</>}</p>
  </section>;
}
