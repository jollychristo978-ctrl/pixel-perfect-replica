import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema } from './paalam';
import { z } from 'zod';
export const getAccount = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const [profile, role] = await Promise.all([context.supabase.from('profiles').select('*').eq('id',context.userId).maybeSingle(), context.supabase.from('user_roles').select('role').eq('user_id',context.userId).maybeSingle()]);
 if(profile.error) throw new Error(profile.error.message); if(role.error) throw new Error(role.error.message);
 return {profile:profile.data,role:role.data?.role ?? null};
});
export const saveProfile = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input => profileSchema.parse(input)).handler(async ({data,context}) => {
 const {error} = await context.supabase.rpc('save_paalam_profile',{p_display_name:data.displayName,p_country:data.country,p_timezone:data.timezone,p_age_group:data.ageGroup,p_school:data.school,p_interests:data.interests,p_native_language:data.nativeLanguage,p_learning_language:data.learningLanguage,p_invite_code:data.inviteCode});
 if(error) throw new Error(error.message); return {saved:true};
});
export const getStaffData = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const {data:role,error} = await context.supabase.from('user_roles').select('role').eq('user_id',context.userId).maybeSingle();
 if(error) throw new Error(error.message); if(role?.role!=='coordinator' && role?.role!=='admin') throw new Error('Staff access required');
 const studentsQuery = context.supabase.from('profiles').select('*').order('created_at',{ascending:false});
 const [students,invites] = await Promise.all([role.role==='admin' ? studentsQuery : studentsQuery.eq('coordinator_id',context.userId), context.supabase.from('charity_invites').select('*').order('created_at',{ascending:false})]);
 if(students.error) throw new Error(students.error.message); if(invites.error) throw new Error(invites.error.message);
 return {students:students.data,invites:invites.data};
});
export const createInvite = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({charityName:z.string().trim().min(2).max(120)}).parse(input)).handler(async ({data,context})=>{
 const {data:code,error}=await context.supabase.rpc('create_charity_invite',{p_charity_name:data.charityName}); if(error) throw new Error(error.message); return code;
});
export const assignStaff = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({userId:z.string().uuid(),role:z.enum(['coordinator','admin'])}).parse(input)).handler(async ({data,context})=>{
 const {error}=await context.supabase.rpc('set_paalam_staff_role',{p_user_id:data.userId,p_role:data.role}); if(error) throw new Error(error.message); return {saved:true};
});
