import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Flame, Award, Users, Lock, Video } from 'lucide-react';
import {Button} from '@/components/ui/button';
import {FIRST_CALL_XP,callProgress} from '@/lib/paalam-journey';
import { bridgeOptions } from '@/lib/paalam.queries';
import { meta } from '@/lib/paalam';
import { usePaalam } from '@/components/paalam/context';
import { STAMPS } from '@/lib/paaru';

export const Route = createFileRoute('/_authenticated/bridge')({
  head: () => meta('The Bridge', 'Every word you learn lays a brick on the bridge from London to Jaffna.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(bridgeOptions),
  component: Bridge,
});

const GOAL = 500;
const SEGMENTS = 14;

const LEAGUE = [
  { pair: 'Amara & Kavya', xp: 1240 },
  { pair: 'Tom & Tharindu', xp: 980 },
  { pair: 'Priya & Meera', xp: 860 },
  { pair: 'Sam & Ashan', xp: 640 },
];

function Bridge() {
  const { data } = useSuspenseQuery(bridgeOptions);
  const { t } = usePaalam();
  const completed = Math.floor(data.totalXp / GOAL);
  const progress = (data.totalXp % GOAL) / GOAL;
  const filled = Math.round(progress * SEGMENTS);
  const call = callProgress(data.totalXp);

  const badges = [
    { name: t('First Kural', 'முதல் குறள்'), earned: data.words.length >= 1 },
    { name: t('10-day streak', '10 நாள் தொடர்ச்சி'), earned: data.streak >= 10 },
    { name: t('Paati approved', 'பாட்டி ஒப்புதல்'), earned: data.totalXp >= 100 },
    { name: t('Bridge builder', 'பாலம் கட்டியவர்'), earned: completed >= 1 },
  ];

  return (
    <main className="dashboard bridge-page">
      <p className="text-sm text-primary mb-3">{t('THE BRIDGE', 'பாலம்')}</p>
      <h1>{t('London to Jaffna, brick by brick', 'லண்டன் முதல் யாழ்ப்பாணம் வரை, செங்கல் செங்கலாக')}</h1>
      <p className="subtext">
        {t(
          'Every word you master lays a brick. Finish a bridge and a sponsor-funded English lesson unlocks for a student in Sri Lanka.',
          'நீங்கள் கற்கும் ஒவ்வொரு சொல்லும் ஒரு செங்கல். பாலத்தை நிறைவு செய்தால் இலங்கை மாணவருக்கு நிதியளிக்கப்பட்ட ஆங்கிலப் பாடம் திறக்கப்படும்.',
        )}
      </p>

      <div className="bridge-stats">
        <div><p className="bridge-stat-num">{data.totalXp}</p><p className="subtext text-xs">{t('XP earned', 'பெற்ற XP')}</p></div>
        <div><p className="bridge-stat-num">{completed}</p><p className="subtext text-xs">{t('Bridges completed', 'நிறைவடைந்த பாலங்கள்')}</p></div>
        <div><p className="bridge-stat-num flex items-center justify-center gap-1"><Flame size={20} />{data.streak}</p><p className="subtext text-xs">{t('Day streak', 'நாள் தொடர்ச்சி')}</p></div>
        <div><p className="bridge-stat-num">{data.words.length}</p><p className="subtext text-xs">{t('Words saved', 'சேமித்த சொற்கள்')}</p></div>
      </div>

      <div className="bridge-map" role="img" aria-label={t('Bridge progress from London to Jaffna', 'லண்டனில் இருந்து யாழ்ப்பாணம் வரை பால முன்னேற்றம்')}>
        <svg viewBox="0 0 600 230" className="w-full h-auto">
          <text x="60" y="205" textAnchor="middle" className="bridge-label">London</text>
          <text x="540" y="205" textAnchor="middle" className="bridge-label">Jaffna · யாழ்ப்பாணம்</text>
          <rect x="20" y="150" width="80" height="30" rx="4" className="bridge-cliff" />
          <rect x="500" y="150" width="80" height="30" rx="4" className="bridge-cliff" />
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const frac = i / (SEGMENTS - 1);
            const x = 100 + frac * 400;
            const y = 160 - Math.sin(Math.PI * frac) * 70;
            return <rect key={i} x={x - 13} y={y - 9} width="26" height="18" rx="3" className={`bridge-brick${i < filled ? ' filled' : ''}`} />;
          })}
        </svg>
        <p className="subtext text-center text-xs">
          {t(`${Math.round(progress * 100)}% of this bridge built — ${GOAL - (data.totalXp % GOAL)} XP to go`, `இந்த பாலம் ${Math.round(progress * 100)}% கட்டப்பட்டது — மீதம் ${GOAL - (data.totalXp % GOAL)} XP`)}
        </p>
      </div>

      <section className="call-unlock">
        <h2>{t('Unlock your first Sri Lanka call','உங்கள் முதல் இலங்கை அழைப்பைத் திறக்குங்கள்')}</h2>
        <p className="subtext">{Math.min(data.totalXp,FIRST_CALL_XP)} / {FIRST_CALL_XP} XP</p>
        <progress className="call-progress" value={Math.min(data.totalXp,FIRST_CALL_XP)} max={FIRST_CALL_XP} aria-label={t('First call progress','முதல் அழைப்பு முன்னேற்றம்')}/>
        {call.unlocked?<Button asChild><Link to="/calls"><Video/>{t('Book a call','அழைப்பை முன்பதிவு செய்')}</Link></Button>:<Button disabled variant="outline"><Lock/>{t(`${call.remaining} XP left`, `இன்னும் ${call.remaining} XP`)}</Button>}
      </section>

      <h2 className="text-xl font-semibold mt-8 mb-3 flex items-center gap-2"><Award size={18} />{t('Badges', 'பதக்கங்கள்')}</h2>
      <div className="badge-row">
        {badges.map((b) => (
          <span key={b.name} className={`badge${b.earned ? ' earned' : ''}`}>{b.name}</span>
        ))}
      </div>

      <section className="mt-8"><h2 className="text-xl font-semibold mb-1">{t('Passport stamps','கடவுச்சீட்டு முத்திரைகள்')}</h2><p className="subtext mb-3">{t('Save words to collect stamps from Tamil Nadu and Sri Lanka.','சொற்களைச் சேமித்து முத்திரைகளைச் சேகரியுங்கள்.')}</p><div className="stamp-grid">{STAMPS.map(s=>{const got=data.words.length>=s.words;return <div key={s.id} className={got?'stamp got':'stamp'}><span className="stamp-emoji" aria-hidden="true">{got?s.emoji:'🔒'}</span><p className="font-semibold text-sm">{t(s.label[0],s.label[1])}</p><p className="subtext text-xs">{got?t('Collected','சேகரிக்கப்பட்டது'):t(`${s.words-data.words.length} more words`,`இன்னும் ${s.words-data.words.length} சொற்கள்`)}</p></div>})}</div></section>
      <section className="mt-8"><h2 className="text-xl font-semibold mb-3">{t('My Words','என் சொற்கள்')}</h2>{data.words.length?<div className="word-grid">{data.words.map(word=><div className="word-chip" key={word.tamil}><p className="word-tamil font-tamil">{word.tamil}</p><p className="subtext">{word.transliteration}</p><p className="subtext text-xs">{word.english}</p></div>)}</div>:<p className="subtext">{t('No words saved yet.','இன்னும் சொற்கள் சேமிக்கப்படவில்லை.')}</p>}</section>

      <h2 className="text-xl font-semibold mt-8 mb-3 flex items-center gap-2"><Users size={18} />{t('Pair league', 'ஜோடி லீக்')}</h2>
      <p className="subtext mb-3">{t('UK–Sri Lanka pairs compete together against other pairs. Demo standings:', 'இங்கிலாந்து–இலங்கை ஜோடிகள் மற்ற ஜோடிகளுடன் போட்டியிடுகின்றன. டெமோ மதிப்பெண்கள்:')}</p>
      <div className="league-list">
        {LEAGUE.map((row, i) => (
          <div className="league-row" key={row.pair}>
            <span className="league-rank">{i + 1}</span>
            <span className="flex-1 font-medium">{row.pair}</span>
            <span className="subtext">{row.xp} XP</span>
          </div>
        ))}
      </div>
    </main>
  );
}
