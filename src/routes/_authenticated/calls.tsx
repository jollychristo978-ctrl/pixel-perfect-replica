import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Video, ShieldCheck } from 'lucide-react';
import { myCallsOptions } from '@/lib/paalam.queries';
import { bookCall } from '@/lib/bridge.functions';
import { meta } from '@/lib/paalam';
import { usePaalam } from '@/components/paalam/context';
import { Button } from '@/components/ui/button';
import { OrganisationSearch } from '@/components/paalam/organisation-search';

export const Route = createFileRoute('/_authenticated/calls')({
  head: () => meta('Find a practice group', 'Find organisation-run Tamil and English practice opportunities with Tea Leaf Trust and Aram. Explore groups and contact partner coordinators.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(myCallsOptions),
  component: Calls,
});

const PARTNERS = ['Kavya (Jaffna)', 'Tharindu (Colombo)', 'Meera (Batticaloa)', 'Ashan (Kandy)'];
const LONDON_HOURS = [9, 10, 11, 12, 13];

function nextSlots(): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  for (let d = 0; d < 7 && slots.length < 15; d++) {
    for (const hour of LONDON_HOURS) {
      const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + d, hour, 0));
      if (dt > now) slots.push(dt);
    }
  }
  return slots;
}

function fmt(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz }).format(d);
}

export function LegacyCalls() {
  const { data: bookings } = useSuspenseQuery(myCallsOptions);
  const queryClient = useQueryClient();
  const { t } = usePaalam();
  const [partner, setPartner] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const slots = nextSlots();

  async function book(slot: Date) {
    const key = slot.toISOString();
    setBusy(key);
    setError('');
    try {
      await bookCall({ data: { slotStart: key, partnerIndex: partner } });
      await queryClient.invalidateQueries({ queryKey: myCallsOptions.queryKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not book that slot');
    } finally {
      setBusy('');
    }
  }

  return (
    <main className="form-page">
      <p className="text-xs font-semibold uppercase text-primary">{t('REAL CALLS', 'நிஜ அழைப்புகள்')}</p>
      <h1>{t('Book a bridge call', 'பால அழைப்பை முன்பதிவு செய்யுங்கள்')}</h1>
      <p className="subtext">
        {t(
          'Completing a bridge unlocks a video call with a student or mentor from our partner charity. Times are shown in both London and Colombo.',
          'பாலத்தை நிறைவு செய்தால் எங்கள் கூட்டாளி தொண்டு நிறுவனத்தின் மாணவர் அல்லது வழிகாட்டியுடன் காணொளி அழைப்பு திறக்கப்படும். நேரங்கள் லண்டன் மற்றும் கொழும்பு இரண்டிலும் காட்டப்படுகின்றன.',
        )}
      </p>

      <div className="notice flex gap-3">
        <ShieldCheck className="shrink-0" />
        <p>{t('A charity coordinator is present on every call with an under-18 student.', '18 வயதிற்குக் குறைந்த மாணவரின் ஒவ்வொரு அழைப்பிலும் தொண்டு நிறுவன ஒருங்கிணைப்பாளர் இருப்பார்.')}</p>
      </div>

      <div className="field full mt-4">
        <label htmlFor="partner">{t('Call partner (demo)', 'அழைப்புத் துணை (டெமோ)')}</label>
        <select id="partner" value={partner} onChange={(e) => setPartner(Number(e.target.value))}>
          {PARTNERS.map((p, i) => (
            <option key={p} value={i}>{p}</option>
          ))}
        </select>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-3">{t('Pick a time', 'நேரத்தைத் தேர்ந்தெடுங்கள்')}</h2>
      <div className="slot-list">
        {slots.map((slot) => {
          const key = slot.toISOString();
          return (
            <div className="slot-row" key={key}>
              <div>
                <p className="font-medium">{fmt(slot, 'Europe/London')} · London</p>
                <p className="subtext text-xs">{fmt(slot, 'Asia/Colombo')} · Colombo</p>
              </div>
              <Button size="sm" variant="outline" disabled={busy === key} onClick={() => book(slot)}>
                <Video size={14} />
                {busy === key ? t('Booking…', 'முன்பதிவு…') : t('Book', 'முன்பதிவு')}
              </Button>
            </div>
          );
        })}
      </div>
      {error && <p className="error-message">{error}</p>}

      <h2 className="text-lg font-semibold mt-8 mb-3">{t('Your upcoming calls', 'உங்கள் வரவிருக்கும் அழைப்புகள்')}</h2>
      {bookings.length === 0 ? (
        <p className="subtext">{t('No calls booked yet — pick a time above.', 'இன்னும் அழைப்புகள் முன்பதிவு செய்யப்படவில்லை — மேலே ஒரு நேரத்தைத் தேர்ந்தெடுங்கள்.')}</p>
      ) : (
        <div className="slot-list">
          {bookings.map((b) => {
            const d = new Date(b.slot_start);
            return (
              <div className="slot-row" key={b.id}>
                <div>
                  <p className="font-medium">{b.partner_name}</p>
                  <p className="subtext text-xs">{fmt(d, 'Europe/London')} London · {fmt(d, 'Asia/Colombo')} Colombo</p>
                </div>
                <span className="badge earned">{t('Booked', 'முன்பதிவு செய்யப்பட்டது')}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Calls() {
  return <OrganisationSearch />;
}
