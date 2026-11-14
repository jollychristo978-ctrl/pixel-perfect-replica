import { describe, expect, it } from 'vitest';
import { dailyDive, DIVE_PROMPTS, DIVE_ROUNDS, DIVE_SECONDS, diveDepth, scoreDiveAnswer } from '@/lib/tamil-dive';
import { journeyStep } from '@/lib/paalam-journey';
describe('Tamil Dive', () => {
  const fruit = DIVE_PROMPTS[0];
  it('accepts Tamil, transliteration and English for the same answer', () => {
    if (!fruit) throw new Error('Missing fruit prompt');
    for (const input of ['மாம்பழம்', ' maampazham ', 'MANGO']) expect(scoreDiveAnswer(fruit,input)?.tamil).toBe('மாம்பழம்');
  });
  it('rejects empty and unlisted answers without points', () => {
    if (!fruit) throw new Error('Missing fruit prompt');
    expect(scoreDiveAnswer(fruit,'')).toBeNull();expect(scoreDiveAnswer(fruit,'spaceship')).toBeNull();
  });
  it('uses seven distinct prompts and a 25-second round', () => {
    expect(DIVE_ROUNDS).toBe(7);expect(DIVE_SECONDS).toBe(25);
    expect(new Set(dailyDive(new Date('2026-11-14T01:00:00Z')).map(p=>p.id)).size).toBe(7);
  });
  it('shares the same set throughout a UTC day', () => {
    expect(dailyDive(new Date('2026-11-14T00:00:00Z'))).toEqual(dailyDive(new Date('2026-11-14T23:59:59Z')));
    expect(dailyDive(new Date('2026-11-15T00:00:00Z'))).not.toEqual(dailyDive(new Date('2026-11-14T00:00:00Z')));
  });
  it('awards curated difficulty scores with ten metres per point', () => {
    if (!fruit) throw new Error('Missing fruit prompt');
    expect(scoreDiveAnswer(fruit,'mango')?.points).toBe(30);expect(scoreDiveAnswer(fruit,'gooseberry')?.points).toBe(100);expect(diveDepth(100)).toBe(1000);
  });
  it('keeps Dive in Practise', () => expect(journeyStep('/tamil-dive')).toBe('practise'));
});