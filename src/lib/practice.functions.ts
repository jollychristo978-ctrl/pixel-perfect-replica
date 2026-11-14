import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { askAiJson, bytesToBase64, transcribeAudio } from './bridge.functions';

export const VOICE_PRESETS = {
  sarah: { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah' },
  george: { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George' },
  river: { id: 'SAz9YHcvj6GT2YYXdXww', label: 'River' },
} as const;
export type VoiceKey = keyof typeof VOICE_PRESETS | 'twin';

export const getPracticeData = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [topics, words, profile] = await Promise.all([
      context.supabase.from('practice_topics').select('id, topic, shared').order('created_at', { ascending: false }),
      context.supabase.from('saved_words').select('tamil, transliteration, english').order('created_at', { ascending: false }).limit(30),
      context.supabase.from('profiles').select('age_group, voice_verified, voice_twin_id, voice_twin_consented_at, display_name, learning_language').eq('id', context.userId).maybeSingle(),
    ]);
    if (topics.error) throw new Error(topics.error.message);
    if (words.error) throw new Error(words.error.message);
    if (profile.error) throw new Error(profile.error.message);
    const p = profile.data;
    return {
      topics: topics.data,
      words: words.data,
      ageGroup: p?.age_group ?? null,
      voiceVerified: p?.voice_verified ?? false,
      // Never send the stored voice ID to the browser — only that a twin exists.
      hasVoiceTwin: Boolean(p?.voice_twin_id && p?.voice_twin_consented_at),
      displayName: p?.display_name ?? '',
      learningLanguage: p?.learning_language ?? 'Tamil',
    };
  });

export const addTopic = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ topic: z.string().trim().min(2).max(60), shared: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from('practice_topics').insert({ user_id: context.userId, ...data });
    if (error) throw new Error(error.message);
    return { added: true };
  });

const replySchema = z.object({
  tamil: z.string(),
  transliteration: z.string(),
  english: z.string(),
  correction: z.string().nullable(),
});
export type PracticeReply = z.infer<typeof replySchema>;

const historyItem = z.object({ role: z.enum(['learner', 'partner']), text: z.string().max(500) });

export const practiceReply = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      message: z.string().trim().min(1).max(500),
      topic: z.string().max(60),
      history: z.array(historyItem).max(12).default([]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: words } = await context.supabase
      .from('saved_words')
      .select('tamil, english')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .limit(30);
    const wordList = (words ?? []).map((w) => `${w.tamil} (${w.english})`).join(', ') || 'none yet';

    const historyText = data.history.map((h) => `${h.role === 'learner' ? 'Learner' : 'Partner'}: ${h.text}`).join('\n');
    const reply = replySchema.parse(
      await askAiJson(
        `You are a friendly Tamil practice partner for a language learner. Reply only with JSON {"tamil": string, "transliteration": string, "english": string, "correction": string|null}. Rules: 1-2 short, simple Tamil sentences suited to a beginner. Use words from the learner's word list where they fit naturally. If the learner's message has a mistake, put a one-sentence gentle correction in "correction" (in English), otherwise null. Stay on the conversation topic.`,
        `Topic: ${data.topic}\nLearner's word list: ${wordList}\nConversation so far:\n${historyText || '(just started)'}\nLearner's new message: ${data.message}`,
      ),
    );
    return reply;
  });

export const practiceTranscribe = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ audioBase64: z.string().max(6_000_000), mime: z.string().max(60).default('audio/webm') }).parse(input),
  )
  .handler(async ({ data }) => {
    const text = await transcribeAudio(data.audioBase64, data.mime);
    return { text };
  });

export const speakPractice = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ text: z.string().trim().min(1).max(1000), voice: z.enum(['sarah', 'george', 'river', 'twin']) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    let voiceId: string;
    if (data.voice === 'twin') {
      const { data: profile, error } = await context.supabase
        .from('profiles')
        .select('voice_twin_id, voice_twin_consented_at')
        .eq('id', context.userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!profile?.voice_twin_id || !profile.voice_twin_consented_at) throw new Error('No Voice Twin is set up');
      voiceId = profile.voice_twin_id;
    } else {
      voiceId = VOICE_PRESETS[data.voice].id;
    }

    const apiKey = process.env['ELEVENLABS_API_KEY'];
    if (!apiKey) throw new Error('ElevenLabs is not connected to this project');
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: data.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Speech failed [${res.status}]: ${body}`);
    }
    const audio = bytesToBase64(new Uint8Array(await res.arrayBuffer()));
    return { audio };
  });

export const finishPractice = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ exchanges: z.number().int().min(1).max(50) }).parse(input))
  .handler(async ({ data, context }) => {
    const points = Math.min(10 + data.exchanges * 2, 40);
    const { error } = await context.supabase.rpc('add_paalam_xp', { p_points: points, p_reason: 'practice_session' });
    if (error) throw new Error(error.message);
    return { points };
  });

export const consentVoiceTwin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ voiceId: z.string().trim().min(5).max(80), consent: z.literal(true) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc('consent_voice_twin', { p_voice_id: data.voiceId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const deleteVoiceTwin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc('delete_voice_twin');
    if (error) throw new Error(error.message);
    return { deleted: true };
  });

export const setVoiceVerified = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid(), verified: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc('set_voice_verified', { p_user_id: data.userId, p_verified: data.verified });
    if (error) throw new Error(error.message);
    return { saved: true };
  });
