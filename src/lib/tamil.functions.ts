import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are a patient Tamil teacher. Use standard modern Tamil, correct spelling, and simple sentences suited to grammar student. Reply only with JSON.";

const TeacherOut = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      tamil: z.string(),
      transliteration: z.string(),
      english: z.string(),
      tip: z.string(),
    }),
  ),
});

export const askTeacher = createServerFn({ method: "POST" })
  .inputValidator((d: { request: string }) => d)
  .handler(async ({ data }) => {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.request },
        ],
      }),
    });
    if (res.status === 429 || res.status === 402) return { error: res.status as number };
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = await res.json();
    return { result: TeacherOut.parse(JSON.parse(json.choices[0].message.content)) };
  });

export type AudioKind = "speak" | "correct" | "wrong" | "levelup" | "music";

const SFX_PROMPTS: Record<Exclude<AudioKind, "speak" | "music">, string> = {
  correct: "bright cheerful chime, single happy bell",
  wrong: "soft gentle low buzz, mild mistake sound, not harsh",
  levelup: "short triumphant celebratory fanfare, joyful chord",
};

export const getAudio = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: AudioKind; text?: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env["ELEVENLABS_API_KEY"];
    if (!apiKey) throw new Error("ElevenLabs is not connected to this project");

    let res: Response;
    if (data.kind === "speak") {
      res = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128",
        {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.text ?? "",
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
              speed: 0.9,
            },
          }),
        },
      );
    } else if (data.kind === "music") {
      res = await fetch("https://api.elevenlabs.io/v1/music", {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "upbeat Tamil folk loop, parai drum, nadaswaram, veena, no vocals",
          music_length_ms: 30000,
        }),
      });
    } else {
      res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: SFX_PROMPTS[data.kind],
          duration_seconds: 1.5,
          prompt_influence: 0.4,
        }),
      });
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ElevenLabs error ${res.status}: ${body}`);
    }
    const audio = Buffer.from(await res.arrayBuffer()).toString("base64");
    return { audio };
  });
