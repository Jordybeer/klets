import { describe, expect, it } from 'vitest';
import { CATALOG, CATALOG_VERSION } from './catalog';
import type { Intent, Situation, Tone } from './model';

const intents: Intent[] = ['request', 'tease', 'appreciation', 'desire'];
const situations: Situation[] = ['together', 'remote'];
const tones: Tone[] = ['warm', 'playful', 'direct'];

describe('approved inspiration catalog', () => {
  it('has 160 unique ideas, with 40 stable IDs per intent', () => {
    expect(CATALOG).toHaveLength(160);
    expect(new Set(CATALOG.map((idea) => idea.id)).size).toBe(160);
    expect(new Set(CATALOG.map((idea) => idea.text.trim().toLocaleLowerCase('nl'))).size).toBe(160);
    for (const intent of intents) {
      const ideas = CATALOG.filter((idea) => idea.intent === intent);
      expect(ideas).toHaveLength(40);
      expect(ideas.map((idea) => idea.id)).toEqual(
        Array.from({ length: 40 }, (_, index) => `${intent}-${String(index + 1).padStart(3, '0')}`),
      );
    }
  });

  it('has a version, approved text, and explicit valid nonduplicate tags', () => {
    expect(CATALOG_VERSION.trim()).not.toBe('');
    for (const idea of CATALOG) {
      expect(idea.status).toBe('approved');
      expect(intents).toContain(idea.intent);
      expect(idea.text.trim()).toBe(idea.text);
      expect(idea.text.length).toBeGreaterThan(10);
      expect(idea.text.length).toBeLessThanOrEqual(160);
      expect(idea.situations.length).toBeGreaterThan(0);
      expect(idea.tones.length).toBeGreaterThan(0);
      expect(new Set(idea.situations).size).toBe(idea.situations.length);
      expect(new Set(idea.tones).size).toBe(idea.tones.length);
      for (const situation of idea.situations) expect(situations).toContain(situation);
      for (const tone of idea.tones) expect(tones).toContain(tone);
    }
  });

  for (const intent of intents) {
    for (const situation of situations) {
      for (const tone of tones) {
        it(`offers at least three distinct ${intent}/${situation}/${tone} choices`, () => {
          const choices = CATALOG.filter((idea) => idea.intent === intent
            && idea.situations.includes(situation) && idea.tones.includes(tone));
          expect(new Set(choices.map((idea) => idea.text)).size).toBeGreaterThanOrEqual(3);
        });
      }
    }
  }
});
