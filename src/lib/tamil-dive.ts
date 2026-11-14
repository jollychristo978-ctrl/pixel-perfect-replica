export type DiveAnswer = { tamil: string; roman: string; english: string; points: number; aliases?: string[] };
export type DivePrompt = { id: string; tamil: string; english: string; answers: DiveAnswer[] };
export const DIVE_SECONDS = 25;
export const DIVE_ROUNDS = 7;
const word = (tamil: string, roman: string, english: string, points: number, aliases: string[] = []): DiveAnswer => ({ tamil, roman, english, points, aliases });

// Scores represent curated vocabulary difficulty, not measured player rarity.
export const DIVE_PROMPTS: DivePrompt[] = [
  { id: 'fruit', tamil: 'ஒரு பழத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a fruit', answers: [word('மாம்பழம்','maampazham','mango',30,['mampalam','maambazham']),word('வாழைப்பழம்','vaazhaipazham','banana',20,['vazhaipazham']),word('பலாப்பழம்','palaapazham','jackfruit',70,['palapazham']),word('நெல்லிக்காய்','nellikkai','gooseberry',100,['nellikai']),word('ஆப்பிள்','apple','apple',20),word('மாதுளை','maathulai','pomegranate',80,['mathulai']),word('திராட்சை','thiraatchai','grape',50,['grapes','thiratchai'])] },
  { id: 'food', tamil: 'ஒரு தமிழ் உணவின் பெயரைச் சொல்லுங்கள்', english: 'Name a Tamil dish', answers: [word('இட்லி','idli','idli',20,['idly']),word('தோசை','dosai','dosa',20,['thosai']),word('அப்பம்','appam','appam',50,['hoppers']),word('இடியப்பம்','idiyappam','string hoppers',70),word('புட்டு','puttu','puttu',60,['pittu']),word('கொத்து ரொட்டி','kothu roti','kothu roti',50,['kottu','kottu roti','kothu']),word('பொங்கல்','pongal','pongal',40),word('ஒடியல் கூழ்','odiyal kool','odiyal kool',100,['odiyal koozh'])] },
  { id: 'animals', tamil: 'ஒரு விலங்கின் பெயரைச் சொல்லுங்கள்', english: 'Name an animal', answers: [word('நாய்','naai','dog',20,['nai']),word('பூனை','poonai','cat',20,['punai']),word('யானை','yaanai','elephant',50,['yanai']),word('மான்','maan','deer',60,['man']),word('கீரிப்பிள்ளை','keerippillai','mongoose',100,['kirippillai']),word('ஆடு','aadu','goat',30,['adu']),word('மாடு','maadu','cow',30,['madu']),word('புலி','puli','tiger',50)] },
  { id: 'colours', tamil: 'ஒரு நிறத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a colour', answers: [word('சிவப்பு','sivappu','red',20),word('பச்சை','pachai','green',20,['pachchai']),word('நீலம்','neelam','blue',30,['nilam']),word('மஞ்சள்','manjal','yellow',40),word('வெள்ளை','vellai','white',30),word('கருப்பு','karuppu','black',30),word('ஊதா','oodha','violet',80,['purple','udha']),word('செம்மஞ்சள்','semmanjal','orange',100)] },
  { id: 'family', tamil: 'ஒரு குடும்ப உறவின் பெயரைச் சொல்லுங்கள்', english: 'Name a family relationship', answers: [word('அம்மா','amma','mother',20,['mum','mom']),word('அப்பா','appa','father',20,['dad']),word('அண்ணா','anna','older brother',40,['அண்ணன்','annan']),word('அக்கா','akka','older sister',40),word('தம்பி','thambi','younger brother',50,['tambi']),word('தங்கை','thangai','younger sister',60,['tangai']),word('பாட்டி','paati','grandmother',50,['paatti']),word('தாத்தா','thaatha','grandfather',50,['thatha']),word('மைத்துனர்','maithunar','brother in law',100)] },
  { id: 'sea', tamil: 'கடலில் வாழும் ஓர் உயிரினத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a creature that lives in the sea', answers: [word('மீன்','meen','fish',20,['min']),word('இறால்','iraal','shrimp',50,['iral','prawn']),word('நண்டு','nandu','crab',40),word('சுறா','suraa','shark',50,['sura']),word('திமிங்கிலம்','thimingilam','whale',80),word('கணவாய்','kanavaai','squid',100,['kanavai']),word('ஆமை','aamai','turtle',60,['amai','sea turtle'])] },
  { id: 'drinks', tamil: 'ஒரு பானத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a drink', answers: [word('தண்ணீர்','thanneer','water',20,['thannir','தண்ணீா்']),word('தேநீர்','theneer','tea',30,['thenir']),word('பால்','paal','milk',20,['pal']),word('காப்பி','kaapi','coffee',40,['kapi']),word('இளநீர்','ilaneer','coconut water',80,['ilanir','தென்னை இளநீர்']),word('மோர்','mor','buttermilk',70,['moar']),word('பனங்கற்கண்டு பால்','panangkarkandu paal','palm candy milk',100)] },
  { id: 'flowers', tamil: 'ஒரு பூவின் பெயரைச் சொல்லுங்கள்', english: 'Name a flower', answers: [word('மல்லிகை','malligai','jasmine',30,['mallikai']),word('ரோஜா','roja','rose',20),word('தாமரை','thaamarai','lotus',50,['thamarai']),word('செம்பருத்தி','sembaruthi','hibiscus',80,['semparuthi']),word('கனகாம்பரம்','kanakambaram','crossandra',100),word('அரளி','arali','oleander',90)] },
  { id: 'trees', tamil: 'ஒரு மரத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a tree', answers: [word('தென்னை','thennai','coconut palm',30,['coconut tree']),word('பனை','panai','palmyra palm',60,['palmyra','palm']),word('வேம்பு','vembu','neem',70),word('ஆலமரம்','aalamaram','banyan',80,['alamaram']),word('மாமரம்','maamaram','mango tree',40,['mamaram']),word('புளியமரம்','puliyamaram','tamarind tree',100,['tamarind'])] },
  { id: 'transport', tamil: 'ஒரு போக்குவரத்து வாகனத்தின் பெயரைச் சொல்லுங்கள்', english: 'Name a form of transport', answers: [word('பேருந்து','perunthu','bus',30,['perundhu','பஸ்']),word('ரயில்','rayil','train',40,['rail','புகையிரதம்']),word('மிதிவண்டி','mithivandi','bicycle',80,['bike','cycle','துவிச்சக்கரவண்டி']),word('படகு','padagu','boat',60,['padaku']),word('விமானம்','vimaanam','aeroplane',70,['vimanam','airplane','plane']),word('முச்சக்கரவண்டி','muchchakkaravandi','auto rickshaw',100,['tuk tuk','auto','rickshaw'])] },
  { id: 'body', tamil: 'ஓர் உடல் உறுப்பின் பெயரைச் சொல்லுங்கள்', english: 'Name a body part', answers: [word('கை','kai','hand',20),word('கால்','kaal','leg',20,['kal']),word('கண்','kan','eye',40),word('காது','kaadhu','ear',40,['kaathu']),word('மூக்கு','mookku','nose',50,['muku']),word('முழங்கை','muzhangai','elbow',100),word('தலை','thalai','head',30)] },
  { id: 'weather', tamil: 'வானிலையுடன் தொடர்புடைய ஒரு சொல்லைச் சொல்லுங்கள்', english: 'Name a word connected with weather', answers: [word('மழை','mazhai','rain',20,['malai']),word('வெயில்','veyil','sunshine',40,['sun']),word('காற்று','kaatru','wind',30,['katru']),word('மேகம்','megam','cloud',40,['clouds']),word('இடி','idi','thunder',70),word('மின்னல்','minnal','lightning',80),word('புயல்','puyal','storm',100)] },
  { id: 'instruments', tamil: 'ஓர் இசைக்கருவியின் பெயரைச் சொல்லுங்கள்', english: 'Name a musical instrument', answers: [word('வீணை','veenai','veena',50),word('புல்லாங்குழல்','pullanguzhal','flute',70),word('மிருதங்கம்','mridangam','mridangam',80,['miruthangam']),word('நாதஸ்வரம்','nadaswaram','nadaswaram',100,['நாதசுவரம்','nathaswaram']),word('பறை','parai','parai drum',60),word('தவில்','thavil','thavil',90,['tavil'])] },
  { id: 'numbers', tamil: 'ஒன்று முதல் பத்து வரை ஒரு எண்ணைச் சொல்லுங்கள்', english: 'Name a number from one to ten', answers: [word('ஒன்று','ondru','one',20,['onru','1']),word('இரண்டு','irandu','two',30,['rendu','2']),word('மூன்று','moondru','three',40,['munru','3']),word('நான்கு','naangu','four',50,['nangu','4']),word('ஐந்து','aindhu','five',60,['ainthu','5']),word('ஆறு','aaru','six',70,['aru','6']),word('ஏழு','ezhu','seven',100,['7']),word('எட்டு','ettu','eight',80,['8']),word('ஒன்பது','onbadhu','nine',90,['onpathu','9']),word('பத்து','pathu','ten',40,['patthu','10'])] },
];

export function normaliseDiveAnswer(text: string) {
  return text.normalize('NFC').toLocaleLowerCase('en').trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[-–—]/g, ' ').replace(/[.,!?"'’]/g, '').replace(/\s+/g, ' ');
}
export function scoreDiveAnswer(prompt: DivePrompt, text: string) {
  const input = normaliseDiveAnswer(text);
  if (!input) return null;
  return prompt.answers.find(a => [a.tamil,a.roman,a.english,...(a.aliases ?? [])].some(value => normaliseDiveAnswer(value) === input)) ?? null;
}
export function dailyDive(date = new Date()): DivePrompt[] {
  const day = Math.floor(date.getTime() / 86400000);
  const pool = [...DIVE_PROMPTS];
  let seed = day >>> 0;
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const a = pool[i], b = pool[j];
    if (a && b) { pool[i] = b; pool[j] = a; }
  }
  return pool.slice(0, DIVE_ROUNDS);
}
export function diveDepth(points: number) { return points * 10; }