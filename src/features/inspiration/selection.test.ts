import { describe, expect, it } from 'vitest';
import { DEFAULT_SELECTION, type Idea, type PoolState } from './model';
import { eligibleIdeas, reserveIdea } from './selection';

const idea = (id: string, patch: Partial<Idea> = {}): Idea => ({ id, text: `Zin ${id}`, intent: 'request', situations: ['together'], tones: ['playful'], status: 'approved', ...patch });
const catalog = [idea('a'), idea('b'), idea('c'), idea('remote', { situations: ['remote'] }), idea('warm', { tones: ['warm'] }), idea('tease', { intent: 'tease' })];

describe('selection', () => {
  it('filtersExactSelection', () => { expect(eligibleIdeas(catalog, DEFAULT_SELECTION).map(item => item.id)).toEqual(['a', 'b', 'c']); });
  it('emptyPoolReturnsNull', () => { expect(reserveIdea([], DEFAULT_SELECTION, undefined, null, () => 0).idea).toBeNull(); });
  it('singlePoolIsExplicit', () => { const result = reserveIdea([idea('a')], DEFAULT_SELECTION, undefined, 'a', () => 0); expect(result.idea?.id).toBe('a'); expect(result.pool.remainingIds).toEqual([]); });
  it('exhaustionReshuffles', () => {
    let pool: PoolState | undefined; let last: string | null = null; const ids: string[] = [];
    for (let index = 0; index < 6; index++) { const draw = reserveIdea(catalog, DEFAULT_SELECTION, pool, last, () => 0.2); pool = draw.pool; last = draw.idea!.id; ids.push(last); }
    expect(new Set(ids.slice(0, 3)).size).toBe(3); expect(new Set(ids.slice(3)).size).toBe(3); expect(ids[3]).not.toBe(ids[2]);
  });
  it('avoidsLastShownWhenPossible', () => {
    const seed = reserveIdea(catalog, DEFAULT_SELECTION, undefined, null, () => 0);
    const draw = reserveIdea(catalog, DEFAULT_SELECTION, { ...seed.pool, remainingIds: ['a', 'b'] }, 'a', () => 0);
    expect(draw.idea?.id).toBe('b'); expect(draw.pool.remainingIds).toContain('a');
  });
  it('crossFilterBoundaryRestartsWithoutLosingLastIdForever', () => {
    const seed = reserveIdea(catalog, DEFAULT_SELECTION, undefined, null, () => 0);
    const draw = reserveIdea(catalog, DEFAULT_SELECTION, { ...seed.pool, remainingIds: ['a'] }, 'a', () => 0);
    expect(draw.idea?.id).not.toBe('a'); expect(draw.pool.remainingIds).toContain('a');
    let next = draw; const rest: string[] = [];
    for (let index = 0; index < 2; index++) { next = reserveIdea(catalog, DEFAULT_SELECTION, next.pool, next.idea!.id, () => 0); rest.push(next.idea!.id); }
    expect(rest).toContain('a');
  });
  it('catalogChangeRemovesStaleIds', () => {
    const seed = reserveIdea(catalog, DEFAULT_SELECTION, undefined, null, () => 0);
    const updated = [idea('a', { text: 'Een gewijzigde zin' }), idea('new')];
    const draw = reserveIdea(updated, DEFAULT_SELECTION, seed.pool, seed.idea?.id ?? null, () => 0);
    expect(draw.pool.catalogVersion).not.toBe(seed.pool.catalogVersion); expect([draw.idea?.id, ...draw.pool.remainingIds].sort()).toEqual(['a', 'new']);
    const tagsChanged = reserveIdea([idea('a', { tones: ['warm'] }), idea('new')], DEFAULT_SELECTION, draw.pool, null, () => 0);
    expect(tagsChanged.idea?.id).toBe('new'); expect(tagsChanged.pool.remainingIds).toEqual([]);
  });
});
