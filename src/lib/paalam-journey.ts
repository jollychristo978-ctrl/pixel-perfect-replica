export const JOURNEY = [
  {id:'watch', number:1, label:['Watch','பார்'], subtitle:['Learn from short clips and scenes','குறுகிய காணொளிகள் மற்றும் காட்சிகளில் இருந்து கற்றுக்கொள்ளுங்கள்'], links:[
    {to:'/quest', label:['Clip Quest','கிளிப் தேடல்'], copy:['Turn a clip into a Tamil lesson','காணொளியைத் தமிழ்ப் பாடமாக மாற்றுங்கள்']},
    {to:'/tiktok', label:['TikTok practice','டிக்டாக் பயிற்சி'], copy:['Three creator clips to copy','பின்பற்ற மூன்று காணொளிகள்']},
    {to:'/cinema', label:['Cinema','சினிமா'], copy:['Act your Tamil movie scene','உங்கள் தமிழ்த் திரைப்படக் காட்சியில் நடியுங்கள்']},
  ]},
  {id:'practise', number:2, label:['Practise','பயிற்சி'], subtitle:['Speak it back and earn XP','திரும்பச் சொல்லி XP பெறுங்கள்'], links:[
    {to:'/level-check', label:['Level check','நிலைச் சோதனை'], copy:['Find your starting level','உங்கள் தொடக்க நிலையைக் கண்டறியுங்கள்']},
    {to:'/paati', label:['Paati Says','பாட்டி சொல்கிறார்'], copy:['Quick-fire spoken challenges','விரைவான பேச்சுச் சவால்கள்']},
    {to:'/practice', label:['AI Partner','AI துணை'], copy:['Practise for your next call','உங்கள் அடுத்த அழைப்புக்குப் பயிற்சி செய்யுங்கள்']},
    {to:'/scenes', label:['Scenes','காட்சிகள்'], copy:['Tamil role-play in Sri Lanka','இலங்கைச் சூழல்களில் தமிழ்ப் பயிற்சி']},
    {to:'/bridge', label:['Bridge XP','பாலம் XP'], copy:['Your XP builds London to Jaffna','உங்கள் XP லண்டன் முதல் யாழ்ப்பாணம் வரை பாலம் கட்டுகிறது']},
  ]},
  {id:'connect', number:3, label:['Connect','இணை'], subtitle:['Unlock real calls with Sri Lanka','இலங்கையுடன் நிஜ அழைப்புகளைத் திறக்குங்கள்'], links:[
    {to:'/calls', label:['Sri Lanka calls','இலங்கை அழைப்புகள்'], copy:['Book a call in both time zones','இரு நேர மண்டலங்களிலும் அழைப்பை முன்பதிவு செய்யுங்கள்']},
    {to:'/impact', label:['Impact','தாக்கம்'], copy:['See the difference your learning makes','உங்கள் கற்றலின் தாக்கத்தைப் பாருங்கள்']},
  ]},
] as const;

export function journeyStep(pathname:string) {
  return JOURNEY.find(step=>step.links.some(link=>pathname===link.to))?.id ?? 'watch';
}

// Journey nudge only: existing server-side booking and safeguarding logic stays unchanged.
export const FIRST_CALL_XP = 200;
export function callProgress(xp:number) {
  return {unlocked:xp>=FIRST_CALL_XP, remaining:Math.max(0,FIRST_CALL_XP-xp)};
}