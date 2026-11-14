import {describe,it,expect} from 'vitest';
import {CINEMA_SCENES,boxOfficeStars,sceneUnlocked} from '@/lib/cinema-scenes';
describe('Cinema Tutor',()=>{
 it('rates scenes between one and five stars',()=>{expect(boxOfficeStars([0,0,0])).toBe(1);expect(boxOfficeStars([100,100,100])).toBe(5);expect(boxOfficeStars([50,50,50])).toBe(3)});
 it('unlocks scenes after the previous scene completes',()=>{expect(sceneUnlocked(0,[])).toBe(true);expect(sceneUnlocked(1,[])).toBe(false);expect(sceneUnlocked(1,['kothu'])).toBe(true);expect(sceneUnlocked(2,['kothu'])).toBe(false)});
 it('provides the four requested scenes with three acted lines each',()=>{expect(CINEMA_SCENES.map(s=>s.id)).toEqual(['kothu','cricket','family','rain']);expect(CINEMA_SCENES.every(s=>s.lines.length===3)).toBe(true)});
});