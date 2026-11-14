import {describe,it,expect} from 'vitest';
import {MAX_EXCHANGES,roleplayEnded,roleplayStars,ROLEPLAY_SCENES} from '@/lib/roleplay-scenes';
describe('Scenes rules',()=>{
 it('ends after six exchanges',()=>{expect(MAX_EXCHANGES).toBe(6);expect(roleplayEnded(5,false)).toBe(false);expect(roleplayEnded(6,false)).toBe(true);});
 it('ends when the goal is reached',()=>expect(roleplayEnded(2,true)).toBe(true));
 it('keeps ratings from one to five stars',()=>{expect(roleplayStars(0)).toBe(1);expect(roleplayStars(100)).toBe(5);expect(roleplayStars(60)).toBe(3);});
 it('offers all three requested situations with different preset voices',()=>{expect(ROLEPLAY_SCENES.map(s=>s.id)).toEqual(['auto','kothu','wedding']);expect(new Set(ROLEPLAY_SCENES.map(s=>s.voice)).size).toBe(3);});
});