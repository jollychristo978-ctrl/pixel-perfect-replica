import {createFileRoute,Link} from '@tanstack/react-router';
import {useEffect,useState} from 'react';
import {Volume2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {usePaalam} from '@/components/paalam/context';
import {meta} from '@/lib/paalam';
import {getAudio} from '@/lib/tamil.functions';
import {PLACEMENT,placementDone,placementLevel} from '@/lib/paaru';

export const Route=createFileRoute('/_authenticated/level-check')({head:()=>meta('Level check','Listen to Tamil and pick the meaning to find your starting level.'),component:LevelCheck});

const LEVEL_TEXT={new:['You are starting fresh','நீங்கள் புதிதாகத் தொடங்குகிறீர்கள்'],beginner:['You know some everyday Tamil','அன்றாடத் தமிழ் கொஞ்சம் தெரியும்'],intermediate:['You understand full sentences','முழு வாக்கியங்கள் புரிகின்றன']} as const;

function LevelCheck(){
  const {t}=usePaalam();
  const [i,setI]=useState(0),[correct,setCorrect]=useState(0),[misses,setMisses]=useState(0),[picked,setPicked]=useState<number|null>(null),[saved,setSaved]=useState<string|null>(null);
  useEffect(()=>{setSaved(localStorage.getItem('paalam-level'));},[]);
  const done=picked===null&&placementDone(i,misses); const q=PLACEMENT[Math.min(i,PLACEMENT.length-1)]!;
  useEffect(()=>{ if(done) localStorage.setItem('paalam-level',placementLevel(correct)); },[done,correct]);
  async function say(){ try{ const {audio}=await getAudio({data:{kind:'speak',text:q.tamil}}); await new Audio(`data:audio/mpeg;base64,${audio}`).play(); }catch{/* read the text instead */} }
  function pick(k:number){ if(picked!==null) return; setPicked(k); if(k===q.c) setCorrect(c=>c+1); else setMisses(m=>m+1); }
  function next(){ setPicked(null); setI(n=>n+1); }
  function restart(){ setI(0);setCorrect(0);setMisses(0);setPicked(null); }
  if(done){ const lvl=placementLevel(correct); return <main className="shell py-8 max-w-xl"><p className="text-xs font-semibold uppercase text-primary">{t('Level check','நிலைச் சோதனை')}</p><h1 className="text-3xl font-bold mt-2">{t(LEVEL_TEXT[lvl][0],LEVEL_TEXT[lvl][1])}</h1><p className="subtext mt-2">{t(`You got ${correct} right. The check stops after two misses.`,`${correct} சரி. இரண்டு தவறுகளுக்குப் பின் சோதனை நிற்கும்.`)}</p><div className="flex gap-2 mt-6 flex-wrap"><Button asChild><Link to="/quest">{t('Start watching','பார்க்கத் தொடங்கு')}</Link></Button><Button variant="outline" onClick={restart}>{t('Try again','மீண்டும்')}</Button></div></main>; }
  return <main className="shell py-8 max-w-xl"><p className="text-xs font-semibold uppercase text-primary">{t(`Level check · question ${i+1} of ${PLACEMENT.length}`,`நிலைச் சோதனை · கேள்வி ${i+1} / ${PLACEMENT.length}`)}</p>{saved&&i===0&&picked===null&&<p className="subtext mt-1">{t('You have done this before; taking it again updates your level.','முன்பே செய்தீர்கள்; மீண்டும் செய்தால் நிலை புதுப்பிக்கப்படும்.')}</p>}<h1 className="text-2xl font-bold mt-3">{t('Listen. What does it mean?','கேளுங்கள். இதன் பொருள் என்ன?')}</h1>
  <button className="level-heard" onClick={say}><Volume2 size={20}/><span><span className="font-tamil text-xl" lang="ta">{q.tamil}</span><br/><span className="subtext">{q.roman}</span></span></button>
  <div className="level-opts">{q.opts.map((o,k)=><button key={o} onClick={()=>pick(k)} className={picked===null?'':k===q.c?'right':k===picked?'wrong':''}>{o}</button>)}</div>
  {picked!==null&&<div className="mt-4 flex items-center justify-between gap-3"><p className="font-semibold">{picked===q.c?t('Correct','சரி'):t(`The answer was "${q.opts[q.c]}"`,`சரியான பதில்: "${q.opts[q.c]}"`)}</p><Button onClick={next}>{t('Continue','தொடர்')}</Button></div>}
  {picked===null&&<Button variant="ghost" className="mt-3" onClick={()=>pick(-1)}>{t("I don't know","தெரியாது")}</Button>}</main>;
}
