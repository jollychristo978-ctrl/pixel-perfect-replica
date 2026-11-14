import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Clapperboard, Upload, Volume2, BookmarkPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';
import { processClip, saveWord, awardXp, type ClipWord, type ClipQuiz } from '@/lib/bridge.functions';
import { getAudio } from '@/lib/tamil.functions';

export const Route = createFileRoute('/_authenticated/quest')({
  head: () => meta('Clip Quest', 'Turn a short clip into a Tamil lesson: transcript, vocabulary and a quick quiz.'),
  component: ClipQuest,
});

type Result = { transcript: string; translation: string; words: ClipWord[]; quiz: ClipQuiz[] };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });
}

function ClipQuest() {
  const { t } = usePaalam();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState(0);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const audioBase64 = await fileToBase64(file);
      const res = await processClip({ data: { title: title || file.name, audioBase64, mime: file.type || 'audio/webm' } });
      setResult(res);
      setAnswers({});
      setQuizDone(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function play(text: string) {
    try {
      const { audio } = await getAudio({ data: { kind: 'speak', text } });
      await new Audio(`data:audio/mpeg;base64,${audio}`).play();
    } catch {
      // audio is a bonus; ignore failures silently
    }
  }

  async function save(w: ClipWord) {
    try {
      await saveWord({ data: w });
      setSaved((prev) => new Set(prev).add(w.tamil));
    } catch {
      // already saved or offline; ignore
    }
  }

  async function submitQuiz() {
    if (!result) return;
    const correct = result.quiz.filter((q, i) => answers[i] === q.answer_index).length;
    setScore(correct);
    setQuizDone(true);
    if (correct > 0) {
      try {
        await awardXp({ data: { points: correct * 15, reason: 'clip_quiz' } });
      } catch {
        // XP is best-effort
      }
    }
  }

  return (
    <main className="form-page quest-page">
      <p className="text-xs font-semibold uppercase text-primary">{t('CLIP QUEST', 'கிளிப் தேடல்')}</p>
      <h1>{t('Turn a clip into a lesson', 'ஒரு காணொளியை பாடமாக மாற்றுங்கள்')}</h1>
      <p className="subtext">
        {t(
          'Upload a short clip you filmed. We transcribe it, translate it into Tamil, pick out useful words and quiz you on what happened.',
          'நீங்கள் படம்பிடித்த குறுகிய காணொளியை பதிவேற்றுங்கள். நாங்கள் அதை எழுத்தில் மாற்றி, தமிழில் மொழிபெயர்த்து, பயனுள்ள சொற்களைத் தேர்ந்தெடுத்து வினாடி வினா விடுக்கிறோம்.',
        )}
      </p>

      <div className="quest-upload">
        <div className="field full">
          <label htmlFor="clip-title">{t('Clip title', 'காணொளிப் பெயர்')}</label>
          <input id="clip-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('e.g. Ordering tea at the market', 'எ.கா. சந்தையில் தேநீர் வாங்குதல்')} maxLength={80} />
        </div>
        <label className="quest-drop" htmlFor="clip-file">
          {file ? <CheckCircle2 size={22} /> : <Clapperboard size={22} />}
          <span>{file ? file.name : t('Choose a video or audio clip (under 10 MB)', 'காணொளி அல்லது ஒலிக் கோப்பைத் தேர்ந்தெடுங்கள் (10 MBக்குள்)')}</span>
          <input
            id="clip-file"
            type="file"
            accept="video/*,audio/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 10 * 1024 * 1024) {
                setError(t('That file is over 10 MB — trim it or compress it first.', 'அந்தக் கோப்பு 10 MBஐ விட பெரியது — சிறிதாக்கி மீண்டும் முயற்சிக்கவும்.'));
                return;
              }
              setError('');
              setFile(f);
            }}
          />
        </label>
        <Button onClick={run} disabled={!file || busy} className="w-full">
          <Upload />
          {busy ? t('Building your lesson…', 'உங்கள் பாடம் தயாராகிறது…') : t('Build my lesson', 'என் பாடத்தை உருவாக்கு')}
        </Button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {result && (
        <section className="quest-result">
          <h2>{t('What was said', 'என்ன சொல்லப்பட்டது')}</h2>
          <p className="quest-transcript">{result.transcript}</p>
          <h2>{t('In Tamil', 'தமிழில்')}</h2>
          <p className="quest-transcript font-tamil">{result.translation}</p>

          <h2>{t('Words to keep', 'கற்க வேண்டிய சொற்கள்')}</h2>
          <p className="subtext">{t('Tap the speaker to hear a word, tap save to keep it and earn 10 XP.', 'சொல்லைக் கேட்க ஸ்பீக்கரையும், சேமித்து 10 XP பெற சேமி என்பதையும் அழுத்துங்கள்.')}</p>
          <div className="word-grid">
            {result.words.map((w) => (
              <div className={`word-chip${saved.has(w.tamil) ? ' saved' : ''}`} key={w.tamil}>
                <p className="font-tamil word-tamil">{w.tamil}</p>
                <p className="word-translit">{w.transliteration}</p>
                <p className="subtext text-xs">{w.english}</p>
                <div className="word-actions">
                  <button type="button" onClick={() => play(w.tamil)} aria-label={t('Hear this word', 'இந்த சொல்லைக் கேளுங்கள்')}><Volume2 size={16} /></button>
                  <button type="button" onClick={() => save(w)} disabled={saved.has(w.tamil)} aria-label={t('Save this word', 'இந்த சொல்லைச் சேமியுங்கள்')}>
                    <BookmarkPlus size={16} />
                    {saved.has(w.tamil) ? t('Saved', 'சேமிக்கப்பட்டது') : t('Save', 'சேமி')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2>{t('Quick quiz', 'விரைவு வினாடி வினா')}</h2>
          {result.quiz.map((q, qi) => (
            <div className="quiz-block" key={qi}>
              <p className="font-medium">{q.question}</p>
              <div className="quiz-options">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const isRight = quizDone && oi === q.answer_index;
                  const isWrong = quizDone && chosen && oi !== q.answer_index;
                  return (
                    <button
                      type="button"
                      key={oi}
                      className={`quiz-opt${chosen ? ' chosen' : ''}${isRight ? ' right' : ''}${isWrong ? ' wrong' : ''}`}
                      disabled={quizDone}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!quizDone ? (
            <Button onClick={submitQuiz} disabled={Object.keys(answers).length < result.quiz.length} className="w-full">
              {t('Check my answers', 'என் பதில்களைச் சரிபார்')}
            </Button>
          ) : (
            <div className="notice">
              <strong>
                {score}/{result.quiz.length} {t('correct', 'சரி')}
              </strong>
              <p>{score > 0 ? t(`You earned ${score * 15} XP — another brick on the bridge!`, `நீங்கள் ${score * 15} XP பெற்றீர்கள் — பாலத்தில் இன்னொரு செங்கல்!`) : t('No worries — watch once more and try again.', 'பரவாயில்லை — மீண்டும் பார்த்து முயற்சிக்கவும்.')}</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
