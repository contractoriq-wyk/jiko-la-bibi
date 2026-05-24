import { useState, useMemo, useEffect, useContext, createContext } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

/* ═══ THEME SYSTEM ═══ */
const LIGHT = {
  bg:"#F0F4F8", bg2:"#FFFFFF", bg3:"#E8EEF6", bg4:"rgba(11,31,69,0.04)",
  text:"#0B1F45", dim:"rgba(11,31,69,0.6)", dim2:"rgba(11,31,69,0.35)",
  gold:"#B8860B", gold2:"#D4AF37", gr:"#1B7A20", rd:"#C62828", bl:"#1565C0", pu:"#7B1FA2",
  border:"rgba(11,31,69,0.12)", cardBg:"#FFFFFF",
  cardShadow:"0 2px 20px rgba(11,31,69,0.08)",
  cardBorder:"1px solid rgba(11,31,69,0.1)",
  header:"rgba(255,255,255,0.95)", tabBar:"#FFFFFF",
  pinBg:"linear-gradient(135deg,#0B1F45,#1565C0)",
  heroBg:"linear-gradient(135deg,#0B1F45,#1a3a6e)",
  inputBg:"#FFFFFF", inputColor:"#0B1F45",
};
const DARK = {
  bg:"#030B18", bg2:"#071428", bg3:"#0B1E3A", bg4:"rgba(255,255,255,0.04)",
  text:"#FFFFFF", dim:"rgba(255,255,255,0.6)", dim2:"rgba(255,255,255,0.3)",
  gold:"#D4AF37", gold2:"#FFD700", gr:"#00C851", rd:"#FF3D57", bl:"#2979FF", pu:"#CE93D8",
  border:"rgba(212,175,55,0.18)", cardBg:"rgba(255,255,255,0.04)",
  cardShadow:"0 8px 32px rgba(0,0,0,0.35)",
  cardBorder:"1px solid rgba(212,175,55,0.15)",
  header:"rgba(7,20,40,0.97)", tabBar:"rgba(7,20,40,0.95)",
  pinBg:"radial-gradient(ellipse at 30% 20%,#1a0a00,#030B18 60%)",
  heroBg:"linear-gradient(135deg,#0B1F45,#071428)",
  inputBg:"rgba(255,255,255,0.06)", inputColor:"#FFFFFF",
};
const ThemeCtx = createContext({t:LIGHT, dark:false, toggle:()=>{}});
const useT = () => useContext(ThemeCtx);
const fmt = n => "TZS " + Number(n||0).toLocaleString();
const pct = (a,b) => b ? Math.min(100,Math.round(a/b*100)) : 0;
const today = () => new Date().toISOString().split("T")[0];

/* ═══ SHARED UI ═══ */
function Card({children, style={}, glow=false}) {
  const {t,dark} = useT();
  return (
    <div style={{
      background: t.cardBg,
      border: glow ? "1px solid "+t.gold+"55" : t.cardBorder,
      borderRadius:16, marginBottom:10,
      boxShadow: glow ? "0 0 24px "+t.gold+"18, "+t.cardShadow : t.cardShadow,
      ...style
    }}>{children}</div>
  );
}
function Chip({label, value, color, icon}) {
  const {t} = useT();
  color = color || t.gold;
  return (
    <div style={{background:color+"14",border:"1px solid "+color+"30",borderRadius:12,padding:"11px 13px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:8,right:10,fontSize:16,opacity:0.15}}>{icon}</div>
      <div style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:color+"99",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:"19px",fontWeight:900,color}}>{value}</div>
    </div>
  );
}
function Bar({value, max, color, h=6}) {
  const {t} = useT();
  color = color || t.gold;
  return (
    <div style={{height:h,background:t.bg4,borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:pct(value,max)+"%",background:color,borderRadius:99,boxShadow:"0 0 6px "+color+"55",transition:"width 0.7s cubic-bezier(.4,0,.2,1)"}}/>
    </div>
  );
}
function Ring({label, current, goal, color, size=70}) {
  const {t} = useT();
  color = color || t.gold;
  const p = goal ? Math.min(100,pct(current,goal)) : 0;
  const r = size/2-7, circ = 2*Math.PI*r, over = goal && current >= goal;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",width:size,height:size,margin:"0 auto 5px"}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?t.gr:color} strokeWidth={over?8:6} strokeOpacity={0.12}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?t.gr:color} strokeWidth={over?8:6}
            strokeDasharray={p/100*circ+" "+circ} strokeLinecap="round"
            style={{filter:"drop-shadow(0 0 5px "+(over?t.gr:color)+"77)",transition:"stroke-dasharray 0.8s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:size>70?15:12,fontWeight:900,color:over?t.gr:color}}>{p}%</span>
        </div>
      </div>
      <div style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontFamily:"sans-serif",fontSize:"9px",color:over?t.gr:t.dim2,marginTop:1}}>{fmt(current)}</div>
    </div>
  );
}

/* ═══ PIE/DONUT CHART ═══ */
function Donut({data, size=140}) {
  const {t} = useT();
  const total = data.reduce((s,d)=>s+d.value,0);
  if(!total) return <p style={{textAlign:"center",color:t.dim2,fontFamily:"sans-serif",fontSize:11,padding:"1rem 0"}}>No data yet</p>;
  let angle = -Math.PI/2;
  const cx=size/2, cy=size/2, R=size/2-8, ir=R*0.52;
  const segs = data.filter(d=>d.value>0).map(d=>{
    const sa=angle, sw=(d.value/total)*2*Math.PI; angle+=sw;
    return {...d, sa, ea:angle, sw};
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
      <svg width={size} height={size} viewBox={"0 0 "+size+" "+size}>
        {segs.map((s,i)=>{
          if(s.sw<0.01) return null;
          const x1=cx+R*Math.cos(s.sa), y1=cy+R*Math.sin(s.sa);
          const x2=cx+R*Math.cos(s.ea), y2=cy+R*Math.sin(s.ea);
          const ix1=cx+ir*Math.cos(s.sa), iy1=cy+ir*Math.sin(s.sa);
          const ix2=cx+ir*Math.cos(s.ea), iy2=cy+ir*Math.sin(s.ea);
          const la=s.sw>Math.PI?1:0;
          const d="M"+x1+" "+y1+" A"+R+" "+R+" 0 "+la+" 1 "+x2+" "+y2+" L"+ix2+" "+iy2+" A"+ir+" "+ir+" 0 "+la+" 0 "+ix1+" "+iy1+" Z";
          return <path key={i} d={d} fill={s.color} stroke={t.bg2} strokeWidth={2}/>;
        })}
        <circle cx={cx} cy={cy} r={ir-2} fill={t.bg2}/>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {segs.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.text}}>{s.label}</div>
              <div style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2}}>{fmt(s.value)} · {Math.round(s.value/total*100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ THEME TOGGLE ═══ */
function ThemeToggle() {
  const {dark, toggle, t} = useT();
  return (
    <div onClick={toggle} style={{width:48,height:26,borderRadius:13,background:dark?t.gold:"rgba(11,31,69,0.15)",cursor:"pointer",position:"relative",transition:"background 0.3s",display:"flex",alignItems:"center",padding:"0 3px",flexShrink:0}}>
      <span style={{fontSize:13,userSelect:"none"}}>{dark?"🌙":"☀️"}</span>
      <div style={{width:20,height:20,borderRadius:"50%",background:dark?"#06132E":"white",position:"absolute",left:dark?25:3,transition:"left 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}/>
    </div>
  );
}

/* ═══ EDIT MODAL ═══ */
function EditModal({type, record, onSave, onDelete, onClose}) {
  const {t} = useT();
  const isSale = type==="sale";
  const [qty,setQty]    = useState(String(record.quantity||1));
  const [price,setPrice]= useState(String(record.unit_price||0));
  const [svc,setSvc]    = useState(record.service_type||"pickup");
  const [date,setDate]  = useState(record.sale_date||record.cost_date||today());
  const [desc,setDesc]  = useState(record.description||"");
  const [amount,setAmount]=useState(String(record.amount||0));
  const [cat,setCat]    = useState(record.category||"gas");
  const [spType,setSpType]=useState(record.spending_type||"daily");
  const [confirm,setConfirm]=useState(false);
  const inp = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:10};
  function doSave(){
    if(isSale){const q=parseInt(qty)||1;const up=parseInt(price)||0;onSave(record.id,{quantity:q,unit_price:up,total_price:up*q,service_type:svc,sale_date:date});}
    else onSave(record.id,{description:desc,amount:parseInt(amount)||0,category:cat,cost_date:date,spending_type:spType});
    onClose();
  }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.88)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 16px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.bg2,border:"1px solid "+t.border,borderRadius:"20px 20px 12px 12px",padding:"18px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 -20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>{isSale?"Edit Sale / Hariri Mauzo":"Edit Expense / Hariri Gharama"}</span>
          <button onClick={onClose} style={{background:t.bg4,border:"none",color:t.dim,borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {isSale?(
          <>
            <div style={{background:t.gold+"18",border:"1px solid "+t.gold+"44",borderRadius:10,padding:"8px 12px",marginBottom:10,color:t.gold,fontFamily:"sans-serif",fontSize:13,fontWeight:700}}>{record.item_name}</div>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Quantity / Idadi</label>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <button onClick={()=>setQty(q=>String(Math.max(1,parseInt(q)-1)))} style={{width:34,height:34,borderRadius:"50%",border:"1px solid "+t.border,background:t.bg4,color:t.text,fontWeight:900,fontSize:18,cursor:"pointer"}}>-</button>
              <input type="number" value={qty} onChange={e=>setQty(e.target.value)} style={{...inp,width:70,textAlign:"center",marginBottom:0}}/>
              <button onClick={()=>setQty(q=>String(parseInt(q)+1))} style={{width:34,height:34,borderRadius:"50%",border:"1px solid "+t.border,background:t.bg4,color:t.text,fontWeight:900,fontSize:18,cursor:"pointer"}}>+</button>
            </div>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Unit Price / Bei (TZS)</label>
            <input type="number" value={price} onChange={e=>setPrice(e.target.value)} style={inp}/>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:t.gold,marginBottom:10}}>Total: {fmt(parseInt(price||0)*parseInt(qty||1))}</div>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Service / Huduma</label>
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"1px solid "+(svc===k?t.gold:t.border),background:svc===k?t.gold+"18":"transparent",color:svc===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </>
        ):(
          <>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Description / Maelezo</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g. Mkaa 10kg" style={inp}/>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Amount / Kiasi (TZS)</label>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={inp}/>
            <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Category / Aina</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
              {[["gas","Gas/Gesi"],["staff","Staff/Wafanyakazi"],["ingredients","Ingredients/Malighafi"],["rent","Rent/Pango"],["bulk_ingredients","Bulk Ingredients"],["equipment","Equipment/Vifaa"],["marketing","Marketing"],["other","Other/Nyingine"]].map(([k,l])=>(
                <button key={k} onClick={()=>setCat(k)} style={{padding:"6px 8px",borderRadius:8,border:"1px solid "+(cat===k?t.gold:t.border),background:cat===k?t.gold+"18":"transparent",color:cat===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:cat===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["daily","Daily/Kila Siku"],["bulk","Bulk/Jumla"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSpType(k)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid "+(spType===k?t.bl:t.border),background:spType===k?t.bl+"18":"transparent",color:spType===k?t.bl:t.dim2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:spType===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </>
        )}
        <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,textTransform:"uppercase",marginBottom:5}}>Date / Tarehe</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,marginBottom:14}}/>
        <button onClick={doSave} style={{width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8}}>
          Save Changes / Hifadhi
        </button>
        {!confirm
          ?<button onClick={()=>setConfirm(true)} style={{width:"100%",background:t.rd+"14",color:t.rd,border:"1px solid "+t.rd+"44",borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Delete / Futa</button>
          :<div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onDelete(record.id);onClose();}} style={{flex:1,background:t.rd,color:"#fff",border:"none",borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Confirm Delete</button>
            <button onClick={()=>setConfirm(false)} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,cursor:"pointer"}}>Cancel</button>
          </div>
        }
      </div>
    </div>
  );
}

/* ═══ ROW COMPONENTS ═══ */
function SaleRow({sale, onEdit, i}) {
  const {t} = useT();
  return (
    <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:i%2===0?t.bg4:"transparent",borderRadius:8,marginBottom:3,gap:8}}>
      <div style={{flex:1}}>
        <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:t.text}}>{sale.item_name}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,marginLeft:5}}>x{sale.quantity}</span>
        {sale.sale_date!==today()&&<span style={{fontFamily:"sans-serif",fontSize:"9px",color:t.gold,marginLeft:5,background:t.gold+"18",borderRadius:4,padding:"1px 5px"}}>{sale.sale_date}</span>}
      </div>
      <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.gold}}>{fmt(sale.total_price)}</span>
      <button onClick={()=>onEdit(sale)} style={{background:t.gold+"18",border:"1px solid "+t.gold+"40",color:t.gold,borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"10px",cursor:"pointer",flexShrink:0}}>✏️</button>
    </div>
  );
}
function CostRow({cost, onEdit, i}) {
  const {t} = useT();
  const isBulk = cost.spending_type==="bulk";
  return (
    <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:i%2===0?t.bg4:"transparent",borderRadius:8,marginBottom:3,gap:8}}>
      <div style={{flex:1}}>
        <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:t.text}}>{cost.description}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,marginLeft:5}}>{cost.cost_date} · {cost.category}</span>
        {isBulk&&<span style={{fontFamily:"sans-serif",fontSize:"8px",fontWeight:700,color:t.bl,background:t.bl+"18",borderRadius:4,padding:"1px 5px",marginLeft:4}}>BULK</span>}
      </div>
      <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.rd}}>{fmt(cost.amount)}</span>
      <button onClick={()=>onEdit(cost)} style={{background:t.rd+"18",border:"1px solid "+t.rd+"40",color:t.rd,borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"10px",cursor:"pointer",flexShrink:0}}>✏️</button>
    </div>
  );
}

/* ═══ PIN GATE ═══ */
function PinGate({onAuth}) {
  const {t} = useT();
  const [pin,setPin]=useState(""), [err,setErr]=useState(false);
  const PAD=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  function tap(k){
    if(k==="")return; if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}
    const next=pin+k; setPin(next);
    if(next.length===4){if(next===(business.adminPin||"5566"))onAuth();else{setErr(true);setPin("");setTimeout(()=>setErr(false),1400);}}
  }
  return (
    <div style={{minHeight:"100vh",background:t.pinBg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <img src="/logo.png" alt="" width={88} height={88} style={{borderRadius:"50%",border:"3px solid "+t.gold,objectFit:"cover",marginBottom:"1rem",boxShadow:"0 0 28px "+t.gold+"44"}} onError={e=>e.target.style.display="none"}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:"#FFFFFF",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",fontFamily:"sans-serif",margin:"0 0 1.8rem",letterSpacing:"0.15em"}}>MSIMAMIZI · COMMAND CENTER</p>
      <div style={{display:"flex",gap:14,marginBottom:"1.4rem"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?t.gold:"rgba(255,255,255,0.15)",border:"2px solid "+(pin.length>i?t.gold:"rgba(255,255,255,0.2)"),transition:"all 0.15s"}}/>)}
      </div>
      {err&&<p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>Incorrect PIN / PIN si sahihi</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:14,fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":k==="⌫"?"rgba(255,100,100,0.15)":"rgba(255,255,255,0.1)",color:k==="⌫"?"#ff6b6b":"#FFFFFF",border:k===""?"none":"1px solid rgba(255,255,255,0.15)",cursor:k===""?"default":"pointer"}}>{k}</button>)}
      </div>
    </div>
  );
}

/* ═══ TAB 1: LEO ═══ */
function LeoTab({onGoTo}) {
  const {t} = useT();
  const {todaySales,todayGross,todayNet,todayOverhead,goals,updateSale,deleteSale} = useAdmin();
  const [editRec,setEditRec]=useState(null);
  const h=new Date().getHours();
  const alerts=[];
  if(todayGross===0&&h>9) alerts.push({c:t.rd,msg:"No sales yet today — is the menu ready? / Hakuna mauzo bado leo."});
  if(goals.daily&&todayGross>=goals.daily) alerts.push({c:t.gr,msg:"Daily goal reached! / Lengo la leo limefikiwa!"});
  if(todayOverhead>todayGross*0.5&&todayGross>0) alerts.push({c:t.rd,msg:"Expenses > 50% of revenue today / Gharama zaidi ya nusu ya mapato leo."});
  return (
    <div style={{padding:"1rem"}}>
      <div style={{background:t.heroBg,borderRadius:16,padding:"1.4rem",marginBottom:10,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,"+t.gold+","+t.gr+","+t.gold+")"}}/>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:"rgba(255,255,255,0.5)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"2px"}}>Mapato ya Leo / Today's Revenue</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"40px",fontWeight:900,color:t.gold,margin:0,lineHeight:1}}>{fmt(todayGross)}</p>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          {[[fmt(todayOverhead),t.rd,"Gharama/Costs"],[todayNet===null?"--":fmt(todayNet),todayNet!==null&&todayNet>=0?t.gr:t.rd,"Faida/Profit"],[todaySales.length,"#fff","Mauzo/Sales"]].map(([v,c,l])=>(
            <div key={l}><div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase"}}>{l}</div><div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:c}}>{v}</div></div>
          ))}
        </div>
      </div>
      {goals.daily>0&&(
        <Card style={{padding:"1rem",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <Ring label="Leo/Today" current={todayGross} goal={goals.daily} color={t.gold} size={80}/>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:900,color:t.gold}}>{fmt(goals.daily)}</div><div style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",marginTop:2}}>Daily Goal</div></div>
        </Card>
      )}
      {alerts.map((a,i)=><div key={i} style={{borderLeft:"3px solid "+a.c,background:a.c+"12",borderRadius:"0 10px 10px 0",padding:"8px 12px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:a.c,lineHeight:1.4}}>{a.msg}</div>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <button onClick={()=>onGoTo("ingiza")} style={{background:"linear-gradient(135deg,"+t.gr+",#009940)",color:"#fff",border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px "+t.gr+"44",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-plus"/>Record Sale / Mauzo
        </button>
        <button onClick={()=>onGoTo("ingiza")} style={{background:"linear-gradient(135deg,"+t.rd+",#a80018)",color:"#fff",border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px "+t.rd+"44",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-minus"/>Record Expense / Gharama
        </button>
      </div>
      {todaySales.length>0&&(
        <Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Today's Sales / Mauzo ya Leo ({todaySales.length}) — Tap ✏️ to edit</p>
          {todaySales.slice(0,15).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={setEditRec} i={i}/>)}
        </Card>
      )}
      {editRec&&<EditModal type="sale" record={editRec} onSave={updateSale} onDelete={deleteSale} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 2: INGIZA ═══ */
function IngizaTab() {
  const {t} = useT();
  const {prices,recordSale,recordCost,allCosts,deleteCost,updateCost} = useAdmin();
  const [mode,setMode]=useState("sale");
  const [date,setDate]=useState(today());
  const [sec,setSec]=useState(sections[0].id);
  const [item,setItem]=useState(null);
  const [qty,setQty]=useState(1);
  const [svc,setSvc]=useState("pickup");
  const [saleBusy,setSaleBusy]=useState(false);
  const [saleOk,setSaleOk]=useState(false);
  const [costType,setCostType]=useState("daily");
  const [cat,setCat]=useState("gas");
  const [desc,setDesc]=useState("");
  const [amount,setAmount]=useState("");
  const [costBusy,setCostBusy]=useState(false);
  const [costOk,setCostOk]=useState(false);
  const [editRec,setEditRec]=useState(null);
  const secItems=menu.filter(m=>m.section===sec);
  const isToday=date===today();
  const recentCosts=allCosts.filter(c=>c.cost_date===date).slice(0,10);
  const DCATS=[{k:"gas",l:"Gas/Gesi"},{k:"staff",l:"Staff/Wafanyakazi"},{k:"ingredients",l:"Ingredients/Malighafi"},{k:"rent",l:"Rent/Pango"},{k:"other",l:"Other/Nyingine"}];
  const BCATS=[{k:"bulk_ingredients",l:"Bulk Ingredients"},{k:"equipment",l:"Equipment/Vifaa"},{k:"marketing",l:"Marketing"},{k:"bulk_other",l:"Other Bulk"}];
  const inp = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  async function doSale(){if(!item||saleBusy)return;setSaleBusy(true);await recordSale(item,qty,svc,date);setItem(null);setQty(1);setSaleBusy(false);setSaleOk(true);setTimeout(()=>setSaleOk(false),2000);}
  async function doCost(){if(!amount||costBusy)return;setCostBusy(true);await recordCost(cat,desc,amount,date,costType);setAmount("");setDesc("");setCostBusy(false);setCostOk(true);setTimeout(()=>setCostOk(false),2000);}
  return (
    <div style={{padding:"1rem"}}>
      <Card glow={!isToday} style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:isToday?t.gr:t.gold,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>{isToday?"Today / Leo":"Past Date / Tarehe Iliyopita"}</p>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,border:"2px solid "+(isToday?t.gr:t.gold),fontWeight:700,fontSize:14,marginBottom:0}}/>
        {!isToday&&<p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.gold,marginTop:5,marginBottom:0}}>Entering data for: {date}</p>}
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"10px 0"}}>
        <button onClick={()=>setMode("sale")} style={{padding:12,borderRadius:12,border:"2px solid "+(mode==="sale"?t.gr:t.border),background:mode==="sale"?t.gr+"18":"transparent",color:mode==="sale"?t.gr:t.dim2,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Sales / Mauzo</button>
        <button onClick={()=>setMode("cost")} style={{padding:12,borderRadius:12,border:"2px solid "+(mode==="cost"?t.rd:t.border),background:mode==="cost"?t.rd+"18":"transparent",color:mode==="cost"?t.rd:t.dim2,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Expense / Gharama</button>
      </div>
      {mode==="sale"&&(
        <Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Select Item / Chagua Bidhaa</p>
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10,scrollbarWidth:"none",paddingBottom:2}}>
            {sections.map(s=><button key={s.id} onClick={()=>{setSec(s.id);setItem(null);}} style={{background:sec===s.id?t.gr+"18":"transparent",color:sec===s.id?t.gr:t.dim2,border:"1px solid "+(sec===s.id?t.gr:t.border),borderRadius:99,padding:"4px 10px",whiteSpace:"nowrap",fontFamily:"sans-serif",fontSize:"10px",fontWeight:sec===s.id?700:400,cursor:"pointer",flexShrink:0}}>{s.name.sw.split(" ")[0]}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:10}}>
            {secItems.map(it=>{
              const up=prices[it.id]??it.price??(it.sizes?it.sizes[0].price:0); const sel=item?.id===it.id;
              return <button key={it.id} onClick={()=>setItem(it)} style={{background:sel?t.gr+"18":t.bg4,color:sel?t.gr:t.text,border:"1.5px solid "+(sel?t.gr:t.border),borderRadius:10,padding:9,textAlign:"left",cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{fontSize:18,marginBottom:2}}>{it.emoji}</div>
                <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,lineHeight:1.2}}>{it.name.sw}</div>
                <div style={{fontFamily:"sans-serif",fontSize:"10px",color:sel?t.gr+"aa":t.dim2,marginTop:2}}>{fmt(up)}</div>
              </button>;
            })}
          </div>
          {item&&<div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim2,fontWeight:700}}>Qty:</span>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:34,height:34,borderRadius:"50%",border:"1px solid "+t.border,background:t.bg4,color:t.text,fontWeight:900,fontSize:16,cursor:"pointer"}}>-</button>
              <span style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:t.text,minWidth:"28px",textAlign:"center"}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{width:34,height:34,borderRadius:"50%",border:"1px solid "+t.border,background:t.bg4,color:t.text,fontWeight:900,fontSize:16,cursor:"pointer"}}>+</button>
              <span style={{marginLeft:"auto",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:t.gold}}>{fmt((prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0))*qty)}</span>
            </div>
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=><button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:"1px solid "+(svc===k?t.gold:t.border),background:svc===k?t.gold+"18":"transparent",color:svc===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>)}
            </div>
            <button onClick={doSale} disabled={saleBusy} style={{width:"100%",background:saleOk?"linear-gradient(135deg,"+t.gr+",#009940)":saleBusy?t.bg4:"linear-gradient(135deg,"+t.gr+",#009940)",color:saleBusy?t.dim2:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:saleBusy?"default":"pointer",transition:"all 0.3s"}}>
              {saleOk?"✓ Saved! / Imehifadhiwa!":saleBusy?"Saving...":"SAVE — "+item.name.sw+" x"+qty}
            </button>
          </div>}
        </Card>
      )}
      {mode==="cost"&&(
        <Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Record Expense / Ingiza Matumizi</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            <button onClick={()=>{setCostType("daily");setCat("gas");}} style={{padding:10,borderRadius:10,border:"1.5px solid "+(costType==="daily"?t.bl:t.border),background:costType==="daily"?t.bl+"15":"transparent",color:costType==="daily"?t.bl:t.dim2,fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Daily / Kila Siku</button>
            <button onClick={()=>{setCostType("bulk");setCat("bulk_ingredients");}} style={{padding:10,borderRadius:10,border:"1.5px solid "+(costType==="bulk"?t.pu:t.border),background:costType==="bulk"?t.pu+"15":"transparent",color:costType==="bulk"?t.pu:t.dim2,fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Bulk / Jumla</button>
          </div>
          <div style={{background:t.bg4,borderRadius:8,padding:"6px 10px",marginBottom:10,fontFamily:"sans-serif",fontSize:"10px",color:t.dim2}}>
            {costType==="daily"?"Daily costs: gas, staff wages, small ingredients, rent.":"One-time bulk: large ingredient orders, equipment, marketing."}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {(costType==="daily"?DCATS:BCATS).map(c=><button key={c.k} onClick={()=>setCat(c.k)} style={{padding:"7px 8px",borderRadius:8,border:"1px solid "+(cat===c.k?t.gold:t.border),background:cat===c.k?t.gold+"18":"transparent",color:cat===c.k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:cat===c.k?700:400,cursor:"pointer"}}>{c.l}</button>)}
          </div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description / Maelezo (e.g. Mkaa 10kg)" style={{...inp,marginBottom:8}}/>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount / Kiasi (TZS)" style={{...inp,marginBottom:10}}/>
          <button onClick={doCost} disabled={costBusy||!amount} style={{width:"100%",background:costOk?"linear-gradient(135deg,"+t.gr+",#009940)":!amount?t.bg4:"linear-gradient(135deg,"+t.rd+",#a80018)",color:!amount?t.dim2:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:!amount?"default":"pointer",transition:"all 0.3s"}}>
            {costOk?"✓ Saved!":costBusy?"Saving...":"SAVE EXPENSE / HIFADHI GHARAMA"}
          </button>
        </Card>
      )}
      {recentCosts.length>0&&<Card style={{padding:"1rem",marginTop:10}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Expenses for {date} — Tap ✏️ to edit</p>
        {recentCosts.map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={setEditRec} i={i}/>)}
      </Card>}
      {editRec&&<EditModal type="cost" record={editRec} onSave={updateCost} onDelete={deleteCost} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 3: RIPOTI ═══ */
function RipodiTab() {
  const {t} = useT();
  const {allSales,allCosts,itemCosts,fetchRange,loading,goals,updateSale,deleteSale,updateCost,deleteCost} = useAdmin();
  const [range,setRange]=useState("today");
  const [cStart,setCStart]=useState(today());
  const [cEnd,setCEnd]=useState(today());
  const [fetched,setFetched]=useState(false);
  const [editRec,setEditRec]=useState(null);
  const [editType,setEditType]=useState("sale");
  function getRangeDates(){
    const T2=new Date();const fmt=d=>d.toISOString().split("T")[0];
    if(range==="today")return{start:today(),end:today()};
    if(range==="yesterday"){const y=new Date(T2);y.setDate(y.getDate()-1);return{start:fmt(y),end:fmt(y)};}
    if(range==="last7"){const s=new Date(T2);s.setDate(s.getDate()-6);return{start:fmt(s),end:fmt(T2)};}
    if(range==="month"){const s=new Date(T2.getFullYear(),T2.getMonth(),1);return{start:fmt(s),end:fmt(T2)};}
    return{start:cStart,end:cEnd};
  }
  const {start,end}=getRangeDates();
  const sales=allSales.filter(s=>s.sale_date>=start&&s.sale_date<=end);
  const costs=allCosts.filter(c=>c.cost_date>=start&&c.cost_date<=end);
  const gross=sales.reduce((s,r)=>s+r.total_price,0);
  const overhead=costs.reduce((s,c)=>s+c.amount,0);
  const itemCostTotal=sales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0);
  const net=gross-itemCostTotal-overhead;
  const dailyCosts=costs.filter(c=>!c.spending_type||c.spending_type==="daily");
  const bulkCosts=costs.filter(c=>c.spending_type==="bulk");
  const byDate=useMemo(()=>{const m={};sales.forEach(s=>{if(!m[s.sale_date])m[s.sale_date]={gross:0,count:0};m[s.sale_date].gross+=s.total_price;m[s.sale_date].count+=s.quantity;});return Object.entries(m).sort(([a],[b])=>b.localeCompare(a));},[sales]);
  const wkGoal=range==="last7"&&goals.weekly?goals.weekly:null;
  const moGoal=range==="month"&&goals.monthly?goals.monthly:null;
  const inp={flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"};
  async function doFetch(){await fetchRange(start,end);setFetched(true);}
  function sendWA(){
    const lines=["RIPOTI — "+start+(start!==end?" hadi "+end:""),"Mapato Ghafi: "+fmt(gross),"Daily Costs: "+fmt(dailyCosts.reduce((s,c)=>s+c.amount,0)),"Bulk Purchases: "+fmt(bulkCosts.reduce((s,c)=>s+c.amount,0)),"Faida Halisi: "+fmt(net),"Mauzo: "+sales.length,"","Unyamwezini Jiko La Bibi JJJ"].join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(lines),"_blank");
  }
  return (
    <div style={{padding:"1rem"}}>
      <Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Period / Kipindi</p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:range==="custom"?8:0}}>
          {[["today","Leo"],["yesterday","Jana"],["last7","Wiki 7"],["month","Mwezi"],["custom","Chagua"]].map(([k,l])=><button key={k} onClick={()=>{setRange(k);setFetched(false);}} style={{padding:"5px 11px",borderRadius:99,border:"1px solid "+(range===k?t.gold:t.border),background:range===k?t.gold+"18":"transparent",color:range===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:range===k?700:400,cursor:"pointer"}}>{l}</button>)}
        </div>
        {range==="custom"&&<div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
          <input type="date" value={cStart} onChange={e=>setCStart(e.target.value)} style={inp}/>
          <span style={{color:t.dim2,fontSize:"11px"}}>—</span>
          <input type="date" value={cEnd} onChange={e=>setCEnd(e.target.value)} style={inp}/>
        </div>}
        <button onClick={doFetch} disabled={loading} style={{marginTop:8,width:"100%",background:t.gold,color:"#fff",border:"none",borderRadius:10,padding:"9px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px "+t.gold+"44"}}>
          {loading?"Loading...":"Get Report / Pata Ripoti"}
        </button>
      </Card>
      {(fetched||range==="today")&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <Chip label="Mapato Ghafi" value={fmt(gross)} color={t.gold} icon="💰"/>
          <Chip label="Faida Halisi" value={fmt(net)} color={net>=0?t.gr:t.rd} icon={net>=0?"📈":"📉"}/>
          <Chip label="Gharama Yote" value={fmt(overhead)} color={t.rd} icon="💸"/>
          <Chip label="Mauzo" value={sales.length} color={t.bl} icon="🧾"/>
        </div>
        {wkGoal&&<Card style={{padding:"1rem"}}><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>Weekly Goal</p><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text,fontWeight:700}}>Lengo la Wiki</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.gold}}>{fmt(gross)} / {fmt(wkGoal)}</span></div><Bar value={gross} max={wkGoal} color={t.bl}/></Card>}
        {moGoal&&<Card style={{padding:"1rem"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text,fontWeight:700}}>Lengo la Mwezi</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.gold}}>{fmt(gross)} / {fmt(moGoal)}</span></div><Bar value={gross} max={moGoal} color={t.gr}/></Card>}
        {sales.length>0&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Sales / Mauzo ({sales.length}) — Tap ✏️ to edit</p>
          {sales.slice(0,20).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={r=>{setEditRec(r);setEditType("sale");}} i={i}/>)}
        </Card>}
        {costs.length>0&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Expenses / Gharama ({costs.length}) — Tap ✏️ to edit</p>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text}}>Daily / Kila Siku</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.bl}}>{fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text}}>Bulk / Jumla</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.pu}}>{fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}</span></div>
          {costs.slice(0,15).map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={r=>{setEditRec(r);setEditType("cost");}} i={i}/>)}
        </Card>}
        {byDate.length>1&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>By Day / Kwa Siku</p>
          {byDate.map(([d,v])=><div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+t.border+"66"}}><span style={{fontFamily:"sans-serif",fontSize:"12px",color:t.text}}>{d}</span><div style={{textAlign:"right"}}><span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:t.gold}}>{fmt(v.gross)}</span><span style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,marginLeft:6}}>{v.count}</span></div></div>)}
        </Card>}
        <button onClick={sendWA} style={{width:"100%",background:"rgba(37,211,102,0.12)",color:"#25d366",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Send Report / Tuma Ripoti — WhatsApp</button>
      </>}
      {editRec&&<EditModal type={editType} record={editRec} onSave={editType==="sale"?updateSale:updateCost} onDelete={editType==="sale"?deleteSale:deleteCost} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 4: MALENGO ═══ */
function MalengoTab() {
  const {t} = useT();
  const {goals,setGoal,todayGross,allSales} = useAdmin();
  const [dv,setDv]=useState(String(goals.daily||""));
  const [wv,setWv]=useState(String(goals.weekly||""));
  const [mv,setMv]=useState(String(goals.monthly||""));
  const [saved,setSaved]=useState(false);
  const ws=new Date();ws.setDate(ws.getDate()-ws.getDay());
  const ms=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkG=allSales.filter(s=>s.sale_date>=ws.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);
  const moG=allSales.filter(s=>s.sale_date>=ms.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);
  function save(){if(dv)setGoal("daily",dv);if(wv)setGoal("weekly",wv);if(mv)setGoal("monthly",mv);setSaved(true);setTimeout(()=>setSaved(false),2000);}
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:"2px solid ",background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{padding:"1rem"}}>
      {(goals.daily||goals.weekly||goals.monthly)>0&&<Card glow style={{padding:"1.4rem",marginBottom:10}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 16px"}}>Current Progress / Maendeleo ya Sasa</p>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {goals.daily>0&&<Ring label="Leo/Today" current={todayGross} goal={goals.daily} color={t.gold} size={82}/>}
          {goals.weekly>0&&<Ring label="Wiki/Week" current={wkG} goal={goals.weekly} color={t.bl} size={82}/>}
          {goals.monthly>0&&<Ring label="Mwezi/Month" current={moG} goal={goals.monthly} color={t.gr} size={82}/>}
        </div>
      </Card>}
      <Card style={{padding:"1.2rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 16px"}}>Set Goals / Weka Malengo</p>
        {[[t.gold,"Daily Goal / Lengo la Kila Siku",dv,setDv],[t.bl,"Weekly Goal / Lengo la Wiki",wv,setWv],[t.gr,"Monthly Goal / Lengo la Mwezi",mv,setMv]].map(([color,label,val,setter])=><div key={label} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:color}}/><label style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color}}>{label}</label></div>
          <input type="number" value={val} onChange={e=>setter(e.target.value)} placeholder="0" style={{...inp,borderColor:color+"44"}}/>
          {val&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color,margin:"3px 0 0",opacity:0.8}}>{fmt(val)}</p>}
        </div>)}
        <button onClick={save} style={{width:"100%",background:saved?"linear-gradient(135deg,"+t.gr+",#009940)":"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.3s"}}>
          {saved?"✓ Saved! / Imehifadhiwa!":"Save Goals / Hifadhi Malengo"}
        </button>
      </Card>
    </div>
  );
}

/* ═══ TAB 5: AKILI ═══ */
function AkiliTab() {
  const {t} = useT();
  const {allSales,allCosts,itemCosts,fetchRange} = useAdmin();
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{if(!loaded){fetchRange(new Date(Date.now()-30*86400000).toISOString().split("T")[0],today());setLoaded(true);}},[]);
  const s30=allSales.filter(s=>s.sale_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const c30=allCosts.filter(c=>c.cost_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const gross=s30.reduce((s,r)=>s+r.total_price,0);
  const costs=c30.reduce((s,c)=>s+c.amount,0);
  const net=gross-costs;
  const margin=gross?Math.round(net/gross*100):0;
  const itemStats=useMemo(()=>{const m={};s30.forEach(s=>{if(!m[s.item_id])m[s.item_id]={id:s.item_id,name:s.item_name,qty:0,rev:0,cost:0};m[s.item_id].qty+=s.quantity;m[s.item_id].rev+=s.total_price;m[s.item_id].cost+=(itemCosts[s.item_id]||0)*s.quantity;});return Object.values(m).map(i=>({...i,profit:i.rev-i.cost,margin:i.rev?Math.round((i.rev-i.cost)/i.rev*100):0})).sort((a,b)=>b.rev-a.rev);},[s30,itemCosts]);
  const svcMap=useMemo(()=>{const m={pickup:0,delivery:0,dinein:0};s30.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});return m;},[s30]);
  const costMap=useMemo(()=>{const m={};c30.forEach(c=>{m[c.category]=(m[c.category]||0)+c.amount;});return m;},[c30]);
  const PALETTE=[t.gold,t.bl,t.gr,t.rd,t.pu,"#FF9800","#00BCD4","#8BC34A"];
  const svcData=[{label:"Pickup/Kuchukua",value:svcMap.pickup,color:t.bl},{label:"Delivery",value:svcMap.delivery,color:t.gr},{label:"Dine-in/Kula Hapa",value:svcMap.dinein,color:t.pu}].filter(d=>d.value>0);
  const costData=Object.entries(costMap).map(([k,v],i)=>({label:k,value:v,color:PALETTE[i%PALETTE.length]}));
  const health=Math.min(100,Math.max(0,50+(margin/100*30)+(itemStats.length>5?10:0)+(gross>500000?10:0)));
  const hc=health>=70?t.gr:health>=40?t.gold:t.rd;
  const insights=[];
  itemStats.filter(i=>i.margin<0&&i.qty>0).slice(0,2).forEach(i=>insights.push({c:"danger",msg:i.name+" is losing money (margin "+i.margin+"%). Raise price or stop selling."}));
  itemStats.filter(i=>i.margin>40&&i.qty>3).slice(0,2).forEach(i=>insights.push({c:"good",msg:i.name+" is your star product ("+i.margin+"% margin). Promote it more!"}));
  if(costs>gross*0.6&&gross>0)insights.push({c:"warn",msg:"Expenses are "+Math.round(costs/gross*100)+"% of revenue. Reduce costs to increase profit."});
  if(!Object.keys(itemCosts).length)insights.push({c:"info",msg:"Set item cooking costs in Menu tab to see true profit margins."});
  return (
    <div style={{padding:"1rem"}}>
      <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Analytics / Uchambuzi — Last 30 Days</p>
      <Card glow style={{padding:"1.2rem",display:"flex",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:68,height:68,flexShrink:0}}>
          <svg width={68} height={68} style={{transform:"rotate(-90deg)"}}>
            <circle cx={34} cy={34} r={26} fill="none" stroke={hc} strokeWidth={7} strokeOpacity={0.12}/>
            <circle cx={34} cy={34} r={26} fill="none" stroke={hc} strokeWidth={7} strokeDasharray={health*1.63+" 163"} strokeLinecap="round" style={{filter:"drop-shadow(0 0 6px "+hc+"66)"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:900,color:hc}}>{Math.round(health)}</span></div>
        </div>
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Business Health / Afya ya Biashara</p>
          <p style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:900,color:hc,margin:"0 0 2px"}}>{health>=70?"Excellent / Nzuri Sana":health>=40?"Average / Wastani":"At Risk / Hatarini"}</p>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,margin:0}}>Gross: {fmt(gross)} · Net: {fmt(net)} · Margin: {margin}%</p>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"10px 0"}}>
        <Chip label="Mapato Ghafi" value={fmt(gross)} color={t.gold} icon="💰"/>
        <Chip label="Faida Halisi" value={fmt(net)} color={net>=0?t.gr:t.rd} icon="📊"/>
        <Chip label="Margin %" value={margin+"%"} color={margin>25?t.gr:margin>0?t.gold:t.rd} icon="🎯"/>
        <Chip label="Mauzo/Sales" value={s30.length} color={t.bl} icon="🧾"/>
      </div>
      {svcData.length>0&&<Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Service Mix / Aina ya Huduma</p>
        <Donut data={svcData} size={140}/>
      </Card>}
      {costData.length>0&&<Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Cost Breakdown / Gharama kwa Aina</p>
        <Donut data={costData} size={140}/>
      </Card>}
      {itemStats.length>0&&<Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Top Items / Bidhaa Bora</p>
        {itemStats.slice(0,5).map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:i===0?t.gold:t.dim2,width:18,flexShrink:0}}>{i+1}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.text,marginBottom:3}}>{item.name}</div>
            <Bar value={item.rev} max={itemStats[0].rev} color={i===0?t.gold:t.bl} h={5}/>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.text}}>{fmt(item.rev)}</div>
            {item.margin!==0&&<span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:item.margin>0?t.gr:t.rd}}>{item.margin}%</span>}
          </div>
        </div>)}
      </Card>}
      {insights.length>0&&<div>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Business Insights / Ushauri</p>
        {insights.map((ins,i)=><div key={i} style={{background:ins.c==="good"?t.gr+"12":ins.c==="danger"?t.rd+"12":ins.c==="warn"?t.gold+"12":t.bl+"12",borderLeft:"3px solid "+(ins.c==="good"?t.gr:ins.c==="danger"?t.rd:ins.c==="warn"?t.gold:t.bl),borderRadius:"0 10px 10px 0",padding:"9px 13px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:t.text,lineHeight:1.5}}>{ins.msg}</div>)}
      </div>}
    </div>
  );
}

/* ═══ MENU TAB ═══ */
function MenuTab() {
  const {t} = useT();
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost} = useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [ced,setCed]=useState(null);const [cv,setCv]=useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=><div key={sec.id} style={{marginBottom:14}}>
        <div style={{background:t.gold,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"#fff",color:t.gold,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
          <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#fff"}}>{sec.name.sw}</span>
        </div>
        <div style={{border:"1px solid "+t.border,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:t.bg2}}>
          {menu.filter(m=>m.section===sec.id).map((item,i)=>{
            const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0); const cost=itemCosts[item.id]; const oos=!!stock[item.id];
            return <div key={item.id} style={{padding:"10px 14px",background:i%2===0?t.bg4:"transparent",borderTop:i>0?"1px solid "+t.border+"55":"none",opacity:oos?0.5:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{item.emoji}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>{oos&&<span style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,fontWeight:700}}>IMEISHA</span>}</div>
                {ed===item.id?<div style={{display:"flex",gap:4}}>
                  <input type="number" value={val} onChange={e=>setVal(e.target.value)} autoFocus style={{width:72,padding:"4px 6px",borderRadius:6,border:"2px solid "+t.gold,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"}}/>
                  <button onClick={()=>{overridePrice(item.id,parseInt(val));setEd(null);}} style={{background:t.gr,color:"#fff",border:"none",borderRadius:6,padding:"4px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>OK</button>
                  <button onClick={()=>setEd(null)} style={{background:t.bg4,color:t.dim2,border:"none",borderRadius:6,padding:"4px 7px",fontSize:12,cursor:"pointer"}}>✕</button>
                </div>:<button onClick={()=>{setEd(item.id);setVal(String(cur));}} style={{background:t.gold+"18",border:"1px solid "+t.gold+"44",borderRadius:6,padding:"3px 9px",fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:prices[item.id]!==undefined?t.gr:t.gold,cursor:"pointer"}}>{fmt(cur)}</button>}
                <button onClick={()=>toggleStock(item.id)} style={{background:oos?t.rd+"20":t.gr+"15",color:oos?t.rd:t.gr,border:"1px solid "+(oos?t.rd:t.gr)+"44",borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA":"IPO"}</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26,marginTop:4}}>
                <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>Cost/unit:</span>
                {ced===item.id?<div style={{display:"flex",gap:4}}>
                  <input type="number" value={cv} onChange={e=>setCv(e.target.value)} autoFocus placeholder="0" style={{width:62,padding:"2px 6px",borderRadius:4,border:"1px solid "+t.gold,background:t.inputBg,fontFamily:"sans-serif",fontSize:11,color:t.inputColor,outline:"none"}}/>
                  <button onClick={()=>{setCost(item.id,parseInt(cv));setCed(null);}} style={{background:t.gr,color:"#fff",border:"none",borderRadius:4,padding:"2px 7px",fontSize:11,cursor:"pointer",fontWeight:700}}>OK</button>
                </div>:<button onClick={()=>{setCed(item.id);setCv(String(cost||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:10,color:cost?t.gr:t.dim2,cursor:"pointer",padding:0}}>{cost?fmt(cost):"Set cost"}</button>}
              </div>
            </div>;
          })}
        </div>
      </div>)}
    </div>
  );
}

/* ═══ ORDERS TAB ═══ */
function MaagizoTab() {
  const {t} = useT();
  const {orders,addOrder,updateOrderStatus} = useAdmin();
  const [show,setShow]=useState(false);
  const [f,setF]=useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  const td=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
  const inp={width:"100%",padding:"9px 11px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Leo/All" value={td.length} color={t.gold} icon="📋"/>
        <Chip label="Pending" value={td.filter(o=>o.status==="pending").length} color={t.rd} icon="⏳"/>
        <Chip label="Done" value={td.filter(o=>o.status==="done").length} color={t.gr} icon="✅"/>
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:t.gold,color:"#fff",border:"none",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10,boxShadow:"0 4px 16px "+t.gold+"44"}}>
        {show?"✕ Close / Funga":"+ New Order / Agizo Jipya"}
      </button>
      {show&&<Card style={{padding:"1rem",marginBottom:10}}>
        {[["customer","Name / Jina *",""],["phone","Phone / Simu","07xx"],["items","Items / Chakula *","Pilau x2"],["total","Total (TZS)","10000"]].map(([k,l,p])=><div key={k} style={{marginBottom:8}}><label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:t.dim2,marginBottom:3,textTransform:"uppercase"}}>{l}</label><input value={f[k]} onChange={set(k)} placeholder={p} style={inp}/></div>)}
        <select value={f.service} onChange={set("service")} style={{...inp,marginBottom:10}}>
          <option value="pickup">Pickup / Kuchukua</option><option value="delivery">Delivery</option><option value="dinein">Dine-in / Kula Hapa</option><option value="events">Events / Sherehe</option>
        </select>
        <button onClick={save} style={{width:"100%",background:t.gr,color:"#fff",border:"none",borderRadius:10,padding:11,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>Save / Hifadhi</button>
      </Card>}
      {td.map(o=><Card key={o.id} style={{padding:"12px 14px",borderLeft:"3px solid "+(o.status==="done"?t.gr:t.gold),opacity:o.status==="done"?0.65:1,display:"flex",gap:8,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{o.customer}</div>
          <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,marginTop:1}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})} · {o.service}{o.phone?" · "+o.phone:""}</div>
          <div style={{fontFamily:"sans-serif",fontSize:12,color:t.dim,marginTop:4}}>{o.items}</div>
          {o.total>0&&<div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.gold,marginTop:4}}>{fmt(o.total)}</div>}
        </div>
        <button onClick={()=>updateOrderStatus(o.id,o.status==="done"?"pending":"done")} style={{background:o.status==="done"?t.bg4:t.gr,color:o.status==="done"?t.dim2:"#fff",border:"none",borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>
          {o.status==="done"?"✓ Done":"Done / Maliza"}
        </button>
      </Card>)}
      {td.length===0&&<p style={{textAlign:"center",padding:"2rem",color:t.dim2,fontFamily:"sans-serif",fontSize:13}}>No orders yet / Hakuna maagizo leo.</p>}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function AdminPage({onExit}) {
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
  const [dark,setDark]=useState(()=>localStorage.getItem("jiko-theme")==="dark");
  function toggle(){const nd=!dark;setDark(nd);localStorage.setItem("jiko-theme",nd?"dark":"light");}
  const t = dark ? DARK : LIGHT;
  const TABS=[
    {key:"leo",    icon:"ti-home",            label:"Leo",     sub:"Today"},
    {key:"ingiza", icon:"ti-plus",            label:"Ingiza",  sub:"Input"},
    {key:"ripoti", icon:"ti-chart-bar",       label:"Ripoti",  sub:"Reports"},
    {key:"malengo",icon:"ti-target",          label:"Malengo", sub:"Goals"},
    {key:"akili",  icon:"ti-brain",           label:"Akili",   sub:"Analytics"},
    {key:"menu",   icon:"ti-tools-kitchen-2", label:"Menyu",   sub:"Menu"},
    {key:"maagizo",icon:"ti-clipboard-list",  label:"Maagizo", sub:"Orders"},
  ];
  if(!authed) return (
    <ThemeCtx.Provider value={{t,dark,toggle}}>
      <PinGate onAuth={()=>setAuthed(true)}/>
    </ThemeCtx.Provider>
  );
  return (
    <ThemeCtx.Provider value={{t,dark,toggle}}>
      <div style={{minHeight:"100vh",background:t.bg,paddingBottom:80}}>
        <div style={{background:t.header,borderBottom:"1px solid "+t.border,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,backdropFilter:"blur(12px)"}}>
          <button onClick={onExit} style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,display:"flex",alignItems:"center",gap:5}}><i className="ti ti-arrow-left"/> Back</button>
          <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>Msimamizi 🔐</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <ThemeToggle/>
            <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>Exit</button>
          </div>
        </div>
        <div style={{background:t.tabBar,borderBottom:"1px solid "+t.border,display:"flex",overflowX:"auto",scrollbarWidth:"none",position:"sticky",top:48,zIndex:39}}>
          {TABS.map(tb=><button key={tb.key} onClick={()=>setTab(tb.key)} style={{flex:"0 0 auto",padding:"8px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:tab===tb.key?"2px solid "+t.gold:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
            <i className={"ti "+tb.icon} style={{fontSize:17,color:tab===tb.key?t.gold:t.dim2}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"8px",fontWeight:700,color:tab===tb.key?t.gold:t.dim2,whiteSpace:"nowrap"}}>{tb.label}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"7px",color:tab===tb.key?t.gold+"88":t.dim2+"66",whiteSpace:"nowrap"}}>{tb.sub}</span>
          </button>)}
        </div>
        {tab==="leo"    &&<LeoTab onGoTo={setTab}/>}
        {tab==="ingiza" &&<IngizaTab/>}
        {tab==="ripoti" &&<RipodiTab/>}
        {tab==="malengo"&&<MalengoTab/>}
        {tab==="akili"  &&<AkiliTab/>}
        {tab==="menu"   &&<MenuTab/>}
        {tab==="maagizo"&&<MaagizoTab/>}
      </div>
    </ThemeCtx.Provider>
  );
}
