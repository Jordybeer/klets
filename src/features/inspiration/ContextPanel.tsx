import { useState } from 'react';
import { Icon } from '../../app/SupportView';
import { SITUATION_LABELS, TONE_LABELS, type Selection, type Situation, type Tone } from './model';

export default function ContextPanel({ selection, onConfirm, onCancel }: { selection: Selection; onConfirm(value: Selection): void; onCancel(): void }) {
  const [draft, setDraft] = useState(selection);
  return <form className="context-form" onSubmit={event => { event.preventDefault(); onConfirm(draft); }}>
    <fieldset><legend>Waar zijn jullie?</legend><div className="choice-row">
      {(Object.keys(SITUATION_LABELS) as Situation[]).map(value => <label className={`choice ${draft.situation === value ? 'is-selected' : ''}`} key={value}>
        <input type="radio" name="situation" value={value} checked={draft.situation === value} onChange={() => setDraft({ ...draft, situation: value })} />
        {SITUATION_LABELS[value]}{draft.situation === value && <Icon name="check" />}
      </label>)}
    </div></fieldset>
    <fieldset><legend>Welke toon past?</legend><div className="tone-choices">
      {(Object.keys(TONE_LABELS) as Tone[]).map(value => <label className={`choice tone-choice ${draft.tone === value ? 'is-selected' : ''}`} key={value}>
        <input type="radio" name="tone" value={value} checked={draft.tone === value} onChange={() => setDraft({ ...draft, tone: value })} />
        <span><strong>{TONE_LABELS[value]}</strong><small>{value === 'warm' ? 'Warm en uitnodigend' : value === 'playful' ? 'Met een kleine knipoog' : 'Kort en duidelijk'}</small></span>
        {draft.tone === value && <Icon name="check" />}
      </label>)}
    </div></fieldset>
    <div className="panel-actions"><button className="button button-primary" type="submit">Keuze gebruiken<Icon name="check" /></button><button className="text-button" type="button" onClick={onCancel}>Annuleren</button></div>
  </form>;
}
