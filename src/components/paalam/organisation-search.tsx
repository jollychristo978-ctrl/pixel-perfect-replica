import { useEffect, useRef, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, ChevronRight, Clock3, Globe2, MapPin, Mic, MicOff, PhoneOff, Search, Shield, Users, Video, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePaalam } from '@/components/paalam/context';
import { myCallsOptions } from '@/lib/paalam.queries';
import { findOrganisationGroups, organisationEnquiry, type GroupKind, type OrganisationGroup } from '@/lib/organisation-groups';
import aramLogo from '@/assets/aram-logo.png.asset.json';

const FILTERS: { id: GroupKind; label: readonly [string, string] }[] = [
  { id: 'all', label: ['All groups', 'அனைத்துக் குழுக்கள்'] },
  { id: 'exchange', label: ['Language exchange', 'மொழிப் பரிமாற்றம்'] },
  { id: 'mentorship', label: ['Mentorship', 'வழிகாட்டுதல்'] },
];

function PartnerMark({ group }: { group: OrganisationGroup }) {
  return <span className="org-mark">{group.id === 'aram'
    ? <img src={aramLogo.url} alt="Aram" width={56} height={56} />
    : <span aria-label="Tea Leaf Trust">TLT</span>}</span>;
}

function localTime(date: Date, timezone: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(date);
}

function formatCallTime(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function OrganisationSearch() {
  const { t } = usePaalam();
  const { data: bookings } = useSuspenseQuery(myCallsOptions);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<GroupKind>('all');
  const [selected, setSelected] = useState<OrganisationGroup | null>(null);
  const [callStage, setCallStage] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const results = findOrganisationGroups(query, kind);

  useEffect(() => {
    if (callStage !== 'live') return;
    const interval = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callStage]);

  useEffect(() => () => { if (connectTimer.current) clearTimeout(connectTimer.current); }, []);

  function startCall() {
    setCallStage('connecting');
    setCallSeconds(0);
    setMuted(false);
    setCameraOff(false);
    connectTimer.current = setTimeout(() => setCallStage('live'), 2200);
  }

  function endCall() {
    if (connectTimer.current) clearTimeout(connectTimer.current);
    setCallStage('idle');
  }

  return <main className="org-connect">
    <section className="org-map" aria-label={t('UK and Sri Lanka connection', 'பிரிட்டன் மற்றும் இலங்கை இணைப்பு')}>
      <div className="org-map-grid" aria-hidden="true" />
      <div className="org-map-stop org-map-start"><MapPin size={20} /><span>{t('London', 'லண்டன்')}<small>{t('United Kingdom', 'பிரிட்டன்')}</small></span></div>
      <div className="org-map-line" aria-hidden="true"><span /><span /><span /><i className="org-map-car" /></div>
      <div className="org-map-stop org-map-end"><MapPin size={20} /><span>{t('Sri Lanka', 'இலங்கை')}<small>{t('Organisation-run practice', 'அமைப்பு நடத்தும் பயிற்சி')}</small></span></div>
      <span className="org-map-caption"><Globe2 size={14} />{t('Across borders. Together.', 'எல்லைகளைத் தாண்டி. ஒன்றாக.')}</span>
    </section>

    <section className="org-search-panel">
      <div className="org-panel-handle" aria-hidden="true" />
      {selected ? <div className="org-detail">
        <Button variant="ghost" className="org-back" onClick={() => setSelected(null)}><ArrowLeft />{t('All groups', 'அனைத்துக் குழுக்கள்')}</Button>
        <div className="org-detail-heading"><PartnerMark group={selected} /><div><p className="org-eyebrow">{selected.name}</p><h1>{t(...selected.title)}</h1></div></div>
        <p className="subtext">{t(...selected.description)}</p>
        <div className="org-facts">
          <span><MapPin />{t(...selected.location)}</span>
          <span><Users />{t('Organisation-run · adults 18+', 'அமைப்பு நடத்தும் · 18+ வயதினர்')}</span>
          <span><Globe2 />{t('Tamil & English', 'தமிழ் மற்றும் ஆங்கிலம்')}</span>
        </div>
        <div className="org-schedule">
          <Clock3 className="text-coral" /><div><h2>{t('Session times pending', 'அமர்வு நேரங்கள் இன்னும் உறுதியாகவில்லை')}</h2><p className="subtext">{t('No confirmed Paalam sessions are listed yet. Ask the organisation about real groups, dates and eligibility.', 'உறுதிப்படுத்தப்பட்ட பாலம் அமர்வுகள் இன்னும் இல்லை. உண்மையான குழுக்கள், தேதிகள் மற்றும் தகுதி பற்றி அமைப்பிடம் கேளுங்கள்.')}</p></div>
        </div>
        <div className="org-timezones"><span>{t('London time', 'லண்டன் நேரம்')}<strong>Europe/London</strong></span><ArrowDown size={16} /><span>{t('Sri Lanka time', 'இலங்கை நேரம்')}<strong>Asia/Colombo · UTC+5:30</strong></span></div>
        <p className="org-coordinator-note"><Shield size={17} />{t('The organisation confirms the group, joining details and safeguarding arrangements. No individual learner contacts are shared here.', 'குழு, சேரும் விவரங்கள் மற்றும் பாதுகாப்பு ஏற்பாடுகளை அமைப்பு உறுதிப்படுத்தும். தனிப்பட்ட மாணவர் தொடர்பு விவரங்கள் இங்கு பகிரப்படுவதில்லை.')}</p>
        <Button size="lg" className="org-call-start" onClick={startCall}><Video />{t('Try a demo call', 'டெமோ அழைப்பை முயற்சிக்கவும்')}</Button>
        <p className="org-email-note">{t('A preview of how a Paalam call will feel — no real session is booked.', 'பாலம் அழைப்பு எப்படி இருக்கும் என்பதன் முன்னோட்டம் — உண்மையான அமர்வு முன்பதிவு செய்யப்படவில்லை.')}</p>
        <Button asChild size="lg" variant="outline" className="org-enquire"><a href={organisationEnquiry(selected)}>{t('Ask about a group', 'குழு பற்றி விசாரியுங்கள்')}<ArrowUpRight /></a></Button>
        <p className="org-email-note">{t('Opens your email app — this is an enquiry, not a booking.', 'உங்கள் மின்னஞ்சல் செயலி திறக்கும் — இது விசாரணை, முன்பதிவு அல்ல.')}</p>
        <Button asChild variant="outline" className="org-website"><a href={selected.website} target="_blank" rel="noopener noreferrer">{t('Visit organisation website', 'அமைப்பின் இணையதளம்')}<ArrowUpRight /></a></Button>
      </div> : <>
        <p className="org-eyebrow">{t('Connect · Sri Lanka', 'இணை · இலங்கை')}</p>
        <h1>{t('Find your practice group', 'உங்கள் பயிற்சிக் குழுவைக் கண்டறியுங்கள்')}</h1>
        <div className="org-search-input"><Search size={20} aria-hidden="true" /><Input aria-label={t('Search organisations or groups', 'அமைப்புகள் அல்லது குழுக்களைத் தேடுங்கள்')} placeholder={t('Search a partner or practice type', 'கூட்டாளர் அல்லது பயிற்சியைத் தேடுங்கள்')} value={query} onChange={event => setQuery(event.target.value)} />{query && <Button variant="ghost" size="icon" aria-label={t('Clear search', 'தேடலை அழிக்கவும்')} onClick={() => setQuery('')}><X /></Button>}</div>
        <div className="org-filters" aria-label={t('Practice type', 'பயிற்சி வகை')}>{FILTERS.map(filter => <Button key={filter.id} variant={kind === filter.id ? 'default' : 'outline'} aria-pressed={kind === filter.id} onClick={() => setKind(filter.id)}>{t(...filter.label)}</Button>)}</div>
        <div className="org-results-heading"><h2>{t('Partner opportunities', 'கூட்டாளர் வாய்ப்புகள்')}</h2><span role="status">{results.length} {t('found', 'கண்டறியப்பட்டன')}</span></div>
        <p className="org-pick-hint"><ChevronRight size={14} />{t('Pick a group to see how to join', 'சேர்வது எப்படி என்று பார்க்க ஒரு குழுவைத் தேர்ந்தெடுங்கள்')}</p>
        <div className="org-results">{results.map((group, index) => <Button key={group.id} variant="ghost" className={`org-result${index === 0 ? ' org-result--nudge' : ''}`} style={{ animationDelay: `${index * 80}ms` }} onClick={() => setSelected(group)}>
          <PartnerMark group={group} /><span className="org-result-copy"><strong>{group.name}</strong><span>{t(...group.title)}</span><small><MapPin size={12} />{t(...group.location)}</small><span className="org-status"><Clock3 size={12} />{t('Ask about upcoming groups', 'வரவிருக்கும் குழுக்களை விசாரிக்கவும்')}</span></span><ChevronRight className="org-result-arrow" />
        </Button>)}</div>
        {results.length === 0 && <div className="org-empty"><Search size={28} /><h2>{t('No groups found', 'குழுக்கள் கிடைக்கவில்லை')}</h2><p className="subtext">{t('Try Tea Leaf Trust, Aram or a different practice type.', 'Tea Leaf Trust, Aram அல்லது வேறு பயிற்சி வகையை முயற்சிக்கவும்.')}</p><Button variant="outline" onClick={() => { setQuery(''); setKind('all'); }}>{t('Reset search', 'தேடலை மீட்டமைக்கவும்')}</Button></div>}
        <div className="org-safety"><span><Users size={14} />{t('Organisation-run', 'அமைப்பு நடத்தும்')}</span><span><Check size={14} />{t('Adults 18+', '18+ வயதினர்')}</span><span><Shield size={14} />{t('No personal profiles', 'தனிப்பட்ட சுயவிவரங்கள் இல்லை')}</span></div>
        <p className="org-availability-note">{t('Partners confirm availability. No live sessions or instant bookings are available in Paalam yet.', 'கூட்டாளர்கள் அமர்வு கிடைப்பதை உறுதிப்படுத்துவார்கள். பாலத்தில் நேரடி அமர்வுகளோ உடனடி முன்பதிவுகளோ இன்னும் இல்லை.')}</p>
      </>}
      {bookings.length > 0 && <section className="org-bookings"><h2>{t('Previous demo bookings', 'முந்தைய டெமோ முன்பதிவுகள்')}</h2>{bookings.map(booking => <div className="slot-row" key={booking.id}><div><p>{booking.partner_name}</p><p className="subtext text-xs">{localTime(new Date(booking.slot_start), 'Europe/London')} · {t('London', 'லண்டன்')}<br />{localTime(new Date(booking.slot_start), 'Asia/Colombo')} · {t('Sri Lanka', 'இலங்கை')}</p></div><Video size={16} /></div>)}</section>}
    </section>

    {callStage !== 'idle' && selected && <div className="org-call" role="dialog" aria-modal="true" aria-label={t('Demo call', 'டெமோ அழைப்பு')}>
      {callStage === 'connecting' ? <div className="org-call-connecting">
        <div className="org-call-pulse"><PartnerMark group={selected} /><div className="org-call-rings" aria-hidden="true"><span /><span /><span /></div></div>
        <h2>{t('Connecting…', 'இணைக்கிறது…')}</h2>
        <p className="subtext">{selected.name}</p>
        <Button variant="ghost" className="org-call-cancel" onClick={endCall}>{t('Cancel', 'ரத்து செய்')}</Button>
      </div> : <div className="org-call-live">
        <p className="org-call-demo">{t('Demo call — not a real session', 'டெமோ அழைப்பு — உண்மையான அமர்வு அல்ல')}</p>
        <div className="org-call-video">{cameraOff ? <VideoOff /> : <PartnerMark group={selected} />}</div>
        <h2>{selected.name}</h2>
        <p className="org-call-timer" role="timer">{formatCallTime(callSeconds)}</p>
        <div className="org-call-controls">
          <Button variant="ghost" aria-pressed={muted} aria-label={t('Mute microphone', 'ஒலிவாங்கியை நிறுத்து')} onClick={() => setMuted(m => !m)}>{muted ? <MicOff /> : <Mic />}</Button>
          <Button variant="ghost" aria-pressed={cameraOff} aria-label={t('Turn camera off', 'கேமராவை அணை')} onClick={() => setCameraOff(c => !c)}>{cameraOff ? <VideoOff /> : <Video />}</Button>
          <Button variant="ghost" className="org-call-end" aria-label={t('End call', 'அழைப்பை முடி')} onClick={endCall}><PhoneOff /></Button>
        </div>
      </div>}
    </div>}
  </main>;
}