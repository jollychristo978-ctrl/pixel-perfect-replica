import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';

export const Route = createFileRoute('/forgot-password')({ head: () => meta('Reset your password', 'Request a secure email link to reset your Paalam password.'), component: ForgotPassword });
function ForgotPassword() {
  const { t } = usePaalam();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setSent(true);
    } catch (error) { setError(error instanceof Error ? error.message : t('Please try again.', 'மீண்டும் முயலுங்கள்.')); }
    finally { setBusy(false); }
  }
  return <main className="form-page"><div className="auth-panel"><h1>{t('Reset your password', 'கடவுச்சொல்லை மீட்டமைக்கவும்')}</h1>{sent ? <p role="status" className="notice">{t('If this account exists, a reset link has been sent. Check your inbox and spam folder.', 'இந்தக் கணக்கு இருந்தால், மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது. உங்கள் மின்னஞ்சலைப் பார்க்கவும்.')}</p> : <form onSubmit={submit} className="flex flex-col gap-5 mt-7"><label className="field">{t('Email address', 'மின்னஞ்சல் முகவரி')}<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>{error && <p role="alert" className="error-message">{error}</p>}<Button type="submit" disabled={busy}>{busy ? t('Sending…', 'அனுப்புகிறது…') : t('Send reset link', 'மீட்டமைப்பு இணைப்பை அனுப்பு')}</Button></form>}<Button asChild variant="link" className="mt-5"><Link to="/auth">{t('Back to sign in', 'உள்நுழையத் திரும்பவும்')}</Link></Button></div></main>;
}