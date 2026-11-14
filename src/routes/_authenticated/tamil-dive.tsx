import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Check, Clock3, Languages, RotateCcw, Share2, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePaalam } from '@/components/paalam/context';
import { meta } from '@/lib/paalam';
import { dailyDive, diveDepth, DIVE_SECONDS, scoreDiveAnswer, type DiveAnswer, type DivePrompt } from '@/lib/tamil-dive';
import ocean from '@/assets/tamil-dive.jpg';

export const Route = createFileRoute('/_authenticated/tamil-dive')({ head: () => meta('Tamil Dive', 'A Tamil coastal trivia dive with seven timed prompts, typed answers and English translations.'), component: TamilDive });
type Round = { prompt: DivePrompt; input: string; answer: DiveAnswer | null };
function TamilDive() {
  const { t } = usePaalam();
  const [prompts, setPrompts] = useState<DivePrompt[]>([]);
  const [phase, setPhase] = useState<'ready'|'playing'|'feedback'|'done'>('ready');
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [english, setEnglish] = useState(true);
  const [seconds, setSeconds] = useState(DIVE_SECONDS);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [best, setBest] = useState(0);
  const [notice, setNotice] = useState('');
  const deadline = useRef(0);
  const locked = useRef(false);
  const inputRef = useRef(input);
  const field = useRef<HTMLInputElement>(null);
  const points = rounds.reduce((total, r) => total + (r.answer?.points ?? 0), 0);
  const depth = diveDepth(points);
  const prompt = prompts[index];
  const last = rounds.at(-1);
  useEffect(() => {
    setPrompts(dailyDive());
    try { setBest(Number(localStorage.getItem('paalam-dive-best')) || 0); } catch { /* optional device record */ }
  }, []);
  useEffect(() => {
    if (phase !== 'playing' || !prompt) return;
    field.current?.focus();
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0 && !locked.current) {
        locked.current = true;
        setRounds(previous => [...previous, { prompt, input: inputRef.current, answer: scoreDiveAnswer(prompt, inputRef.current) }]);
        setPhase('feedback');
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [phase, prompt]);
  function begin() {
    setPrompts(dailyDive()); setIndex(0); setRounds([]); setNotice(''); startRound();
  }
  function startRound() {
    locked.current = false; inputRef.current = ''; setInput(''); setSeconds(DIVE_SECONDS); deadline.current = Date.now() + DIVE_SECONDS * 1000; setPhase('playing');
  }
  function submit(skip = false) {
    if (!prompt || phase !== 'playing' || locked.current) return;
    locked.current = true;
    const value = skip ? '' : inputRef.current;
    setRounds(previous => [...previous, { prompt, input: value, answer: scoreDiveAnswer(prompt,value) }]); setPhase('feedback');
  }
  function next() {
    if (index + 1 === prompts.length) {
      setPhase('done');
      if (depth > best) { setBest(depth); try { localStorage.setItem('paalam-dive-best',String(depth)); } catch { /* optional */ } }
    } else { setIndex(value => value + 1); startRound(); }
  }
  async function share() {
    const text = `Tamil Dive · Paalam\n${depth.toLocaleString()} m · ${rounds.filter(r=>r.answer).length}/7\n${rounds.map(r=>r.answer?'🟢':'⚪').join('')}`;
    try { await navigator.clipboard.writeText(text); setNotice(t('Result copied','முடிவு நகலெடுக்கப்பட்டது')); } catch { setNotice(text); }
  }
  return <main className="dive-page shell">
    <div className="dive-heading"><div><p className="text-sm text-coral font-semibold">{t('The daily Tamil challenge','தினசரி தமிழ்ச் சவால்')}</p><h1>{t('Tamil Dive','தமிழ் ஆழ்கடல்')}</h1></div><label className="dive-translation"><Languages size={18}/><span>English</span><Switch checked={english} onCheckedChange={setEnglish} aria-label="English translations"/></label></div>
    <div className="dive-layout">
      <aside className={`dive-ocean ${phase==='playing'?'diving':''}`} aria-label={t('Tamil coastal dive','தமிழ்க் கடல் பயணம்')}>
        <img src={ocean} width={1024} height={1536} alt={t('A shrimp diving past coral and pearl oysters off a Tamil coastline','தமிழ்க் கடற்கரையில் பவளங்களுக்கும் முத்துச் சிப்பிகளுக்கும் அருகே இறால்')}/>
        <div className="dive-depth"><ArrowDown/><strong>{depth.toLocaleString()} <small>m</small></strong><span>{t('Your depth','உங்கள் ஆழம்')}</span></div>
        <div className="dive-sea-label">{t('From Jaffna, into the deep','யாழ்ப்பாணத்திலிருந்து ஆழ்கடலுக்கு')}</div>
      </aside>
      <section className="dive-game">
        {phase==='ready' && <div className="dive-intro"><span className="dive-kicker">{t('Today’s dive','இன்றைய பயணம்')}</span><h2 className="font-tamil" lang="ta">ஆழமாகச் செல்லுங்கள்.</h2>{english&&<p className="dive-english">Go a little deeper.</p>}<div className="dive-facts"><span><strong>7</strong>{t('prompts','கேள்விகள்')}</span><span><strong>25s</strong>{t('per answer','ஒவ்வொரு பதிலுக்கும்')}</span><span><strong>தமிழ்</strong>{t('＋ English','＋ ஆங்கிலம்')}</span></div><p className="subtext">{t('Name a word. Find a less obvious one. Discover its Tamil meaning.','ஒரு சொல்லைச் சொல்லுங்கள். அரிதான சொல்லைக் கண்டறியுங்கள். அதன் தமிழ்ப் பொருளை அறியுங்கள்.')}</p><Button size="lg" onClick={begin} disabled={!prompts.length}>{t('Begin descent','பயணத்தைத் தொடங்கு')}<ArrowDown/></Button>{best>0&&<p className="subtext">{t('Your best','உங்கள் சிறந்த ஆழம்')}: {best.toLocaleString()} m</p>}<p className="dive-scoring-note">{t('Vocabulary scores are curated—not live player rarity. Accepts Tamil, transliteration or English. No bridge XP awarded.','சொல் மதிப்பெண்கள் முன்கூட்டியே நிர்ணயிக்கப்பட்டவை. தமிழ், ஒலிபெயர்ப்பு அல்லது ஆங்கிலத்தில் பதிலளிக்கலாம். பாலம் XP வழங்கப்படாது.')}</p></div>}
        {(phase==='playing'||phase==='feedback')&&prompt&&<>
          <div className="dive-round-bar"><span>{t('Dive','பயணம்')} {index+1} / {prompts.length}</span><span className={seconds<=5?'text-coral':''}><Clock3 size={17}/>{seconds}s</span></div>
          <div className="dive-round-dots">{prompts.map((p,i)=><span key={p.id} className={i<rounds.length?(rounds[i]?.answer?'hit':'miss'):i===index?'current':''}/>)}</div>
          <div className="dive-question" key={prompt.id}><h2 lang="ta" className="font-tamil">{prompt.tamil}</h2>{english&&<p className="dive-english">{prompt.english}</p>}</div>
          {phase==='playing'?<form onSubmit={e=>{e.preventDefault();submit();}}><label htmlFor="dive-answer">{t('Your word','உங்கள் சொல்')}</label><input ref={field} id="dive-answer" autoComplete="off" maxLength={80} value={input} onChange={e=>{inputRef.current=e.target.value;setInput(e.target.value);}} placeholder={t('Tamil, transliteration or English','தமிழ் அல்லது ஆங்கிலம்')}/><div className="dive-answer-actions"><Button type="submit" disabled={!input.trim()}>{t('Dive with this word','இந்தச் சொல்லுடன் செல்லுங்கள்')}<ArrowDown/></Button><Button variant="ghost" type="button" onClick={()=>submit(true)}>{t('Skip','தவிர்')}</Button></div></form>:last&&<div className="dive-feedback" aria-live="polite"><div className="flex items-center gap-2 font-semibold">{last.answer?<Check className="text-primary"/>:<X className="text-coral"/>}{last.answer?t(`+${last.answer.points} points · ${diveDepth(last.answer.points)} m deeper`,`+${last.answer.points} புள்ளிகள் · ${diveDepth(last.answer.points)} m ஆழம்`):t(last.input?'Not in this word bank yet':'No answer this time',last.input?'இந்தச் சொல் பட்டியலில் இல்லை':'இந்த முறை பதில் இல்லை')}</div>{last.answer?<div className="dive-reveal"><strong lang="ta">{last.answer.tamil}</strong><span>{last.answer.roman}</span>{english&&<p>{last.answer.english}</p>}</div>:<p className="subtext mt-3">{last.input&&<span>“{last.input}” — </span>}{t('No points this round. Another word awaits.','இந்தச் சுற்றில் புள்ளிகள் இல்லை. அடுத்த சொல்லை முயற்சிக்கலாம்.')}</p>}<details className="dive-word-bank"><summary>{t('Discover other answers','வேறு பதில்களைக் காண்க')}</summary><div>{prompt.answers.map(a=><p key={a.tamil}><strong lang="ta">{a.tamil}</strong><span>{a.roman}{english?` · ${a.english}`:''}</span><b>{a.points}</b></p>)}</div></details><Button onClick={next}>{index+1===prompts.length?t('See my depth','என் ஆழத்தைக் காட்டு'):t('Next prompt','அடுத்த கேள்வி')}<ArrowRight/></Button></div>}
        </>}
        {phase==='done'&&<div className="dive-summary"><Trophy size={36} className="text-coral"/><span className="dive-kicker">{t('Dive complete','பயணம் முடிந்தது')}</span><h2>{depth.toLocaleString()} m</h2><p className="dive-english">{t(`${rounds.filter(r=>r.answer).length} of 7 words found`,`${rounds.filter(r=>r.answer).length} / 7 சொற்கள் கண்டறியப்பட்டன`)}</p><div className="dive-results">{rounds.map((r,i)=><div key={r.prompt.id}><span>{i+1}</span><div><strong lang="ta">{r.answer?.tamil??(r.input||t('Skipped','தவிர்க்கப்பட்டது'))}</strong><p>{r.answer?r.answer.roman:t('No points','புள்ளிகள் இல்லை')}{english&&r.answer?` · ${r.answer.english}`:''}</p></div><b>+{r.answer?.points??0}</b></div>)}</div><div className="flex gap-2 flex-wrap"><Button onClick={begin}><RotateCcw/>{t('Practise again','மீண்டும் பயிற்சி')}</Button><Button variant="outline" onClick={share}><Share2/>{t('Copy result','முடிவை நகலெடு')}</Button><Button asChild variant="ghost"><Link to="/practice">{t('Say it in a conversation','உரையாடலில் பயன்படுத்துங்கள்')}<ArrowRight/></Link></Button></div>{notice&&<p role="status" className="subtext mt-3 whitespace-pre-line">{notice}</p>}</div>}
      </section>
    </div>
  </main>;
}