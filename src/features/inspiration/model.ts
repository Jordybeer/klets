export type Intent = 'request' | 'tease' | 'appreciation' | 'desire';
export type Situation = 'together' | 'remote';
export type Tone = 'warm' | 'playful' | 'direct';
export type Selection = { situation: Situation; tone: Tone; intent: Intent };
export type Idea = {
  id: string;
  text: string;
  intent: Intent;
  situations: Situation[];
  tones: Tone[];
  status: 'approved';
  qualification?: string;
};
export type ResultSnapshot = {
  actionId: string;
  ideaId: string;
  text: string;
  intent: Intent;
  selection: Selection;
  drawnAt: number;
};
export type PoolState = { catalogVersion: string; remainingIds: string[] };
export type Favorite = ResultSnapshot & { savedAt: number };
export type Preferences = {
  selection: Selection;
  soundEnabled: boolean;
  motionMode: 'system' | 'paused' | 'full';
};
export type StoredState = { version: 1; preferences: Preferences; favorites: Favorite[] };
export const DEFAULT_SELECTION: Selection = { situation: 'together', tone: 'playful', intent: 'request' };
export const INTENT_LABELS: Record<Intent, string> = {
  request: 'Opdrachtje', tease: 'Plagen', appreciation: 'Waardering', desire: 'Verlangen',
};
export const TONE_LABELS: Record<Tone, string> = { warm: 'Lief', playful: 'Speels', direct: 'Direct' };
export const SITUATION_LABELS: Record<Situation, string> = { together: 'Samen', remote: 'Op afstand' };
