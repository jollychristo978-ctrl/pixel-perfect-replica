import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Mic, Square, Volume2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';
import { paatiCheck } from '@/lib/bridge.functions';
import { getAudio } from '@/lib/tamil.functions';

export const Route = createFileRoute('/_authenticated/paati')({
  head: () => meta('Paati Says', 'Quick-fire spoken Tamil challenges from Paati, your AI grandmother.'),
  component: PaatiSays,
});

const CHALLENGES = [
  { id: 'vanakkam', en: 'Greet Paati — say hello', tamil: 'வணக்கம்', translit: 'vanakkam', boss: false },
  { id: 'water', en: 'Say “water” in Tamil', tamil: 'தண்ணீர்', translit: 'thaṇṇīr', boss: false },
  { id: 'thanks', en: 'Say “thank you”', tamil: 'நன்றி', translit: 'nandri', boss: false },
  { id: 'kitchen', en: 'Boss: order from Paati’s kitchen — “I would like rice, please”', tamil: 'எனக்கு சோறு வேண்டும்', translit: 'enakku sōru vēṇḍum', boss: true },
  { id: 'market', en: 'Boss: haggle at the Jaffna market — “How much is this?”', tamil: 'இது எவ்வளவு?', translit: 'idu evvaḷavu?', boss: true },
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error('Could not read the recording'));
    reader.readAsDataURL(blob);
  });
}

type Outcome = { heard: string; correct: boolean };

function PaatiSays() {
  const { t } = usePaalam();
  const [recording, setRecording] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const recorderRef = useRef<MediaRecorder | null>(null);

  async function play(text: string) {
    try {
      const { audio } = await getAudio({ data: { kind: 'speak', text } });
      await new Audio(`data:audio/mpeg;base64,${audio}`).play();
    } catch {
      // audio is a bonus
    }
  }

  async function sfx(kind: 'correct' | 'wrong') {
    try {
      const { audio } = await getAudio({ data: { kind } });
      await new Audio(`data:audio/mpeg;base64,${audio}`).play();
    } catch {
      // ignore
    }
  }

  async function startRecording(id: string, expectedTamil: string) {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording('');
        setBusy(id);
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const audioBase64 = await blobToBase64(blob);
          const result = await paatiCheck({ data: { audioBase64, mime: blob.type, expectedTamil, challengeId: id } });
          setOutcomes((prev) => ({ ...prev, [id]: result }));
          void sfx(result.correct ? 'correct' : 'wrong');
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Could not check that answer');
        } finally {
          setBusy('');
        }
      };
      recorder.start();
      setRecording(id);
      // Auto-stop after 5 seconds so answers stay short.
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 5000);
    } catch {
      setError(t('We need microphone access for Paati Says.', 'பாட்டி சொன்னது விளையாட்டுக்கு மைக்ரோஃபோன் அனுமதி தேவை.'));
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  return (
    <main className="form-page">
      <p className="text-xs font-semibold uppercase text-primary">{t('PAATI SAYS', 'பாட்டி சொன்னது')}</p>
      <h1>{t('Quick-fire challenges from Paati', 'பாட்டியின் விரைவுச் சவால்கள்')}</h1>
      <p className="subtext">
        {t(
          'Paati speaks, you answer out loud in Tamil. She is kind about mistakes — mostly.',
          'பாட்டி பேசுவார், நீங்கள் தமிழில் சத்தமாக பதிலளியுங்கள். தவறுகளைப் பற்றி அவர் இதயமுள்ளவர் — பெரும்பாலும்.',
        )}
      </p>

      {error && <p className="error-message">{error}</p>}

      <div className="paati-list">
        {CHALLENGES.map((c) => {
          const outcome = outcomes[c.id];
          return (
            <div className={`paati-card${c.boss ? ' boss' : ''}`} key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {c.boss && <Crown size={15} className="text-primary" />}
                    {c.en}
                  </p>
                  <p className="subtext text-xs mt-1">
                    <span className="font-tamil">{c.tamil}</span> · {c.translit}
                  </p>
                </div>
                <button type="button" className="paati-hear" onClick={() => play(c.tamil)} aria-label={t('Hear Paati say it', 'பாட்டி சொல்வதைக் கேளுங்கள்')}>
                  <Volume2 size={17} />
                </button>
              </div>
              <div className="paati-actions">
                {recording === c.id ? (
                  <Button size="sm" variant="outline" onClick={stopRecording}>
                    <Square size={14} />
                    {t('Stop', 'நிறுத்து')}
                  </Button>
                ) : (
                  <Button size="sm" disabled={busy === c.id || recording !== ''} onClick={() => startRecording(c.id, c.tamil)}>
                    <Mic size={14} />
                    {busy === c.id ? t('Paati is listening…', 'பாட்டி கேட்கிறார்…') : t('Answer out loud', 'சத்தமாக பதில் சொல்லுங்கள்')}
                  </Button>
                )}
                {outcome && (
                  <span className={`badge${outcome.correct ? ' earned' : ''}`}>
                    {outcome.correct ? t('Paati approved! +15 XP', 'பாட்டி ஒப்புதல்! +15 XP') : t('Try again', 'மீண்டும் முயற்சிக்கவும்')}
                  </span>
                )}
              </div>
              {outcome && !outcome.correct && (
                <p className="subtext text-xs mt-2">{t('Paati heard:', 'பாட்டி கேட்டது:')} “{outcome.heard || '…'}”</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
