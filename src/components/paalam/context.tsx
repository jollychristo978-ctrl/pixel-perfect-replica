import { createContext,useContext,useState,useEffect,type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
export type Translate = (en:string,ta:string)=>string;
const PaalamContext = createContext<{t:Translate; tamil:boolean; setTamil:(v:boolean)=>void; user:User|null; authReady:boolean}>({t:en=>en,tamil:false,setTamil:()=>{},user:null,authReady:false});
export function PaalamProvider({children,user,authReady}:{children:ReactNode;user:User|null;authReady:boolean}) {
 const [tamil,setTamilState]=useState(false);
 useEffect(()=>{setTamilState(localStorage.getItem('paalam-ui')==='ta')},[]);
 useEffect(()=>{document.documentElement.lang=tamil?'ta':'en'},[tamil]);
 const setTamil=(value:boolean)=>{setTamilState(value);localStorage.setItem('paalam-ui',value?'ta':'en')};
  return <PaalamContext.Provider value={{t:(en,ta)=>tamil?ta:en,tamil,setTamil,user,authReady}}>{children}</PaalamContext.Provider>;
}
export const usePaalam=()=>useContext(PaalamContext);
