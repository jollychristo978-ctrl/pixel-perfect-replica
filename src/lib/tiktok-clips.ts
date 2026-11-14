// Three creator clips used for Watch practice. Paste each TikTok video link into `url`.
export type TikTokClip = { id:string; title:[string,string]; prompt:[string,string]; url:string|null };
export const CREATOR = 'Gajaan';
export const TIKTOK_CLIPS:TikTokClip[] = [
  {id:'clip1', title:['Demo: Gajaan talks Tamil','முன்மாதிரி: கஜான்'], prompt:['Pick one phrase you hear and say it back','கேட்ட ஒரு சொற்றொடரைத் திரும்பச் சொல்லுங்கள்'], url:'https://www.tiktok.com/@gajaantalkstamil/video/7702572412210171139'},
  {id:'clip2', title:['Clip 2','காணொளி 2'], prompt:['Copy the tone of one line','ஒரு வரியின் தொனியைப் பின்பற்றுங்கள்'], url:null},
  {id:'clip3', title:['Clip 3','காணொளி 3'], prompt:['Explain the joke in simple Tamil','நகைச்சுவையை எளிய தமிழில் விளக்குங்கள்'], url:null},
];
export function tiktokVideoId(url:string|null){ return url?.match(/\/video\/(\d+)/)?.[1] ?? null; }
