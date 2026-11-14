import { Link,useNavigate,useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Languages,LogOut,UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePaalam } from './context';
import { supabase } from '@/integrations/supabase/client';
import {JOURNEY} from '@/lib/paalam-journey';
import {JourneyStrip} from './journey-strip';
export function Header(){
 const {t,tamil,setTamil,user}=usePaalam(); const navigate=useNavigate(); const queryClient=useQueryClient(); const router=useRouter();
 async function signOut(){ await queryClient.cancelQueries(); queryClient.clear(); const {error}=await supabase.auth.signOut(); if(error) return; await navigate({to:'/auth',replace:true}); await router.invalidate(); }
 return <header className="site-header"><div className="shell header-inner"><Link to="/" className="brand" aria-label="Paalam home"><svg className="brand-mark" viewBox="0 0 40 36" fill="none" aria-hidden="true"><path d="M3 29V13m34 16V13M3 21h34M3 17C11 17 10 5 20 5s9 12 17 12M11 14v7m9-16v16m9-7v7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/></svg>Paalam <span className="font-tamil text-base font-normal text-muted-foreground">பாலம்</span></Link><div className="flex items-center gap-3"><div className="language-switch"><Languages size={16}/><span className="hidden sm:inline">EN</span><Switch checked={tamil} onCheckedChange={setTamil} aria-label={t('Switch to Tamil','ஆங்கிலத்திற்கு மாற்று')}/><span className="font-tamil">தமிழ்</span></div>{user?<><Button asChild size="icon" variant="ghost" title={t('My profile','என் விவரம்')}><Link to="/dashboard" aria-label={t('My profile','என் விவரம்')}><UserRound/></Link></Button><Button size="icon" variant="ghost" onClick={signOut} title={t('Sign out','வெளியேறு')} aria-label={t('Sign out','வெளியேறு')}><LogOut/></Button></>:<Button asChild variant="ghost" className="text-primary"><Link to="/auth">{t('Sign in','உள்நுழை')}</Link></Button>}</div></div>{user&&<><nav className="app-nav shell" aria-label={t('Paalam sections','பாலம் பிரிவுகள்')}>{JOURNEY.map(step=><div className="nav-group" key={step.id}><p className="nav-group-label">{step.number} {t(step.label[0],step.label[1])}</p><div className="nav-group-links">{step.links.map(link=><Link key={link.to} to={link.to} activeProps={{className:'active'}}>{t(link.label[0],link.label[1])}</Link>)}</div></div>)}</nav><JourneyStrip/></>}</header>;
}
