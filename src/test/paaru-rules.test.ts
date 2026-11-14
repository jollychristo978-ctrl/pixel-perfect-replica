import {describe,expect,it} from 'vitest';
import {placementDone,placementLevel,earnedStamps} from '@/lib/paaru';
describe('Paaru features',()=>{
  it('level check stops after two misses',()=>{ expect(placementDone(2,2)).toBe(true); expect(placementDone(2,1)).toBe(false); });
  it('places learners by correct answers',()=>{ expect(placementLevel(0)).toBe('new'); expect(placementLevel(3)).toBe('beginner'); expect(placementLevel(6)).toBe('intermediate'); });
  it('awards stamps by saved words',()=>{ expect(earnedStamps(9)).toHaveLength(0); expect(earnedStamps(50).map(s=>s.id)).toEqual(['coffee','marina']); });
});
