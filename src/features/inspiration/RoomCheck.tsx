import { useState } from 'react';
import { Icon } from '../../app/SupportView';
import type { ResultSnapshot } from './model';

export default function RoomCheck({ current, onBack, onSave, onAnother, onContext }: { current: ResultSnapshot; onBack(): void; onSave(): void; onAnother(): void; onContext(): void }) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [copied, setCopied] = useState('');
  const lastQuestion = current.intent === 'request' ? 'Heb ik al iets gevraagd waarop nog geen antwoord kwam?' : current.intent === 'appreciation' ? 'Benoem ik iets concreets dat ik werkelijk waardeer?' : 'Past deze toon bij ons contact van nu?';
  const checkIn = current.intent === 'request' ? 'Heb je zin in een klein opdrachtje?' : current.intent === 'tease' ? 'Heb je zin om een beetje te plagen?' : 'Zin om even samen te zijn?';
  return <div className="room-check">
    <blockquote className="support-quote">{current.text}</blockquote>
    <p className="check-caption">Even bij stilstaan. Je hoeft niets in te vullen.</p>
    <ul className="reflection-list"><li>Heeft ze nu ruimte en, waar nodig, privacy?</li><li>Is er speelse aansluiting, of zou ik eerst even contact maken?</li><li>{lastQuestion}</li></ul>
    <p className="quiet-note">Jullie voelen aan wat past. Een idee mag ook wachten.</p>
    {showCheckIn && <div className="check-in"><p>{checkIn}</p><button className="text-button" onClick={async () => { try { await navigator.clipboard.writeText(checkIn); setCopied('Gekopieerd'); } catch { setCopied('Selecteer en kopieer de tekst'); } }}><Icon name="copy" />Zin kopiëren</button><span role="status" className="small-status">{copied}</span></div>}
    <div className="panel-actions"><button className="button button-primary" onClick={onBack}>Terug naar idee<Icon name="arrow" /></button><button className="button button-secondary" onClick={onSave}><Icon name="heart" />Bewaren voor later</button></div>
    <div className="panel-links"><button className="text-button" onClick={onAnother}>Ander idee</button>{current.intent !== 'appreciation' && <button className="text-button" onClick={() => setShowCheckIn(value => !value)}>Eerst afstemmen</button>}<button className="text-button" data-focus="tone" onClick={onContext}>Toon aanpassen</button></div>
  </div>;
}
