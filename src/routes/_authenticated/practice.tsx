import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Mic, Square, Send, Volume2, Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';
import { practiceOptions } from '@/lib/paalam.queries';
import { addTopic, practiceReply, practiceTranscribe, speakPractice, finishPractice, type PracticeReply } from '@/lib/practice.functions';

export const Route = createFileRoute('/_authenticated/practice')({
  head: () => meta('AI Practice Partner', 'Practise Tamil between calls with a friendly AI partner that speaks your words back to you.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(practiceOptions),
  component: Practice,
});

type Message =
  | { role: 'learner'; text: string }
  | { role: 'partner'; reply: PracticeReply };

const VOICES = [
  { key: 'sarah', label: 'Sarah' },
  { key: 'george', label: 'George' },
  { key: 'river', label: 'River' },
] as const;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read the recording'));
    reader.readAsDataURL(blob);
  });
}

function Practice() {
  const { data } = useSuspenseQuery(practiceOptions);
  const queryClient = useQueryClient();
  const { t } = usePaalam();

  const [topic, setTopic] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [share, setShare] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [voice, setVoice] = useState<'sarah' | 'george' | 'river' | 'twin'>('sarah');
  const [showHelper, setShowHelper] = useState(true);
  const [ended, setEnded] = useState<{ points: number } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const sharedTopics = data.topics.filter((tp) => tp.shared);

  async function play(text: string, v: typeof voice) {
    try {
      const { audio } = await speakPractice({ data: { text, voice: v } });
      await new Audio(`data:audio/mpeg;base64,${audio}`).play();
    } catch {
      // audio is a bonus
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError('');
    setInput('');
    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      text: m.role === 'learner' ? m.text : m.reply.tamil,
    }));
    setMessages((prev) => [...prev, { role: 'learner', text: message }]);
    try {
      const reply = await practiceReply({ data: { message, topic, history } });
      setMessages((prev) => [...prev, { role: 'partner', reply }]);
      void play(reply.tamil, voice);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setBusy(true);
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const audioBase64 = await blobToBase64(blob);
          const { text } = await practiceTranscribe({ data: { audioBase64, mime: blob.type } });
          if (text.trim()) await send(text);
          else setError(t('We could not hear that — try again.', 'கேட்கவில்லை — மீண்டும் முயற்சிக்கவும்.'));
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not transcribe that');
        } finally {
          setBusy(false);
        }
      };
      recorder.start();
      setRecording(true);
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 8000);
    } catch {
      setError(t('We need microphone access to hear you.', 'உங்களைக் கேட்க மைக்ரோஃபோன் அனுமதி தேவை.'));
    }
  }

  async function addNewTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim()) return;
    try {
      await addTopic({ data: { topic: newTopic.trim(), shared: share } });
      setNewTopic('');
      await queryClient.invalidateQueries({ queryKey: practiceOptions.queryKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add that topic');
    }
  }

  async function endSession() {
    const exchanges = messages.filter((m) => m.role === 'partner').length;
    if (exchanges === 0) {
      setEnded({ points: 0 });
      return;
    }
    try {
      const result = await finishPractice({ data: { exchanges } });
      setEnded(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the session');
    }
  }

  // ---- Topic picker ----
  if (!topic) {
    return (
      <main className="form-page">
        <p className="text-xs font-semibold uppercase text-primary">{t('AI PRACTICE PARTNER', 'AI பயிற்சி துணை')}</p>
        <h1>{t('Practise for your next call', 'உங்கள் அடுத்த அழைப்புக்கு பயிற்சி செய்யுங்கள்')}</h1>
        <p className="subtext">
          {t(
            'Pick a topic you and your partner both noted after your last call. Only topics you chose to share appear here — call recordings are never stored.',
            'கடந்த அழைப்பின் பின் நீங்களும் உங்கள் துணையும் குறித்த தலைப்பைத் தேர்ந்தெடுங்கள். பகிர்ந்த தலைப்புகள் மட்டுமே இங்கே — அழைப்பு பதிவுகள் ஒருபோதும் சேமிக்கப்படாது.',
          )}
        </p>
        <div className="topic-grid">
          {sharedTopics.map((tp) => (
            <button type="button" key={tp.id} className="topic-chip" onClick={() => setTopic(tp.topic)}>
              {tp.topic}
            </button>
          ))}
          {sharedTopics.length === 0 && <p className="subtext">{t('No shared topics yet — add one below.', 'பகிர்ந்த தலைப்புகள் இன்னும் இல்லை — கீழே ஒன்றைச் சேர்க்கவும்.')}</p>}
        </div>
        <form onSubmit={addNewTopic} className="quest-upload">
          <div className="field full">
            <label htmlFor="new-topic">{t('Add a topic from your last call', 'கடந்த அழைப்பிலிருந்து தலைப்பைச் சேர்க்கவும்')}</label>
            <input id="new-topic" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder={t('e.g. cricket, exams, food', 'எ.கா. கிரிக்கெட், தேர்வுகள், உணவு')} maxLength={60} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
            {t('Share this topic with my partner', 'இந்த தலைப்பை என் துணையுடன் பகிர்ந்துகொள்')}
          </label>
          <Button type="submit" variant="outline" className="w-full"><Plus />{t('Add topic', 'தலைப்பைச் சேர்')}</Button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </main>
    );
  }

  // ---- Session ended ----
  if (ended) {
    return (
      <main className="form-page text-center">
        <h1>{t('Nandra irundhadhu — well practised!', 'நன்றாக இருந்தது — நல்ல பயிற்சி!')}</h1>
        {ended.points > 0 && <p className="subtext mt-2">{t(`You earned ${ended.points} XP — more bricks on the bridge.`, `நீங்கள் ${ended.points} XP பெற்றீர்கள் — பாலத்தில் மேலும் செங்கற்கள்.`)}</p>}
        <div className="notice mt-6">
          <strong>{t('Ready to tell your partner about this on your next call?', 'அடுத்த அழைப்பில் இதை உங்கள் துணையிடம் சொல்ல தயாரா?')}</strong>
        </div>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <Button asChild><Link to="/calls"><Video />{t('Book the next call', 'அடுத்த அழைப்பை முன்பதிவு செய்')}</Link></Button>
          <Button variant="outline" onClick={() => { setEnded(null); setMessages([]); setTopic(''); }}>{t('Practise again', 'மீண்டும் பயிற்சி')}</Button>
        </div>
      </main>
    );
  }

  // ---- Chat ----
  return (
    <main className="form-page practice-page">
      {voice === 'twin' && (
        <div className="twin-banner" role="note">
          🤖 {t(`AI practice partner using ${data.displayName}'s voice twin – not the real ${data.displayName}`, `${data.displayName} அவர்களின் குரல் இரட்டையைப் பயன்படுத்தும் AI பயிற்சி துணை – உண்மையான ${data.displayName} அல்ல`)}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">{t('PRACTISING', 'பயிற்சி')} · {topic}</p>
          <h1 className="text-2xl">{t('Your practice partner', 'உங்கள் பயிற்சி துணை')}</h1>
        </div>
        <button type="button" className="subtext text-xs underline" onClick={() => setTopic('')}>{t('Change topic', 'தலைப்பை மாற்று')}</button>
      </div>

      <div className="practice-controls">
        <label className="field">
          {t('Voice', 'குரல்')}
          <select value={voice} onChange={(e) => setVoice(e.target.value as typeof voice)}>
            {VOICES.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
            {data.hasVoiceTwin && <option value="twin">{t('My Voice Twin', 'என் குரல் இரட்டை')}</option>}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm mt-5">
          <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} />
          {t('Show transliteration & English', 'ஒலிப்பெயர்ப்பு மற்றும் ஆங்கிலத்தைக் காட்டு')}
        </label>
      </div>

      <div className="chat-list">
        {messages.length === 0 && (
          <p className="subtext text-center py-8">{t('Say something to begin — type below or tap the mic and speak.', 'தொடங்க ஏதாவது சொல்லுங்கள் — கீழே தட்டச்சு செய்யுங்கள் அல்லது மைக்கை அழுத்திப் பேசுங்கள்.')}</p>
        )}
        {messages.map((m, i) =>
          m.role === 'learner' ? (
            <div className="chat-bubble learner" key={i}>{m.text}</div>
          ) : (
            <div className="chat-bubble partner" key={i}>
              <p className="font-tamil text-base font-medium">{m.reply.tamil}</p>
              {showHelper && (
                <>
                  <p className="chat-translit">{m.reply.transliteration}</p>
                  <p className="subtext text-xs">{m.reply.english}</p>
                </>
              )}
              {m.reply.correction && <p className="chat-correction">💡 {m.reply.correction}</p>}
              <button type="button" className="paati-hear mt-2" onClick={() => play(m.reply.tamil, voice)} aria-label={t('Hear this reply', 'இந்த பதிலைக் கேளுங்கள்')}>
                <Volume2 size={15} />
              </button>
            </div>
          ),
        )}
        {busy && <p className="subtext text-xs">{t('Your partner is thinking…', 'உங்கள் துணை யோசிக்கிறார்…')}</p>}
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void send(input); }}
          placeholder={t('Type in Tamil or English…', 'தமிழில் அல்லது ஆங்கிலத்தில் எழுதுங்கள்…')}
          maxLength={500}
          aria-label={t('Message to your practice partner', 'உங்கள் பயிற்சி துணைக்கான செய்தி')}
        />
        {recording ? (
          <Button size="icon" variant="outline" onClick={() => recorderRef.current?.state === 'recording' && recorderRef.current.stop()} aria-label={t('Stop recording', 'பதிவை நிறுத்து')}><Square /></Button>
        ) : (
          <Button size="icon" variant="outline" onClick={startRecording} disabled={busy} aria-label={t('Speak your answer', 'உங்கள் பதிலைப் பேசுங்கள்')}><Mic /></Button>
        )}
        <Button size="icon" onClick={() => send(input)} disabled={busy || !input.trim()} aria-label={t('Send', 'அனுப்பு')}><Send /></Button>
      </div>
      {error && <p className="error-message">{error}</p>}

      <Button variant="outline" className="w-full mt-4" onClick={endSession} disabled={messages.length === 0}>
        {t('End practice session', 'பயிற்சி அமர்வை முடி')}
      </Button>
    </main>
  );
}
