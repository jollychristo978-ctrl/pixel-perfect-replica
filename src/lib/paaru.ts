// Features adapted from the Paaru concept: level check, passport stamps, word-gated clips.
export type PlacementQ = { tamil:string; roman:string; opts:string[]; c:number };
export const PLACEMENT:PlacementQ[] = [
  {tamil:'வணக்கம்', roman:'vanakkam', opts:['Hello','Water','Home','Tomorrow'], c:0},
  {tamil:'தண்ணி', roman:'thanni', opts:['Food','Water','Shop','Rain'], c:1},
  {tamil:'எப்படி இருக்கீங்க?', roman:'eppadi irukkeenga?', opts:['Where are you going?','Did you eat?','How are you?','What is your name?'], c:2},
  {tamil:'சாப்பிட்டீங்களா?', roman:'saappitteengalaa?', opts:['Did you eat?','How are you?','Are you coming?','Is it hot?'], c:0},
  {tamil:'நான் வீட்டுக்கு போறேன்', roman:'naan veettukku poren', opts:["I'm going to the shop","I am at home","I'm going home","I want water"], c:2},
  {tamil:'நாளைக்கு மழை வரும்', roman:'naalaikku mazhai varum', opts:['It rained yesterday','It will rain tomorrow','It is hot today','I will come tomorrow'], c:1},
  {tamil:'நீ எங்க போற?', roman:'nee enga pora?', opts:['What is your name?','Where are you going?','Where is the shop?','Did you eat?'], c:1},
];
/** The check stops after two misses, like Paaru. */
export const MAX_MISSES = 2;
export function placementDone(answered:number, misses:number){ return misses>=MAX_MISSES || answered>=PLACEMENT.length; }
export function placementLevel(correct:number):'new'|'beginner'|'intermediate' { return correct<=1?'new':correct<=4?'beginner':'intermediate'; }

export type Stamp = { id:string; label:[string,string]; words:number; emoji:string };
export const STAMPS:Stamp[] = [
  {id:'coffee', label:['Filter coffee','ஃபில்டர் காபி'], words:10, emoji:'☕'},
  {id:'marina', label:['Marina Beach','மெரினா கடற்கரை'], words:50, emoji:'🏖️'},
  {id:'jasmine', label:['Jasmine garland','மல்லிகை மாலை'], words:150, emoji:'🌼'},
  {id:'meenakshi', label:['Meenakshi Temple','மீனாட்சி கோவில்'], words:500, emoji:'🛕'},
  {id:'nallur', label:['Nallur Temple','நல்லூர் கோவில்'], words:1000, emoji:'🏯'},
];
export function earnedStamps(words:number){ return STAMPS.filter(s=>words>=s.words); }
