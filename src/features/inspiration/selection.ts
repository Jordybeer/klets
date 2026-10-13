import type { Idea, PoolState, Selection } from './model';

export function eligibleIdeas(catalog: readonly Idea[], selection: Selection): Idea[] {
  return catalog.filter(idea => idea.status === 'approved' && idea.intent === selection.intent && idea.situations.includes(selection.situation) && idea.tones.includes(selection.tone));
}

function shuffle(ids: string[], random: () => number): string[] {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const sample = random();
    const other = Math.floor((Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 1 - Number.EPSILON) : 0) * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

export function reserveIdea(catalog: readonly Idea[], selection: Selection, pool: PoolState | undefined, lastShownId: string | null, random: () => number): { idea: Idea | null; pool: PoolState } {
  const eligible = eligibleIdeas(catalog, selection);
  // The signature tracks real editorial changes, not a separately maintained release number.
  const catalogVersion = JSON.stringify([selection.situation, selection.tone, selection.intent, catalog.map(idea => [idea.id, idea.text, idea.intent, [...idea.situations].sort(), [...idea.tones].sort(), idea.status, idea.qualification ?? null]).sort((a, b) => String(a[0]).localeCompare(String(b[0])))]);
  const ids = eligible.map(idea => idea.id);
  let remaining = pool?.catalogVersion === catalogVersion ? [...new Set(pool.remainingIds)].filter(id => ids.includes(id)) : [];
  if (!remaining.length || (remaining.length === 1 && remaining[0] === lastShownId && eligible.length > 1)) {
    // A cross-filter boundary can leave only the globally last shown ID. Restart
    // the cycle so it stays eligible while another result appears first.
    remaining = shuffle(ids, random);
  }
  const nextIndex = remaining.findIndex(id => id !== lastShownId);
  if (remaining[0] === lastShownId && nextIndex > 0) [remaining[0], remaining[nextIndex]] = [remaining[nextIndex], remaining[0]];
  const id = remaining.shift();
  return { idea: eligible.find(idea => idea.id === id) ?? null, pool: { catalogVersion, remainingIds: remaining } };
}
