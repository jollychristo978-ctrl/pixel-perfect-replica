import { createFileRoute,Link,useNavigate } from '@tanstack/react-router';
import { useEffect,useRef } from 'react';
import { ArrowRight,Globe2,ShieldCheck,Heart,Leaf,MapPin,BookOpen,Play,Mic,Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaalam } from '@/components/paalam/context';
import jaffna from '@/assets/home-jaffna-student.jpg';
import london from '@/assets/home-london-learner.jpg';
import hills from '@/assets/home-tea-hills.jpg';
import family from '@/assets/home-family-tea.jpg';
import { meta } from '@/lib/paalam';
import { JOURNEY } from '@/lib/paalam-journey';
export const Route=createFileRoute('/')({head:()=>meta('Paalam — Learn a language, build a bridge','A two-way Tamil and English language exchange connecting learners in the UK and Sri Lanka.'),component:Home});
const ICONS=[Play,Mic,Phone];
function useReveal(){const ref=useRef<HTMLElement>(null);useEffect(()=>{const root=ref.current;if(!root)return;const els=root.querySelectorAll('.reveal');const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.15});els.forEach(el=>io.observe(el));return()=>io.disconnect();},[]);return ref;}
function Home(){const {t,user}=usePaalam(); const navigate=useNavigate(); const ref=useReveal();
useEffect(()=>{ if(user) void navigate({to:'/quest',replace:true}); },[user,navigate]);
const words=['வணக்கம்','Hello','நன்றி','Thank you','நண்பன்','Friend','பாலம்','Bridge'];
return <><main ref={ref} className="landing">
<section className="lp-hero shell">
<div className="lp-hero-copy">
<div className="eyebrow lp-fade" style={{animationDelay:'0ms'}}><Globe2 size={13}/>{t('TWO LANGUAGES. ONE COMMUNITY.','இரு மொழிகள். ஒரு சமூகம்.')}</div>
<h1 className="lp-title lp-fade" style={{animationDelay:'120ms'}}>{t('Learn Tamil.','தமிழ் கற்போம்.')}<br/><em>{t('Share English.','ஆங்கிலம் பகிர்வோம்.')}</em><br/>{t('Build a bridge.','பாலம் அமைப்போம்.')}</h1>
<p className="hero-copy lp-fade" style={{animationDelay:'240ms'}}>{t('Paalam — பாலம் — connects Tamil learners in the UK with students in Sri Lanka through short clips, playful practice and safe, organisation-led calls.','பாலம் இங்கிலாந்து தமிழ் கற்பவர்களையும் இலங்கை மாணவர்களையும் குறும்படங்கள், விளையாட்டுப் பயிற்சி மற்றும் பாதுகாப்பான அழைப்புகள் மூலம் இணைக்கிறது.')}</p>
<div className="lp-ctas lp-fade" style={{animationDelay:'360ms'}}><Button asChild size="lg"><Link to="/auth" search={{learn:'Tamil',mode:'signup'}}>{t('Learn Tamil','தமிழ் கற்க')}<ArrowRight size={16}/></Link></Button><Button asChild size="lg" variant="outline"><Link to="/auth" search={{learn:'English',mode:'signup'}}>{t('Learn English','ஆங்கிலம் கற்க')}</Link></Button></div>
</div>
<div className="lp-collage" aria-hidden="false">
<figure className="lp-photo lp-photo-a"><img src={london} width={1280} height={1600} alt={t('A Tamil learner in London on a call','லண்டனில் அழைப்பில் ஒரு தமிழ் கற்பவர்')}/><figcaption><MapPin size={12}/>London</figcaption></figure>
<figure className="lp-photo lp-photo-b"><img src={jaffna} width={1280} height={1600} alt={t('A student in Jaffna waving on a video call','யாழ்ப்பாணத்தில் காணொளி அழைப்பில் கை அசைக்கும் மாணவி')}/><figcaption><MapPin size={12}/>Jaffna</figcaption></figure>
<svg className="lp-arc" viewBox="0 0 300 120" aria-hidden="true"><path d="M10 110 Q150 -30 290 110" /></svg>
<div className="lp-bubble lp-bubble-1">வணக்கம்!</div><div className="lp-bubble lp-bubble-2">Hello!</div>
</div>
</section>
<div className="lp-marquee" aria-hidden="true"><div className="lp-marquee-track">{[...words,...words,...words].map((w,i)=><span key={i}>{w}<i>•</i></span>)}</div></div>
<section className="shell lp-journey" aria-labelledby="journey-title">
<p className="lp-kicker reveal">{t('How it works','எப்படி வேலை செய்கிறது')}</p>
<h2 id="journey-title" className="lp-h2 reveal">{t('Watch, practise, connect','பார், பயிற்சி, இணை')}</h2>
<div className="lp-journey-grid">{JOURNEY.map((step,i)=>{const Icon=ICONS[i]??Play;return <Link key={step.id} to={step.links[0].to} className="lp-step reveal" style={{transitionDelay:`${i*120}ms`}}><span className="lp-step-icon"><Icon size={20}/></span><span className="step-num">{step.number}</span><h3>{t(step.label[0],step.label[1])}</h3><p className="subtext">{t(step.subtitle[0],step.subtitle[1])}</p><span className="home-journey-go">{t('Start','தொடங்கு')}<ArrowRight size={14}/></span></Link>})}</div>
</section>
<section className="lp-story shell">
<div className="lp-story-img reveal"><img src={family} width={1600} height={1200} loading="lazy" alt={t('A grandmother and granddaughter laughing over Tamil homework','தமிழ் வீட்டுப்பாடத்தில் சிரிக்கும் பாட்டியும் பேத்தியும்')}/></div>
<div className="lp-story-copy reveal">
<p className="lp-kicker">{t('Why Paalam','ஏன் பாலம்')}</p>
<h2 className="lp-h2">{t('Talk to Paati in her language.','பாட்டியுடன் அவள் மொழியில் பேசுங்கள்.')}</h2>
<p className="subtext">{t('Many young Tamils in the UK understand a little but freeze when it is their turn to speak. Paalam gives you short, funny, real-life practice — so the next family dinner feels different.','இங்கிலாந்தில் பல இளம் தமிழர்கள் கொஞ்சம் புரிந்துகொண்டாலும் பேசத் தயங்குகிறார்கள். பாலம் குறுகிய, வேடிக்கையான பயிற்சியைத் தருகிறது.')}</p>
<div className="trust-row"><span><ShieldCheck size={15}/>{t('Safe by design','பாதுகாப்பான வடிவமைப்பு')}</span><span><Heart size={15}/>{t('Two-way learning','இருவழிக் கற்றல்')}</span><span><Leaf size={15}/>{t('Made for low-end phones','எளிய தொலைபேசிகளுக்கு')}</span></div>
</div>
</section>
<section className="lp-band" style={{backgroundImage:`url(${hills})`}}>
<div className="lp-band-inner shell reveal">
<h2>{t('Every word you learn helps a student in Sri Lanka.','நீங்கள் கற்கும் ஒவ்வொரு சொல்லும் இலங்கை மாணவருக்கு உதவுகிறது.')}</h2>
<p>{t('Your practice earns bricks on the bridge, unlocking English sessions with partner charities in the hill country and the north.','உங்கள் பயிற்சி பாலத்தில் செங்கற்களைச் சேர்த்து, கூட்டாளர் தொண்டு நிறுவனங்களுடன் ஆங்கில அமர்வுகளைத் திறக்கிறது.')}</p>
</div>
</section>
<section className="join-section shell">
<p className="lp-kicker reveal">{t('Your journey starts here','உங்கள் பயணம் இங்கே தொடங்குகிறது')}</p>
<h2 className="lp-h2 reveal">{t('What would you like to learn?','நீங்கள் என்ன கற்க விரும்புகிறீர்கள்?')}</h2>
<div className="path-grid">
<article className="path-card lp-path reveal"><img src={london} width={1280} height={1600} loading="lazy" alt="" className="lp-path-img"/><div className="path-icon">அ</div><h3>{t('I want to learn Tamil','நான் தமிழ் கற்க விரும்புகிறேன்')}</h3><p className="subtext">{t('Connect with your roots and practise Tamil with a student in Sri Lanka.','உங்கள் வேர்களுடன் இணைந்து இலங்கை மாணவருடன் தமிழ் பயிலுங்கள்.')}</p><div className="country-tag"><MapPin size={13}/>{t('For learners in the United Kingdom','இங்கிலாந்தில் உள்ள கற்பவர்களுக்கு')}</div><Button asChild className="path-action"><Link to="/auth" search={{learn:'Tamil',mode:'signup'}}>{t('Learn Tamil','தமிழ் கற்க')}<ArrowRight size={16}/></Link></Button></article>
<article className="path-card english lp-path reveal" style={{transitionDelay:'120ms'}}><img src={jaffna} width={1280} height={1600} loading="lazy" alt="" className="lp-path-img"/><div className="path-icon">Aa</div><h3>{t('I want to learn English','நான் ஆங்கிலம் கற்க விரும்புகிறேன்')}</h3><p className="subtext">{t('Grow your confidence and practise English with a Tamil speaker in the UK.','இங்கிலாந்து தமிழ் பேசுபவருடன் ஆங்கிலம் பயின்று நம்பிக்கையை வளருங்கள்.')}</p><div className="country-tag"><MapPin size={13}/>{t('For school & university students in Sri Lanka','இலங்கை பள்ளி மற்றும் பல்கலைக்கழக மாணவர்களுக்கு')}</div><Button asChild variant="outline" className="path-action text-primary"><Link to="/auth" search={{learn:'English',mode:'signup'}}>{t('Learn English','ஆங்கிலம் கற்க')}<ArrowRight size={16}/></Link></Button></article>
</div>
<p className="subtext"><BookOpen size={14} className="inline mr-1.5"/>{t('Have a charity invite code?','தொண்டு நிறுவன அழைப்புக் குறியீடு உள்ளதா?')} <Link to="/auth" search={{learn:'English',mode:'signup'}} className="font-semibold text-primary underline underline-offset-4">{t('Join as a student','மாணவராக இணையுங்கள்')}<ArrowRight size={13} className="inline ml-1"/></Link></p>
</section>
</main><footer className="shell footer"><span>Paalam · பாலம்</span><span>{t('Made for connection. Rooted in community.','இணைப்புக்காக. சமூகத்துடன்.')}</span><span>{t('United Kingdom ↔ Sri Lanka','இங்கிலாந்து ↔ இலங்கை')}</span></footer></>}
