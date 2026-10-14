import { useState } from 'react';
import { Icon } from '../../app/SupportView';
import { INTENT_LABELS, SITUATION_LABELS, TONE_LABELS, type Favorite } from './model';

export default function SavedIdeas({ favorites, persistence, onRemove, onUndo, onBack }: { favorites: Favorite[]; persistence: boolean; onRemove(id: string): void; onUndo(): void; onBack(): void }) {
  const [removed, setRemoved] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(favorites.length / 4));
  const currentPage = Math.min(page, pages - 1);
  return <div className="saved-ideas">
    <p className="quiet-note">{persistence ? 'Bewaard op dit apparaat, voor een ander moment.' : 'Bewaard voor deze sessie. Opslaan op dit apparaat lukt nu niet.'}</p>
    {removed && <div className="undo-notice"><span role="status">Verwijderd: “{removed}”</span><button className="text-button" onClick={() => { onUndo(); setRemoved(null); }}>Ongedaan maken</button></div>}
    {favorites.length ? <><ul className="saved-list">{favorites.slice(currentPage * 4, currentPage * 4 + 4).map(favorite => <li key={favorite.ideaId}><div><p className="saved-context">{INTENT_LABELS[favorite.intent]} · {SITUATION_LABELS[favorite.selection.situation]} · {TONE_LABELS[favorite.selection.tone]}</p><p className="saved-text">{favorite.text}</p></div><button className="icon-button remove-button" aria-label={`Verwijder: ${favorite.text}`} onClick={() => { onRemove(favorite.ideaId); setRemoved(favorite.text); }}><Icon name="trash" /></button></li>)}</ul>{pages > 1 && <nav className="pagination" aria-label="Opgeslagen ideeën"><button className="icon-button" aria-label="Vorige pagina" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><Icon name="arrow" /></button><span>{currentPage + 1} van {pages}</span><button className="icon-button" aria-label="Volgende pagina" disabled={currentPage === pages - 1} onClick={() => setPage(currentPage + 1)}><Icon name="chevron" /></button></nav>}</> : <div className="saved-empty"><Icon name="heart" /><h2>Hier komt wat je raakt.</h2><p>Je hebt nog geen ideeën bewaard.</p><button className="button button-primary" onClick={onBack}>Terug naar inspiratie</button></div>}
  </div>;
}
