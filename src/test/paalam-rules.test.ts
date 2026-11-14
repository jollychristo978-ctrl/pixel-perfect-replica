import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {learnerPaths,profileSchema} from '@/lib/paalam';
const base={displayName:'Test learner',country:'UK',timezone:'Europe/London',ageGroup:'18+',school:'',interests:[],nativeLanguage:'English',learningLanguage:'Tamil',inviteCode:''};
const sql=readFileSync('drizzle/migrations/0000_paalam_profiles_roles_and_charity_invites.sql','utf8');
describe('Paalam profile rules',()=>{
 it('maps UK Tamil learners to learner_tamil',()=>expect(learnerPaths.Tamil).toMatchObject({country:'UK',role:'learner_tamil'}));
 it('maps Sri Lankan English learners to learner_english',()=>expect(learnerPaths.English).toMatchObject({country:'Sri Lanka',role:'learner_english'}));
 it('accepts all three requested age groups',()=>{for(const ageGroup of ['under 13','13–17','18+'])expect(profileSchema.safeParse({...base,ageGroup}).success).toBe(true)});
 it('rejects other age groups',()=>expect(profileSchema.safeParse({...base,ageGroup:'13–18'}).success).toBe(false));
 it('accepts editable IANA timezones',()=>expect(profileSchema.safeParse({...base,timezone:'Asia/Colombo'}).success).toBe(true));
 it('rejects invalid timezones',()=>expect(profileSchema.safeParse({...base,timezone:'Moon/City'}).success).toBe(false));
 it('rejects a country that conflicts with the mirrored learning path',()=>expect(profileSchema.safeParse({...base,country:'Sri Lanka'}).success).toBe(false));
 it('does not store roles in profiles',()=>{const profile=sql.split('CREATE TABLE public.profiles')[1]?.split('GRANT SELECT')[0];expect(profile).not.toMatch(/\brole\b/)});
 it('restricts invite redemption to active unexpired coordinator invites',()=>expect(sql).toContain("i.active AND i.expires_at>now() AND public.has_role(i.coordinator_id,'coordinator')"));
 it('restricts staff assignment to an authenticated admin',()=>expect(sql).toContain("IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'"));
});
