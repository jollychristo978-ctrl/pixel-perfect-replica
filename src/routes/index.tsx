import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { askTeacher, getAudio, type AudioKind } from "../lib/tamil.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grammar Ghost Hunt — a Tamil Sentence Game" },
      {
        name: "description",
        content:
          "Catch falling Tamil words, build subject–object–verb sentences, and hear them spoken aloud. Built for PARAI TamilHack.",
      },
      { property: "og:title", content: "Grammar Ghost Hunt — a Tamil Sentence Game" },
      {
        property: "og:description",
        content:
          "Catch falling Tamil words, build subject–object–verb sentences, and hear them spoken aloud.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GrammarGhostHunt,
});

type Token = { tamil: string; transliteration: string };
type Sentence = {
  subject: Token;
  object: Token;
  verb: Token;
  transliteration: string;
  english: string;
  tip: string;
};
type TeacherItem = { tamil: string; transliteration: string; english: string; tip: string };

const SENTENCES: Sentence[] = [
  {
    subject: { tamil: "நான்", transliteration: "nāṉ" },
    object: { tamil: "தண்ணீர்", transliteration: "taṇṇīr" },
    verb: { tamil: "குடிக்கிறேன்", transliteration: "kuṭikkiṟēṉ" },
    transliteration: "nāṉ taṇṇīr kuṭikkiṟēṉ",
    english: "I drink water.",
    tip: "Tamil sentences end with the verb.",
  },
  {
    subject: { tamil: "அவள்", transliteration: "avaḷ" },
    object: { tamil: "புத்தகம்", transliteration: "puttakam" },
    verb: { tamil: "படிக்கிறாள்", transliteration: "paṭikkiṟāḷ" },
    transliteration: "avaḷ puttakam paṭikkiṟāḷ",
    english: "She reads a book.",
    tip: "அவள் (avaḷ) means “she”.",
  },
  {
    subject: { tamil: "அவன்", transliteration: "avaṉ" },
    object: { tamil: "மாம்பழம்", transliteration: "māmpaḻam" },
    verb: { tamil: "சாப்பிடுகிறான்", transliteration: "sāppiṭukiṟāṉ" },
    transliteration: "avaṉ māmpaḻam sāppiṭukiṟāṉ",
    english: "He eats a mango.",
    tip: "அவன் (avaṉ) means “he”.",
  },
  {
    subject: { tamil: "நாங்கள்", transliteration: "nāṅkaḷ" },
    object: { tamil: "பாடல்", transliteration: "pāṭal" },
    verb: { tamil: "பாடுகிறோம்", transliteration: "pāṭukiṟōm" },
    transliteration: "nāṅkaḷ pāṭal pāṭukiṟōm",
    english: "We sing a song.",
    tip: "நாங்கள் (nāṅkaḷ) means “we”.",
  },
  {
    subject: { tamil: "அவர்கள்", transliteration: "avarkaḷ" },
    object: { tamil: "கால்பந்து", transliteration: "kālpantu" },
    verb: { tamil: "விளையாடுகிறார்கள்", transliteration: "viḷaiyāṭukiṟārkaḷ" },
    transliteration: "avarkaḷ kālpantu viḷaiyāṭukiṟārkaḷ",
    english: "They play football.",
    tip: "அவர்கள் (avarkaḷ) means “they”.",
  },
  {
    subject: { tamil: "மாணவி", transliteration: "māṇavi" },
    object: { tamil: "கடிதம்", transliteration: "katitam" },
    verb: { tamil: "எழுதுகிறாள்", transliteration: "eḻutukiṟāḷ" },
    transliteration: "māṇavi katitam eḻutukiṟāḷ",
    english: "The student writes a letter.",
    tip: "மாணவி (māṇavi) is a female student.",
  },
  {
    subject: { tamil: "அம்மா", transliteration: "ammā" },
    object: { tamil: "சமையல்", transliteration: "samaiyal" },
    verb: { tamil: "செய்கிறாள்", transliteration: "seykiṟāḷ" },
    transliteration: "ammā samaiyal seykiṟāḷ",
    english: "Mother cooks a meal.",
    tip: "அம்மா (ammā) means “mother”.",
  },
  {
    subject: { tamil: "குழந்தை", transliteration: "kuḻantai" },
    object: { tamil: "பால்", transliteration: "pāl" },
    verb: { tamil: "குடிக்கிறது", transliteration: "kuṭikkiṟatu" },
    transliteration: "kuḻantai pāl kuṭikkiṟatu",
    english: "The child drinks milk.",
    tip: "குழந்தை (kuḻantai) means “child”.",
  },
  {
    subject: { tamil: "மீனவர்", transliteration: "mīṉavar" },
    object: { tamil: "மீன்", transliteration: "mīṉ" },
    verb: { tamil: "பிடிக்கிறார்", transliteration: "piṭikkiṟār" },
    transliteration: "mīṉavar mīṉ piṭikkiṟār",
    english: "The fisherman catches fish.",
    tip: "மீன் (mīṉ) means “fish”.",
  },
  {
    subject: { tamil: "ஆசிரியர்", transliteration: "āciriyar" },
    object: { tamil: "பாடம்", transliteration: "pāṭam" },
    verb: { tamil: "சொல்லிக்கொடுக்கிறார்", transliteration: "sollikkoṭukkiṟār" },
    transliteration: "āciriyar pāṭam sollikkoṭukkiṟār",
    english: "The teacher teaches a lesson.",
    tip: "பாடம் (pāṭam) means “lesson”.",
  },
  {
    subject: { tamil: "அவன்", transliteration: "avaṉ" },
    object: { tamil: "சைக்கிள்", transliteration: "saikkiḷ" },
    verb: { tamil: "ஓட்டுகிறான்", transliteration: "ōṭṭukiṟāṉ" },
    transliteration: "avaṉ saikkiḷ ōṭṭukiṟāṉ",
    english: "He rides a bicycle.",
    tip: "சைக்கிள் (saikkiḷ) means “bicycle”.",
  },
  {
    subject: { tamil: "நான்", transliteration: "nāṉ" },
    object: { tamil: "தமிழ்", transliteration: "tamiḻ" },
    verb: { tamil: "கற்கிறேன்", transliteration: "kaṟkiṟēṉ" },
    transliteration: "nāṉ tamiḻ kaṟkiṟēṉ",
    english: "I learn Tamil.",
    tip: "தமிழ் (tamiḻ) — that's Tamil!",
  },
];

const LEVELS = [
  { name: "Level 1", label: "Gentle breeze", fallSeconds: 9, roundSeconds: 45 },
  { name: "Level 2", label: "Monsoon wind", fallSeconds: 7, roundSeconds: 38 },
  { name: "Level 3", label: "Storm chase", fallSeconds: 5.5, roundSeconds: 30 },
];
const SENTENCES_PER_LEVEL = 4;
const SLOT_ORDER = ["subject", "object", "verb"] as const;
type SlotKind = (typeof SLOT_ORDER)[number];
const SLOT_LABELS: Record<SlotKind, string> = {
  subject: "Subject",
  object: "Object",
  verb: "Verb",
};

type Spawn = { id: number; token: Token; left: number; delay: number; duration: number };
type Screen = "start" | "playing" | "over";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

function GrammarGhostHunt() {
  const [screen, setScreen] = useState<Screen>("start");
  const [deck, setDeck] = useState<Sentence[]>([]);
  const [round, setRound] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  const [levelFlash, setLevelFlash] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [teacher, setTeacher] = useState<{
    loading: boolean;
    items: TeacherItem[] | null;
    error: string | null;
  }>({ loading: false, items: null, error: null });

  const audioCache = useRef<Record<string, string>>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const idRef = useRef(0);
  const screenRef = useRef<Screen>("start");
  const nextId = () => ++idRef.current;

  useEffect(() => {
    screenRef.current = screen;
    if (screen === "over" && musicRef.current) musicRef.current.pause();
  }, [screen]);

  const level = LEVELS[Math.min(Math.floor(round / SENTENCES_PER_LEVEL), LEVELS.length - 1)]!;
  const sentence = deck[round];

  const playSound = useCallback(async (kind: AudioKind, text?: string) => {
    const key = kind + (text ?? "");
    try {
      if (!audioCache.current[key]) {
        const res = await getAudio({ data: text ? { kind, text } : { kind } });
        audioCache.current[key] = res.audio;
      }
      const audio = new Audio("data:audio/mpeg;base64," + audioCache.current[key]);
      await audio.play();
    } catch (e) {
      console.error("audio", e);
    }
  }, []);

  const startMusic = useCallback(async () => {
    try {
      if (!audioCache.current["music"]) {
        const res = await getAudio({ data: { kind: "music" } });
        audioCache.current["music"] = res.audio;
      }
      if (!musicRef.current) {
        musicRef.current = new Audio("data:audio/mpeg;base64," + audioCache.current["music"]);
        musicRef.current.loop = true;
        musicRef.current.volume = 0.3;
      }
      await musicRef.current.play();
    } catch (e) {
      console.error("music", e);
    }
  }, []);

  const respawn = useCallback((token: Token, fallSeconds: number) => {
    if (screenRef.current !== "playing") return;
    setSpawns((s) => [
      ...s,
      { id: nextId(), token, left: 4 + Math.random() * 64, delay: 0, duration: fallSeconds },
    ]);
  }, []);

  // Set up each round: fresh timer and a new set of falling tokens.
  useEffect(() => {
    if (screen !== "playing" || !sentence) return;
    setTimeLeft(level.roundSeconds);
    setSlotIndex(0);
    const correct: Token[] = [sentence.subject, sentence.object, sentence.verb];
    const distractors = shuffle(
      deck.filter((s) => s !== sentence).flatMap((s) => [s.subject, s.object, s.verb]),
    ).slice(0, 2);
    const tokens = shuffle([...correct, ...distractors]);
    setSpawns(
      tokens.map((token, i) => ({
        id: nextId(),
        token,
        left: 4 + Math.random() * 64,
        delay: i * 0.9,
        duration: level.fallSeconds,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, round, deck]);

  // Countdown timer.
  useEffect(() => {
    if (screen !== "playing" || slotIndex >= 3) return;
    const t = setInterval(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [screen, round, slotIndex]);

  const advanceRound = useCallback(() => {
    if (screenRef.current !== "playing") return;
    const next = round + 1;
    if (next >= deck.length) {
      setWon(true);
      setScreen("over");
      return;
    }
    if (next % SENTENCES_PER_LEVEL === 0) {
      const nextLevel = LEVELS[Math.floor(next / SENTENCES_PER_LEVEL)]!;
      setLevelFlash(`${nextLevel.name} — ${nextLevel.label}`);
      setTimeout(() => setLevelFlash(null), 1800);
    }
    setRound(next);
  }, [round, deck.length]);

  const loseLife = useCallback(
    (reason: string) => {
      playSound("wrong");
      setFeedback(reason);
      setSpawns([]);
      setLives((v) => {
        const n = v - 1;
        if (n <= 0) {
          setTimeout(() => {
            setWon(false);
            setScreen("over");
          }, 1200);
          return 0;
        }
        setTimeout(() => {
          setFeedback(null);
          advanceRound();
        }, 1200);
        return n;
      });
    },
    [playSound, advanceRound],
  );

  // Timer ran out.
  useEffect(() => {
    if (screen !== "playing" || timeLeft > 0 || slotIndex >= 3) return;
    loseLife("Time's up!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen]);

  const handleCatch = (spawn: Spawn) => {
    if (!sentence || slotIndex >= 3) return;
    const needed = SLOT_ORDER[slotIndex]!;
    const neededToken = sentence[needed];
    if (spawn.token.tamil === neededToken.tamil) {
      setSpawns((s) => s.filter((sp) => sp.id !== spawn.id));
      playSound("correct");
      const next = slotIndex + 1;
      setSlotIndex(next);
      if (next === 3) {
        const points = 100 + timeLeft * 2;
        setScore((v) => v + points);
        setFeedback(`+${points} — சரி!`);
        setSpawns([]);
        const full = `${sentence.subject.tamil} ${sentence.object.tamil} ${sentence.verb.tamil}`;
        playSound("levelup");
        playSound("speak", full);
        setTimeout(() => {
          setFeedback(null);
          advanceRound();
        }, 2800);
      }
    } else {
      // Practice-friendly: a wrong catch just buzzes and the word floats back.
      playSound("wrong");
      setSpawns((s) => s.filter((sp) => sp.id !== spawn.id));
      setTimeout(() => respawn(spawn.token, level.fallSeconds), 1200);
    }
  };

  const handleMiss = (spawn: Spawn) => {
    setSpawns((s) => s.filter((sp) => sp.id !== spawn.id));
    setTimeout(() => respawn(spawn.token, level.fallSeconds), 1000);
  };

  const startGame = () => {
    const newDeck = shuffle(SENTENCES).slice(0, LEVELS.length * SENTENCES_PER_LEVEL);
    setDeck(newDeck);
    setRound(0);
    setSlotIndex(0);
    setLives(3);
    setScore(0);
    setWon(false);
    setFeedback(null);
    setScreen("playing");
    startMusic();
    playSound("correct");
    playSound("levelup");
  };

  const askAiTeacher = async () => {
    setTeacher({ loading: true, items: null, error: null });
    try {
      const res = await askTeacher({
        data: {
          request:
            "Give 4 simple Tamil subject-object-verb sentences for a grammar student. For each give the tamil sentence, its transliteration, the english meaning, and a short grammar tip.",
        },
      });
      if ("error" in res && res.error) {
        setTeacher({
          loading: false,
          items: null,
          error: res.error === 429 ? "Slow down, try again in a moment" : "AI credits used up",
        });
      } else if ("result" in res && res.result) {
        setTeacher({ loading: false, items: res.result.items, error: null });
      }
    } catch {
      setTeacher({ loading: false, items: null, error: "The teacher is unavailable right now" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
        {screen === "start" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div>
              <p className="font-tamil text-3xl font-bold text-secondary">
                இலக்கணப் பேய் வேட்டை
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary">
                Grammar Ghost Hunt
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Catch the falling Tamil words in the right order — subject, object, verb — and
                hear each sentence spoken aloud.
              </p>
            </div>
            <button
              onClick={startGame}
              className="w-full max-w-xs rounded-2xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground shadow-lg transition-transform active:scale-95"
            >
              Start the hunt
            </button>
            <button
              onClick={askAiTeacher}
              disabled={teacher.loading}
              className="w-full max-w-xs rounded-2xl border-2 border-accent bg-card px-8 py-3 text-base font-semibold text-accent-foreground transition-transform active:scale-95 disabled:opacity-60"
            >
              {teacher.loading ? "The teacher is thinking…" : "Ask the AI teacher for practice"}
            </button>
            {teacher.error && <p className="text-sm text-destructive">{teacher.error}</p>}
            {teacher.items && (
              <div className="w-full space-y-3">
                {teacher.items.map((item, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 text-left">
                    <p className="font-tamil text-xl font-semibold text-secondary">{item.tamil}</p>
                    <p className="text-sm italic text-muted-foreground">{item.transliteration}</p>
                    <p className="mt-1 text-sm">{item.english}</p>
                    <p className="mt-1 text-xs text-primary">{item.tip}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Built for PARAI TamilHack · London · Lovable + ElevenLabs
            </p>
          </div>
        )}

        {screen === "playing" && sentence && (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-primary">Score {score}</span>
              <span className="text-secondary">
                {level.name} · {level.label}
              </span>
              <span className="text-accent" aria-label={`${lives} lives left`}>
                {"♥".repeat(lives)}
                {"♡".repeat(Math.max(0, 3 - lives))}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${(timeLeft / level.roundSeconds) * 100}%` }}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="text-base font-semibold">{sentence.english}</p>
              <p className="text-sm italic text-muted-foreground">{sentence.transliteration}</p>
              <p className="mt-1 text-xs text-primary">{sentence.tip}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SLOT_ORDER.map((slot, i) => {
                const filled = i < slotIndex;
                const isNext = i === slotIndex;
                return (
                  <div
                    key={slot}
                    className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 p-2 text-center ${
                      filled
                        ? "border-primary bg-card"
                        : isNext
                          ? "border-dashed border-secondary bg-card/60"
                          : "border-dashed border-border bg-card/30"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {SLOT_LABELS[slot]}
                    </span>
                    {filled && (
                      <>
                        <span className="font-tamil text-lg font-bold text-secondary">
                          {sentence[slot].tamil}
                        </span>
                        <span className="text-[10px] italic text-muted-foreground">
                          {sentence[slot].transliteration}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-card/40">
              {spawns.map((spawn) => (
                <button
                  key={spawn.id}
                  onClick={() => handleCatch(spawn)}
                  onAnimationEnd={() => handleMiss(spawn)}
                  className="falling-token flex w-28 flex-col items-center rounded-2xl border-2 border-primary/60 bg-card px-3 py-2 shadow-lg active:scale-95"
                  style={{
                    left: `${spawn.left}%`,
                    animationDuration: `${spawn.duration}s`,
                    animationDelay: `${spawn.delay}s`,
                  }}
                >
                  <span className="font-tamil text-xl font-bold text-secondary">
                    {spawn.token.tamil}
                  </span>
                  <span className="text-[10px] italic text-muted-foreground">
                    {spawn.token.transliteration}
                  </span>
                </button>
              ))}
              {feedback && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="feedback-pop rounded-2xl bg-primary px-6 py-3 text-2xl font-extrabold text-primary-foreground shadow-xl">
                    {feedback}
                  </p>
                </div>
              )}
              {levelFlash && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70">
                  <p className="feedback-pop text-3xl font-extrabold text-secondary">
                    {levelFlash}
                  </p>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Tap the next word you need — subject first, then object, then verb.
            </p>
          </div>
        )}

        {screen === "over" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div>
              <p className="font-tamil text-3xl font-bold text-secondary">
                {won ? "நல்ல வேலை!" : "மீண்டும் முயலுங்கள்!"}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold text-primary">
                {won ? "Great work!" : "Game over"}
              </h1>
              <p className="mt-3 text-lg">
                Final score: <span className="font-extrabold text-secondary">{score}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {won
                  ? "You built every sentence — the ghosts are grammar masters now."
                  : "Every try teaches your ear a little more Tamil."}
              </p>
            </div>
            <button
              onClick={startGame}
              className="w-full max-w-xs rounded-2xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground shadow-lg transition-transform active:scale-95"
            >
              Play again
            </button>
            <p className="text-xs text-muted-foreground">
              Built for PARAI TamilHack · London · Lovable + ElevenLabs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
