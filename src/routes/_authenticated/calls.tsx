import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Video, ShieldCheck, Lock } from 'lucide-react';
import { myCallsOptions } from '@/lib/paalam.queries';
import { bookCall } from '@/lib/bridge.functions';
import { meta } from '@/lib/paalam';
import { usePaalam } from '@/components/paalam/context';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/calls')({
  head: () => meta('Sri Lanka calls', 'Organisation-led language exchange with Tea Leaf Trust and virtual mentorship with Aram, with London and Sri Lanka times.'),
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

function Calls(){
 const {t}=usePaalam();const {data:bookings}=useSuspenseQuery(myCallsOptions);const [organisation,setOrganisation]=useState('Tea Leaf Trust');
 return <main className="form-page"><p className="text-sm text-primary">{t('Connect','இணை')}</p><h1>{t('Sri Lanka calls','இலங்கை அழைப்புகள்')}</h1><p className="subtext">{t('Organisation-led language exchange with Tea Leaf Trust and virtual mentorship with Aram.','Tea Leaf Trust உடன் நிறுவன வழி மொழிப் பரிமாற்றம் மற்றும் Aram உடன் இணைய வழிகாட்டுதல்.')}</p>
 <section className="call-unlock"><h2>{t('Planned call safeguards','திட்டமிடப்பட்ட அழைப்பு பாதுகாப்புகள்')}</h2><div className="safety-chips">{[['18+ only','18+ மட்டும்'],['ID verified','அடையாளம் சரிபார்க்கப்பட்டது'],['Calls reviewed','அழைப்புகள் மதிப்பாய்வு செய்யப்படும்']].map(([en,ta])=><span className="badge" key={en}><ShieldCheck size={14} className="inline mr-1"/>{t(en??'',ta??'')}</span>)}</div><p className="subtext text-xs">{t('Bookings are not open. These requirements will apply before live calls begin.','முன்பதிவுகள் இன்னும் தொடங்கவில்லை. நிஜ அழைப்புகள் தொடங்கும் முன் இந்த நிபந்தனைகள் அமலாகும்.')}</p></section>
 <div className="field mt-6"><label htmlFor="organisation">{t('Partner organisation','கூட்டாளர் நிறுவனம்')}</label><select id="organisation" value={organisation} onChange={e=>setOrganisation(e.target.value)}><option>Tea Leaf Trust</option><option>Aram</option></select></div><p className="subtext mt-3">{organisation==='Aram'?t('Virtual mentorship','இணைய வழிகாட்டுதல்'):t('School-led language exchange · 18+ learners','பள்ளி வழி மொழிப் பரிமாற்றம் · 18+ மாணவர்கள்')}</p>
 <h2 className="text-lg font-semibold mt-6 mb-3">{t('London and Sri Lanka time','லண்டன் மற்றும் இலங்கை நேரம்')}</h2><div className="slot-list">{nextSlots().slice(0,3).map(slot=><div className="slot-row" key={slot.toISOString()}><div><p>{fmt(slot,'Europe/London')} · {t('London','லண்டன்')}</p><p className="subtext text-xs">{fmt(slot,'Asia/Colombo')} · {t('Sri Lanka','இலங்கை')}</p></div><Lock size={16} className="text-muted-foreground"/></div>)}</div><p className="subtext text-xs mt-2">{t('Time examples only — not confirmed availability.','நேர உதாரணங்கள் மட்டுமே — உறுதிப்படுத்தப்பட்ட நேரங்கள் அல்ல.')}</p><Button disabled className="w-full mt-4"><Lock/>{t('Booking not open yet','முன்பதிவு இன்னும் தொடங்கவில்லை')}</Button>
 {bookings.length>0&&<section className="mt-8"><h2 className="text-lg font-semibold mb-3">{t('Previous demo bookings','முந்தைய டெமோ முன்பதிவுகள்')}</h2><div className="slot-list">{bookings.map(b=><div className="slot-row" key={b.id}><div><p>{b.partner_name}</p><p className="subtext text-xs">{fmt(new Date(b.slot_start),'Europe/London')} London · {fmt(new Date(b.slot_start),'Asia/Colombo')} Colombo</p></div><span className="badge">{t('Demo','டெமோ')}</span></div>)}</div></section>}</main>;
}
