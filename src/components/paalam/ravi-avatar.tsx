import closed from '@/assets/ravi-closed.jpg';
import open from '@/assets/ravi-open.jpg';
export function RaviAvatar({talking=false,bounce=false}:{talking?:boolean;bounce?:boolean}){
 return <div className={`ravi-avatar ${bounce?'ravi-bounce':''}`}><img src={closed} width={512} height={512} alt="Ravi Anna, an original illustrated tutor with sunglasses"/><img src={open} width={512} height={512} alt="" aria-hidden className={talking?'ravi-mouth visible':'ravi-mouth'}/><span className="ravi-label">AI character</span></div>;
}