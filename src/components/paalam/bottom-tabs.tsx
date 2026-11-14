import {Link,useRouterState} from '@tanstack/react-router';
import {Clapperboard,Mic,Users} from 'lucide-react';
import {JOURNEY,journeyStep} from '@/lib/paalam-journey';
import {usePaalam} from './context';

const ICONS={watch:Clapperboard,practise:Mic,connect:Users} as const;

/** TikTok-style fixed bottom bar for the three journey sections. */
export function BottomTabs(){
  const {t}=usePaalam();
  const pathname=useRouterState({select:s=>s.location.pathname});
  const current=journeyStep(pathname);
  return <nav className="bottom-tabs" aria-label={t('Paalam sections','பாலம் பிரிவுகள்')}>{JOURNEY.map(step=>{const Icon=ICONS[step.id];const on=current===step.id;return <Link key={step.id} to={step.links[0].to} className={on?'active':''} aria-current={on?'page':undefined}><Icon size={22}/><span>{t(step.label[0],step.label[1])}</span></Link>})}</nav>;
}

/** Links inside the section the learner is currently in. */
export function SectionLinks(){
  const {t}=usePaalam();
  const pathname=useRouterState({select:s=>s.location.pathname});
  const step=JOURNEY.find(s=>s.id===journeyStep(pathname))!;
  return <nav className="section-links shell" aria-label={t(step.label[0],step.label[1])}>{step.links.map(l=><Link key={l.to} to={l.to} activeProps={{className:'active'}}>{t(l.label[0],l.label[1])}</Link>)}</nav>;
}
