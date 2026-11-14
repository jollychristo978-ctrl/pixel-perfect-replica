import {createServerFn} from '@tanstack/react-start';
import {getRequest} from '@tanstack/react-start/server';
import {z} from 'zod';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {CINEMA_SCENES,sceneUnlocked} from './cinema-scenes';
import {scoreCinema} from './cinema/scoring.server';
import {transcribeAudio} from './bridge.functions';
export const cinemaApplause=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async()=>{
 const key=process.env['ELEVENLABS_API_KEY'];if(!key)throw new Error('ElevenLabs is not connected');
 const response=await fetch('https://api.elevenlabs.io/v1/sound-generation',{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({text:'Short warm audience applause and cheerful clapping, no speech, small cinema audience',duration_seconds:1.5})});
 if(!response.ok)throw new Error(`Applause failed [${response.status}]: ${await response.text()}`);
 return {audio:Buffer.from(await response.arrayBuffer()).toString('base64')};
});
export const getCinema=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.from('cinema_completions').select('scene_id,stars,points');if(error)throw new Error(error.message);return data;
});
export const actCinema=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({sceneId:z.string(),lineIndex:z.number().int().min(0).max(2),text:z.string().max(600).default(''),audioBase64:z.string().max(6_000_000).default(''),mime:z.enum(['audio/webm','audio/webm;codecs=opus','audio/ogg','audio/ogg;codecs=opus','audio/mp4']).default('audio/webm')}).parse(input)).handler(async({data,context})=>{
 const index=CINEMA_SCENES.findIndex(s=>s.id===data.sceneId);const scene=CINEMA_SCENES[index];const line=scene?.lines[data.lineIndex];if(!line)throw new Error('Unknown scene line');
 const completed=await context.supabase.from('cinema_completions').select('scene_id');if(completed.error)throw new Error(completed.error.message);if(!sceneUnlocked(index,completed.data.map(s=>s.scene_id)))throw new Error('Finish the previous scene first');
 const heard=data.audioBase64?await transcribeAudio(data.audioBase64,data.mime):data.text.trim();if(!heard)throw new Error('No words heard. Try again.');
 const key=process.env['LOVABLE_API_KEY'];if(!key)throw new Error('AI scoring is not configured');
 const verdict=await scoreCinema(getRequest(),key,line,heard,Boolean(data.audioBase64));
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {error}=await supabaseAdmin.from('cinema_attempts').upsert({user_id:context.userId,scene_id:data.sceneId,line_index:data.lineIndex,meaning:verdict.meaning,pronunciation:verdict.pronunciation});if(error)throw new Error(error.message);
 return {...verdict,heard};
});
export const finishCinema=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({sceneId:z.string()}).parse(input)).handler(async({data,context})=>{
 if(!CINEMA_SCENES.some(s=>s.id===data.sceneId))throw new Error('Unknown scene');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:result,error}=await supabaseAdmin.rpc('complete_cinema_scene',{p_user:context.userId,p_scene:data.sceneId});if(error)throw new Error(error.message);
 return z.object({stars:z.number(),points:z.number(),awarded:z.boolean()}).parse(result);
});