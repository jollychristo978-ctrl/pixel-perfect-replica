import {createFileRoute,Link} from '@tanstack/react-router';
import {ArrowRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {usePaalam} from '@/components/paalam/context';
import {meta} from '@/lib/paalam';
import {useState} from 'react';
import originalVid from '@/assets/gajaan-demo-tamil.mp4.asset.json';
import tamilDubVid from '@/assets/gajaan-demo-tamil-dub.mp4.asset.json';
import {CREATOR,TIKTOK_CLIPS,tiktokVideoId} from '@/lib/tiktok-clips';

export const Route=createFileRoute('/_authenticated/tiktok')({head:()=>meta('TikTok practice','Watch three short Tamil creator clips, then say a line back.'),component:TikTokPractice});

function TikTokPractice(){
  const {t}=usePaalam();
  return <main className="shell py-8"><p className="text-xs font-semibold uppercase text-primary">{t('TikTok practice','டிக்டாக் பயிற்சி')}</p><h1 className="text-3xl font-bold mt-2">{t(`Watch ${CREATOR}, then say it back`,`${CREATOR} காணொளிகளைப் பார்த்து திரும்பச் சொல்லுங்கள்`)}</h1><p className="subtext mt-2">{t('Videos play from TikTok and stay credited to the creator.','காணொளிகள் டிக்டாக்கிலிருந்து இயங்கும்; படைப்பாளருக்கே உரிமை.')}</p>
  <div className="tiktok-grid">{TIKTOK_CLIPS.map(c=>{const id=tiktokVideoId(c.url);return <article key={c.id} className="tiktok-card"><h2 className="font-semibold">{t(c.title[0],c.title[1])}</h2>{c.id==='clip1'?<DemoPlayer/>:id?<iframe title={t(c.title[0],c.title[1])} src={`https://www.tiktok.com/embed/v2/${id}`} allow="encrypted-media; fullscreen" loading="lazy" className="tiktok-frame"/>:<div className="tiktok-frame tiktok-empty">{t('Video coming soon','காணொளி விரைவில்')}</div>}<p className="subtext">{t(c.prompt[0],c.prompt[1])}</p><Button asChild size="sm"><Link to="/paati">{t('Now say it back','இப்போது திரும்பச் சொல்லுங்கள்')}<ArrowRight size={14}/></Link></Button></article>})}</div></main>;
}

function DemoPlayer(){const {t}=usePaalam();const [lang,setLang]=useState<'en'|'ta'>('en');
 return <div><div className="demo-toggle" role="group" aria-label={t('Video language','காணொளி மொழி')}>{(['en','ta'] as const).map(l=><button key={l} type="button" aria-pressed={lang===l} className={lang===l?'on':''} onClick={()=>setLang(l)}>{l==='en'?t('Original English','அசல் ஆங்கிலம்'):t('Tamil (AI dub)','தமிழ் (AI)')}</button>)}</div>
 <video key={lang} src={lang==='en'?originalVid.url:tamilDubVid.url} controls playsInline preload="metadata" className="tiktok-frame"/>
 {lang==='ta'&&<p className="subtext text-xs mt-1">{t('Tamil voice translated by ElevenLabs AI — may not be exact.','ElevenLabs AI மொழிபெயர்ப்பு — துல்லியமாக இல்லாமல் இருக்கலாம்.')}</p>}</div>}
