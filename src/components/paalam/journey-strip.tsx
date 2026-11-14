import {Link,useRouterState} from '@tanstack/react-router';
import {JOURNEY,journeyStep} from '@/lib/paalam-journey';
import {usePaalam} from './context';

export function JourneyStrip(){
  const {t}=usePaalam();
  const pathname=useRouterState({select:state=>state.location.pathname});
  const current=journeyStep(pathname);
  return <nav className="journey-strip" aria-label={t('Your learning journey','உங்கள் கற்றல் பயணம்')}><ol className="shell journey-steps">{JOURNEY.map(step=><li key={step.id}><Link to={step.links[0].to} className={current===step.id?'current':''} aria-current={current===step.id?'step':undefined}><span className="journey-number">{step.number}</span>{t(...step.label)}</Link></li>)}</ol></nav>;
}