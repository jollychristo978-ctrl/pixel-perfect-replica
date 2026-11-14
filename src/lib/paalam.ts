import { z } from 'zod';
export const learnerPaths = {
 Tamil: { role: 'learner_tamil', country: 'UK', native: 'English', timezone: 'Europe/London' },
 English: { role: 'learner_english', country: 'Sri Lanka', native: 'Tamil', timezone: 'Asia/Colombo' },
} as const;
export type LearningLanguage = keyof typeof learnerPaths;
export const profileSchema = z.object({
 displayName: z.string().trim().min(2).max(80),
 country: z.enum(['UK', 'Sri Lanka']),
 timezone: z.string().refine(value => { try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; } }, 'Enter a valid timezone, such as Europe/London'),
 ageGroup: z.enum(['under 13','13–17','18+']),
 school: z.string().trim().max(160),
 interests: z.array(z.string().max(40)).max(8),
 nativeLanguage: z.enum(['English','Tamil','Other']),
 learningLanguage: z.enum(['Tamil','English']),
 inviteCode: z.string().trim().max(64).default(''),
}).refine(p => p.country === learnerPaths[p.learningLanguage].country, { message: 'Country must match your learning path', path: ['country'] });
export type ProfileInput = z.infer<typeof profileSchema>;
export function meta(title: string, description: string) { return { meta: [{ title: `${title} · Paalam | பாலம்` }, { name:'description', content:description }, { property:'og:title', content:`${title} · Paalam` }, { property:'og:description', content:description }, { property:'og:type', content:'website' }, { name:'twitter:card', content:'summary_large_image' }] }; }
