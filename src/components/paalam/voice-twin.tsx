import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaalam } from './context';
import { consentVoiceTwin, deleteVoiceTwin } from '@/lib/practice.functions';
import { accountOptions } from '@/lib/paalam.queries';

type Props = {
  ageGroup: string;
  voiceVerified: boolean;
  hasVoiceTwin: boolean;
};

export function VoiceTwinSection({ ageGroup, voiceVerified, hasVoiceTwin }: Props) {
  const { t } = usePaalam();
  const queryClient = useQueryClient();
  const [voiceId, setVoiceId] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Never offer Voice Twin to under-18s — hide it entirely.
  if (ageGroup !== '18+') return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await consentVoiceTwin({ data: { voiceId: voiceId.trim(), consent: true } });
      setVoiceId('');
      setConsent(false);
      await queryClient.invalidateQueries({ queryKey: accountOptions.queryKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your Voice Twin');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError('');
    try {
      await deleteVoiceTwin();
      await queryClient.invalidateQueries({ queryKey: accountOptions.queryKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete your Voice Twin');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="twin-section">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Mic2 size={18} />{t('Voice Twin', 'குரல் இரட்டை')}</h2>
      {hasVoiceTwin ? (
        <>
          <p className="subtext mb-3">
            {t(
              'Your Voice Twin is active. Learners always see a label that it is an AI voice, not the real you.',
              'உங்கள் குரல் இரட்டை செயலில் உள்ளது. அது AI குரல் என்று கற்பவர்களுக்கு எப்போதும் காட்டப்படும்.',
            )}
          </p>
          <Button variant="outline" onClick={remove} disabled={busy}>
            <Trash2 />
            {t('Delete my Voice Twin', 'என் குரல் இரட்டையை நீக்கு')}
          </Button>
        </>
      ) : voiceVerified ? (
        <form onSubmit={submit}>
          <div className="notice text-left">
            <strong>{t('What is a Voice Twin?', 'குரல் இரட்டை என்றால் என்ன?')}</strong>
            <p>
              {t(
                'Learners can practise with an AI version of your voice between calls. It is always labelled as AI, never shown as the real you, and you can delete it at any time — deletion stops it being used immediately.',
                'அழைப்புகளுக்கு இடையில் கற்பவர்கள் உங்கள் குரலின் AI பதிப்புடன் பயிற்சி செய்யலாம். அது எப்போதும் AI என குறிக்கப்படும், நிஜமான நீங்கள் அல்ல என தெரியும், எப்போது வேண்டுமானாலும் நீக்கலாம் — நீக்கிய உடனே அது நிறுத்தப்படும்.',
              )}
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm my-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            {t('I consent to my voice being used for an AI practice partner', 'AI பயிற்சி துணைக்கு என் குரல் பயன்படுத்தப்படுவதற்கு ஒப்புக்கொள்கிறேன்')}
          </label>
          <div className="field full">
            <label htmlFor="voice-id">{t('Your ElevenLabs Voice ID', 'உங்கள் ElevenLabs குரல் அடையாளம்')}</label>
            <input id="voice-id" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="e.g. EXAVITQu4vr4xnSDxMaL" maxLength={80} />
            <p className="subtext text-xs">{t('Stored privately — never shown publicly.', 'தனிப்பட்டதாக சேமிக்கப்படும் — வெளியில் காட்டப்படாது.')}</p>
          </div>
          <Button type="submit" className="mt-3" disabled={busy || !consent || voiceId.trim().length < 5}>
            {t('Create my Voice Twin', 'என் குரல் இரட்டையை உருவாக்கு')}
          </Button>
        </form>
      ) : (
        <p className="subtext">
          {t(
            'Voice Twin lets adult volunteers lend their voice to the AI practice partner. Ask your coordinator to verify you to unlock it.',
            'குரல் இரட்டை வயது வந்தோர் தங்கள் குரலை AI பயிற்சி துணைக்கு வழங்க அனுமதிக்கிறது. திறக்க உங்கள் ஒருங்கிணைப்பாளரிடம் சரிபார்ப்பு கேளுங்கள்.',
          )}
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}
