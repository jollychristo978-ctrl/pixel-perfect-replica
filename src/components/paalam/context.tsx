import { createContext,useContext,useState,useEffect,type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
export type Translate = (en:string,ta:string)=>string;
const PaalamContext = createContext<{t:Translate; tamil:boolean; setTamil:(v:boolean)=>void; user:User|null}>({t:en=>en,tamil:false,setTamil:()=>{},user:null});
export function PaalamProvider({children,user}:{children:ReactNode;user:User|null}) {
 const [tamil,setTamilState]=useState(false);
 useEffect(()=>{setTamilState(localStorage.getItem('paalam-ui')==='ta')},[]);
 useEffect(()=>{document.documentElement.lang=tamil?'ta':'en'},[tamil]);
 const setTamil=(value:boolean)=>{setTamilState(value);localStorage.setItem('paalam-ui',value?'ta':'en')};
 return <PaalamContext.Provider value={{t:(en,ta)=>tamil?ta:en,tamil,setTamil,user}}>{children}</PaalamContext.Provider>;
}
export const usePaalam=()=>useContext(PaalamContext);
