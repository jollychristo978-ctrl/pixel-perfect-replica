import {describe,it,expect} from 'vitest';
import {journeyStep,callProgress,FIRST_CALL_XP} from '@/lib/paalam-journey';
describe('Paalam journey',()=>{
  it('maps Watch routes to step one',()=>{expect(journeyStep('/quest')).toBe('watch');expect(journeyStep('/cinema')).toBe('watch');});
  it('maps Practise routes to step two',()=>{for(const path of ['/paati','/practice','/scenes','/bridge'])expect(journeyStep(path)).toBe('practise');});
  it('maps Connect routes to step three',()=>{expect(journeyStep('/calls')).toBe('connect');expect(journeyStep('/impact')).toBe('connect');});
  it('unlocks the first-call nudge at 200 XP',()=>{expect(FIRST_CALL_XP).toBe(200);expect(callProgress(199)).toEqual({unlocked:false,remaining:1});expect(callProgress(200)).toEqual({unlocked:true,remaining:0});expect(callProgress(300)).toEqual({unlocked:true,remaining:0});});
});