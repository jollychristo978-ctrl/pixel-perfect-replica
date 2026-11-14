import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

// Workerd-safe base64 helpers (no Node Buffer).
export function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function requireElevenLabsKey(): string {
  const key = process.env['ELEVENLABS_API_KEY'];
  if (!key) throw new Error('ElevenLabs is not connected to this project');
  return key;
}

export async function transcribeAudio(base64: string, mime: string): Promise<string> {
  const apiKey = requireElevenLabsKey();
  const bytes = base64ToBytes(base64);
  const form = new FormData();
  form.append('file', new Blob([bytes as unknown as BlobPart], { type: mime || 'audio/webm' }), 'clip.webm');
  form.append('model_id', 'scribe_v2');
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Transcription failed [${res.status}]: ${body}`);
  }
  const json = await res.json();
  return (json.text as string) ?? '';
}

export async function askAiJson(system: string, user: string): Promise<unknown> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env['LOVABLE_API_KEY']}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (res.status === 429 || res.status === 402) throw new Error('AI is busy right now — please try again in a minute.');
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

const wordSchema = z.object({ tamil: z.string(), transliteration: z.string(), english: z.string() });
const quizSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer_index: z.number().int().min(0).max(3),
});
const clipAiSchema = z.object({
  translation_tamil: z.string(),
  words: z.array(wordSchema).max(10),
  quiz: z.array(quizSchema).max(3),
});
export type ClipWord = z.infer<typeof wordSchema>;
export type ClipQuiz = z.infer<typeof quizSchema>;

const clipInput = z.object({
  title: z.string().trim().min(1).max(80),
  audioBase64: z.string().max(14_000_000, 'Clip is too large — keep it under about 10 MB'),
  mime: z.string().max(60).default('audio/webm'),
});

export const processClip = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => clipInput.parse(input))
  .handler(async ({ data, context }) => {
    const transcript = await transcribeAudio(data.audioBase64, data.mime);
    if (!transcript.trim()) throw new Error('We could not hear any speech in that clip. Try a clearer recording.');

    const ai = clipAiSchema.parse(
      await askAiJson(
        'You are a Tamil teacher building a lesson from a short video transcript. Reply only with JSON matching: {"translation_tamil": string, "words": [{"tamil": string, "transliteration": string, "english": string}], "quiz": [{"question": string, "options": [4 strings], "answer_index": 0-3}]}. Pick 5-8 useful vocabulary words from the transcript with correct Tamil spelling. Write exactly 3 quick comprehension questions about what happens in the clip, in simple English.',
        `Transcript of the clip:\n${transcript}`,
      ),
    );

    const { data: clip, error } = await context.supabase
      .from('clips')
      .insert({
        user_id: context.userId,
        title: data.title,
        transcript,
        translation: ai.translation_tamil,
        words: ai.words,
        quiz: ai.quiz,
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.rpc('add_paalam_xp', { p_points: 25, p_reason: 'clip_quest' });
    return { clipId: clip.id, transcript, translation: ai.translation_tamil, words: ai.words, quiz: ai.quiz };
  });

export const saveWord = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => wordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from('saved_words')
      .upsert({ user_id: context.userId, ...data }, { onConflict: 'user_id,tamil' });
    if (error) throw new Error(error.message);
    await context.supabase.rpc('add_paalam_xp', { p_points: 10, p_reason: 'word_saved' });
    return { saved: true };
  });

export const awardXp = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ points: z.number().int().min(1).max(100), reason: z.string().max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc('add_paalam_xp', { p_points: data.points, p_reason: data.reason });
    if (error) throw new Error(error.message);
    return { awarded: true };
  });

export const getBridgeData = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [xp, words, counters] = await Promise.all([
      context.supabase.from('xp_events').select('points, created_at'),
      context.supabase.from('saved_words').select('tamil, transliteration, english').order('created_at', { ascending: false }),
      context.supabase.from('impact_counters').select('*').eq('id', 1).single(),
    ]);
    if (xp.error) throw new Error(xp.error.message);
    if (words.error) throw new Error(words.error.message);
    if (counters.error) throw new Error(counters.error.message);
    const totalXp = xp.data.reduce((sum, e) => sum + e.points, 0);
    // Streak: consecutive days (UTC) with at least one XP event, ending today or yesterday.
    const days = new Set(xp.data.map((e) => e.created_at.slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { totalXp, streak, words: words.data, counters: counters.data };
  });

export const getImpact = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createClient(
    import.meta.env['VITE_SUPABASE_URL'] as string,
    import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.from('impact_counters').select('*').eq('id', 1).single();
  if (error) throw new Error(error.message);
  return data;
});

const PARTNERS = ['Kavya (Jaffna)', 'Tharindu (Colombo)', 'Meera (Batticaloa)', 'Ashan (Kandy)'];

export const bookCall = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ slotStart: z.string().datetime({ offset: true }), partnerIndex: z.number().int().min(0).max(3) }).parse(input))
  .handler(async ({ data, context }) => {
    const partner = PARTNERS[data.partnerIndex] ?? PARTNERS[0]!;
    const { error } = await context.supabase.rpc('book_paalam_call', {
      p_slot_start: data.slotStart,
      p_partner_name: partner,
    });
    if (error) throw new Error(error.message);
    await context.supabase.rpc('add_paalam_xp', { p_points: 20, p_reason: 'call_booked' });
    return { booked: true, partner };
  });

export const getMyCalls = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('call_bookings')
      .select('id, partner_name, slot_start')
      .gte('slot_start', new Date().toISOString())
      .order('slot_start', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

// ---- Paati Says ----

export const paatiCheck = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      audioBase64: z.string().max(6_000_000),
      mime: z.string().max(60).default('audio/webm'),
      expectedTamil: z.string().max(120),
      challengeId: z.string().max(40),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const heard = await transcribeAudio(data.audioBase64, data.mime);
    const verdict = z.object({ correct: z.boolean() }).parse(
      await askAiJson(
        'You are Paati, a kind Tamil grandmother checking a learner\'s spoken answer. Reply only with JSON {"correct": boolean}. Accept small pronunciation or spelling slips if the learner clearly said the right Tamil word or phrase.',
        `Expected Tamil: "${data.expectedTamil}". What the learner said (transcribed): "${heard}".`,
      ),
    );
    if (verdict.correct) {
      await context.supabase.rpc('add_paalam_xp', { p_points: 15, p_reason: `paati_${data.challengeId}` });
    }
    return { heard, correct: verdict.correct };
  });
