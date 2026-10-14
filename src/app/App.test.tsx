import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('../features/stage/PlayStage', () => ({ default: ({ onActivate, onContact, onSettled, actionId }: { onActivate(): void; onContact(id: string): void; onSettled(id: string): void; actionId: string | null }) => <div><button onClick={onActivate}>Nieuw passend idee</button>{actionId && <button onClick={() => { onContact(actionId); onSettled(actionId); }}>Animatie afronden</button>}</div> }));

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([new DOMRect(0, 0, 44, 44)] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

describe('supporting views', () => {
  it('discards a context draft on Escape and restores the recreated opener', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Samen.*Speels.*Aanpassen/ }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Wat past bij jullie?' })).toHaveFocus());
    await user.click(screen.getByRole('radio', { name: /Op afstand/ }));
    await user.click(screen.getByRole('radio', { name: /Direct/ }));
    await user.keyboard('{Escape}');
    const opener = await screen.findByRole('button', { name: /Samen.*Speels.*Aanpassen/ });
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('commits category immediately and returns through a nested context editor using browser Back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Waardering' }));
    expect(screen.getByRole('button', { name: 'Waardering' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Nieuw passend idee' }));
    await user.click(screen.getByRole('button', { name: 'Animatie afronden' }));
    await user.click(screen.getByRole('button', { name: /Past dit nu/ }));
    expect(screen.getByText('Benoem ik iets concreets dat ik werkelijk waardeer?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eerst afstemmen' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Heb ik al iets gevraagd/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Toon aanpassen' }));
    await user.click(screen.getByRole('radio', { name: /Op afstand/ }));
    await user.click(screen.getByRole('button', { name: 'Keuze gebruiken' }));
    await screen.findByRole('heading', { name: 'Past dit nu?' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Toon aanpassen' })).toHaveFocus());
    window.history.back();
    await screen.findByRole('button', { name: /Op afstand.*Speels.*Aanpassen/ });
    expect(screen.getByText('Voor je volgende tik')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Jouw idee' })).getByText(/Dit idee: Waardering/)).toHaveTextContent('Samen');
    await waitFor(() => expect(screen.getByRole('button', { name: /Past dit nu/ })).toHaveFocus());
  });

  it('finalizes a pending draw before leaving and supports removing and undoing a saved idea', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Kopiëren' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nieuw passend idee' }));
    await user.click(screen.getByRole('button', { name: 'Instellingen' }));
    await user.click(screen.getByRole('button', { name: 'Terug' }));
    await screen.findByRole('button', { name: 'Kopiëren' });
    expect(screen.queryByRole('button', { name: 'Animatie afronden' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bewaren' }));
    await user.click(screen.getByRole('button', { name: /Opgeslagen ideeën/ }));
    await user.click(screen.getByRole('button', { name: /Verwijder:/ }));
    expect(screen.getByText('Je hebt nog geen ideeën bewaard.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ongedaan maken' }));
    expect(screen.getAllByRole('button', { name: /Verwijder:/ })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Ongedaan maken' })).not.toBeInTheDocument();
  });

  it('checks and saves the visible snapshot while finalizing a different pending idea', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Waardering' }));
    await user.click(screen.getByRole('button', { name: 'Nieuw passend idee' }));
    await user.click(screen.getByRole('button', { name: 'Animatie afronden' }));
    const visible = document.querySelector('.result-text')!.textContent!;
    await user.click(screen.getByRole('button', { name: 'Opdrachtje' }));
    await user.click(screen.getByRole('button', { name: 'Nieuw passend idee' }));
    await user.click(screen.getByRole('button', { name: /Past dit nu/ }));
    expect(screen.getByText(visible)).toHaveClass('support-quote');
    expect(screen.getByText('Benoem ik iets concreets dat ik werkelijk waardeer?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Toon aanpassen' }));
    await user.click(screen.getByRole('button', { name: 'Annuleren' }));
    await screen.findByRole('heading', { name: 'Past dit nu?' });
    expect(screen.getByText(visible)).toHaveClass('support-quote');
    await user.click(screen.getByRole('button', { name: 'Bewaren voor later' }));
    await screen.findByRole('button', { name: 'Kopiëren' });
    expect(document.querySelector('.result-text')!.textContent).not.toBe(visible);
    expect(screen.queryByRole('button', { name: 'Animatie afronden' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bewaren' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Opgeslagen ideeën/ }));
    expect(screen.getByText(visible)).toHaveClass('saved-text');
    expect(screen.getAllByRole('button', { name: /Verwijder:/ })).toHaveLength(1);
  });

  it('treats opening the active settings view as a no-op', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Instellingen' }));
    await user.click(screen.getByRole('button', { name: 'Instellingen' }));
    await user.click(screen.getByRole('button', { name: 'Terug' }));
    await screen.findByRole('button', { name: 'Nieuw passend idee' });
  });

  it('falls back to the returned view heading if its opener is no longer visible', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Samen.*Speels.*Aanpassen/ }));
    vi.mocked(HTMLElement.prototype.getClientRects).mockReturnValue([] as unknown as DOMRectList);
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Een passend idee voor jullie' })).toHaveFocus());
    const before = window.history.state;
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(window.history.state).toEqual(before);
  });
});
