import { useState, useMemo, useEffect, useContext, createContext, useRef } from "react";
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
// Presenter Mode: replaces real digits with bullets so demos never reveal actual business numbers
const maskMoney = (n, presenterMode) => presenterMode ? "TZS •••,•••" : fmt(n);
const goalColor = (current, goal, t) => {
  if(!goal || goal<=0) return t.gold;
  const p = current/goal;
  if(p>=0.9) return t.gr;
  if(p>=0.5) return t.gold;
  return t.rd;
};
const pct = (a,b) => b ? Math.min(100,Math.round(a/b*100)) : 0;
function dateStrET(d = new Date()) { return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); }
const today = () => dateStrET();
// Bump the month number after each future upload (e.g. Agosti 2026 => "V2.6-8").
// Fomu: V{toleo kuu}.{tarakimu ya mwisho ya mwaka}-{namba ya mwezi} · tarehe na saa ya kutengeneza
const APP_VERSION = "V4.0-9 · 22 Nov 2026, blue scroll";
// Label used for a built-in section in the section dropdown / custom items (e.g. "Vinywaji Baridi / Cold Drinks")
// Ready-made drink sections (always shown in Menyu so items can be added straight into them)
const SEC_BIA = "Bia / Beer / Lager";
const SEC_POMBE = "Pombe Kali / Alcohol & Spirits";
const SEC_SPECIALS = "Bidhaa Mpya / Specials";
// Photo picker: choose a picture from the phone, shrink it, upload to Supabase Storage (bucket "menu-photos"), return its public URL
function PhotoPicker({value,onChange,t}){
  const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");const inp=useRef(null);
  async function pick(e){
    const file=e.target.files&&e.target.files[0]; e.target.value=""; if(!file)return;
    setBusy(true);setMsg("");
    try{
      const bmp=await createImageBitmap(file);
      const max=900,k=Math.min(1,max/Math.max(bmp.width,bmp.height));
      const cv=document.createElement("canvas");cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);
      cv.getContext("2d").drawImage(bmp,0,0,cv.width,cv.height);
      const blob=await new Promise(r=>cv.toBlob(r,"image/jpeg",0.82));
      const {supabase}=await import("../lib/supabase");
      if(!supabase)throw new Error("no-supabase");
      const path="item-"+Date.now()+"-"+Math.random().toString(36).slice(2,7)+".jpg";
      const {error}=await supabase.storage.from("menu-photos").upload(path,blob,{contentType:"image/jpeg",upsert:false});
      if(error)throw error;
      const {data}=supabase.storage.from("menu-photos").getPublicUrl(path);
      onChange(data.publicUrl);setMsg("✓ Picha imepakiwa / Uploaded");
    }catch(err){ console.warn("Photo upload failed:",err); setMsg("✗ Imeshindikana / Failed — hakikisha SQL ya picha imeendeshwa (migration_photo_storage.sql)"); }
    setBusy(false);
  }
  return <div style={{marginBottom:8}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {value?<img src={value} alt="" style={{width:54,height:54,objectFit:"cover",borderRadius:8,border:"1px solid "+t.border,flexShrink:0}}/>:<div style={{width:54,height:54,borderRadius:8,border:"1px dashed "+t.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:t.dim2,flexShrink:0}}>📷</div>}
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
        <button type="button" onClick={()=>inp.current&&inp.current.click()} disabled={busy} style={{background:t.gold+"18",border:"1px solid "+t.gold+"55",color:t.gold,borderRadius:8,padding:"8px 10px",fontSize:12,fontWeight:700,cursor:busy?"default":"pointer"}}>{busy?"Inapakia… / Uploading…":(value?"📷 Badilisha Picha / Change photo":"📷 Pakia Picha / Upload photo")}</button>
        {value&&!busy&&<button type="button" onClick={()=>{onChange("");setMsg("");}} style={{background:"none",border:"none",color:t.dim2,fontSize:10,textDecoration:"underline",cursor:"pointer",padding:0,textAlign:"left"}}>Ondoa picha / Remove photo</button>}
      </div>
    </div>
    <input ref={inp} type="file" accept="image/*" onChange={pick} style={{display:"none"}}/>
    {msg&&<p style={{fontFamily:"sans-serif",fontSize:10,color:msg.startsWith("✓")?t.gr:t.rd,margin:"5px 0 0"}}>{msg}</p>}
  </div>;
}
// Small round thumbnail for a custom item: its photo if it has one, otherwise its emoji
const ItemThumb = ({it,size=26}) => it.ph ? <img src={it.ph} alt="" style={{width:size+10,height:size+10,objectFit:"cover",borderRadius:8,flexShrink:0}}/> : <span style={{fontSize:size-8}}>{it.em||"🍽️"}</span>;

// Menu layout helpers — anything not yet placed by the owner keeps its natural order, after the ones that were placed
const secOrderOf = (ms,key,i) => (ms && ms[key] && ms[key].sort_order!=null) ? ms[key].sort_order : 1000+i;
const posOf = (mo,id,i) => (mo && mo[id]!=null) ? mo[id] : 1000+i;
const secLabel = s => s.name.sw + " / " + s.name.en;
// Apply Msimamizi edits (rename / emoji) on top of a built-in menu item
const withEdit = (m, edits) => { const e = edits && edits[m.id]; return e ? {...m, name:{sw:e.sw||m.name.sw, en:e.en||m.name.en}, emoji:e.em||m.emoji} : m; };

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
function Ring({label, current, goal, color, size=70, showGoal=false}) {
  const {t, presenterMode} = useT();
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
      {!presenterMode && (
        <div style={{fontFamily:"sans-serif",fontSize:"9px",color:over?t.gr:t.dim2,marginTop:1}}>
          {fmt(current)}{showGoal && goal>0 && <span style={{color:t.dim2}}> / {fmt(goal)}</span>}
        </div>
      )}
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
    <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
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

/* ═══ ICON BADGE (avatar for feature cards) ═══ */
function IconBadge({emoji, color}) {
  const {t} = useT();
  color = color || t.gold;
  return (
    <div style={{
      width:30, height:30, borderRadius:"50%", flexShrink:0,
      background: color+"18", border:"1.5px solid "+color+"44",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:15, boxShadow:"0 2px 8px "+color+"22",
    }}>{emoji}</div>
  );
}

// Reusable "how many to show" pill selector — used on every ranked list (Top Items,
// Slow-Moving, Stock Forecast, Margin Advisor) so the pattern is consistent everywhere.
function CountSelector({value, onChange, options=[5,10,20,"All"], total}) {
  const {t} = useT();
  return (
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {options.filter(opt=>opt==="All"||!total||opt<=total||opt===Math.min(...options.filter(o=>typeof o==="number"))).map(opt=>(
        <button key={opt} onClick={()=>onChange(opt)} style={{padding:"3px 10px",borderRadius:99,border:"1px solid "+(value===opt?t.gold:t.border),background:value===opt?t.gold+"18":"transparent",color:value===opt?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:value===opt?700:400,cursor:"pointer"}}>{opt}</button>
      ))}
    </div>
  );
}

/* ═══ INTERACTIVE TREND CHART (drag to scrub) ═══ */
function TrendChart({data, textColor, dimColor, bgColor, borderColor}) {
  const {t} = useT();
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  const W = 300, H = 100, padTop = 10, padBottom = 18;
  const maxRev = Math.max(...data.map(d=>d.rev), 1);
  const avg = data.reduce((s,d)=>s+d.rev,0) / Math.max(data.length,1);

  function statusColor(rev){
    if(avg<=0) return t.gold;
    if(rev >= avg*1.1) return t.gr;
    if(rev <= avg*0.85) return t.rd;
    return t.gold;
  }
  function statusOf(rev){
    if(avg<=0) return "neutral";
    if(rev >= avg*1.1) return "good";
    if(rev <= avg*0.85) return "bad";
    return "neutral";
  }

  function idxFromClientX(clientX) {
    const rect = svgRef.current.getBoundingClientRect();
    const relX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = relX / rect.width;
    return Math.round(ratio * (data.length - 1));
  }
  function handleMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setHoverIdx(idxFromClientX(clientX));
  }
  function handleEnd() { setHoverIdx(null); }

  const pts = data.map((d,i) => {
    const x = (i/(data.length-1)) * W;
    const y = H - padBottom - (d.rev/maxRev) * (H - padTop - padBottom);
    return {x, y, ...d, color: statusColor(d.rev), status: statusOf(d.rev)};
  });
  const active = hoverIdx !== null ? pts[hoverIdx] : null;

  return (
    <div style={{position:"relative", touchAction:"none"}}>
      <svg
        ref={svgRef}
        width="100%" height={H} viewBox={"0 0 "+W+" "+H}
        preserveAspectRatio="none"
        style={{overflow:"visible", cursor:"pointer", userSelect:"none"}}
        onMouseMove={handleMove}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchStart={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Average reference line */}
        <line x1={0} y1={H-padBottom-(avg/maxRev)*(H-padTop-padBottom)} x2={W} y2={H-padBottom-(avg/maxRev)*(H-padTop-padBottom)} stroke={dimColor} strokeWidth="1" strokeDasharray="2,3" opacity="0.4"/>
        {/* Per-segment colored area + line, colored by the ending point's performance vs average */}
        {pts.slice(1).map((p,i)=>{
          const prev = pts[i];
          const segColor = p.color;
          const areaPts = prev.x+","+(H-padBottom)+" "+prev.x+","+prev.y+" "+p.x+","+p.y+" "+p.x+","+(H-padBottom);
          return (
            <g key={i}>
              <polygon points={areaPts} fill={segColor} opacity="0.10"/>
              <line x1={prev.x} y1={prev.y} x2={p.x} y2={p.y} stroke={segColor} strokeWidth="2.2" strokeLinecap="round"/>
            </g>
          );
        })}
        {pts.map((p,i)=>{
          if(i%5!==0 && i!==pts.length-1) return null;
          return <circle key={i} cx={p.x} cy={p.y} r="2.8" fill={p.color}/>;
        })}
        {active && (
          <>
            <line x1={active.x} y1={padTop-4} x2={active.x} y2={H-padBottom} stroke={active.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
            <circle cx={active.x} cy={active.y} r="4.5" fill={active.color} stroke={bgColor} strokeWidth="2"/>
          </>
        )}
      </svg>
      {active && (
        <div style={{
          position:"absolute",
          left: Math.min(Math.max(active.x/W*100, 12), 88)+"%",
          top: -8,
          transform: "translate(-50%, -100%)",
          background: bgColor, border:"1px solid "+active.color, borderRadius:8,
          padding:"6px 10px", whiteSpace:"nowrap", pointerEvents:"none",
          boxShadow:"0 4px 14px rgba(0,0,0,0.25)", zIndex:5,
        }}>
          <div style={{fontFamily:"sans-serif", fontSize:9, color:dimColor, textTransform:"uppercase"}}>{active.label}</div>
          <div style={{fontFamily:"Georgia,serif", fontSize:13, fontWeight:900, color:active.color}}>{fmt(active.rev)}</div>
        </div>
      )}
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:6}}>
        <span style={{fontSize:9,color:dimColor,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr,display:"inline-block"}}/>Juu/Above</span>
        <span style={{fontSize:9,color:dimColor,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gold,display:"inline-block"}}/>Wastani/Avg</span>
        <span style={{fontSize:9,color:dimColor,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.rd,display:"inline-block"}}/>Chini/Below</span>
      </div>
    </div>
  );
}

/* ═══ THEME TOGGLE ═══ */
function ThemeToggle() {
  const {dark, toggle, t} = useT();
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px",whiteSpace:"nowrap"}}>{dark?"Giza":"Mchana"}</span>
      <div onClick={toggle} style={{width:48,height:26,borderRadius:13,background:dark?t.gold:"rgba(11,31,69,0.15)",cursor:"pointer",position:"relative",transition:"background 0.3s",display:"flex",alignItems:"center",padding:"0 3px",flexShrink:0}}>
        <span style={{fontSize:13,userSelect:"none"}}>{dark?"🌙":"☀️"}</span>
        <div style={{width:20,height:20,borderRadius:"50%",background:dark?"#06132E":"white",position:"absolute",left:dark?25:3,transition:"left 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}/>
      </div>
    </div>
  );
}

/* ═══ STAFF COST VIEW TOGGLE — shared between Akili & Ripoti ═══ */
function StaffCostToggle({includeStaffCosts, onToggle}) {
  const {t} = useT();
  return (
    <Card style={{padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
        <IconBadge emoji={includeStaffCosts?"👥":"🏭"} color={includeStaffCosts?t.bl:t.gr}/>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.text}}>{includeStaffCosts?"Na Wafanyakazi":"Bila Wafanyakazi"}</div>
          <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>{includeStaffCosts?"With Staff Payments":"Without Staff Payments"}</div>
        </div>
      </div>
      <div onClick={onToggle} style={{width:52,height:28,borderRadius:14,background:includeStaffCosts?t.bl:t.gr,cursor:"pointer",position:"relative",transition:"background 0.3s",flexShrink:0,padding:"0 3px",display:"flex",alignItems:"center"}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:"#fff",position:"absolute",left:includeStaffCosts?3:27,transition:"left 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{includeStaffCosts?"👥":"🏭"}</div>
      </div>
    </Card>
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
              {[["gas","Gas/Gesi"],["staff","Staff/Wafanyakazi"],["ingredients","Ingredients/Malighafi"],["rent","Rent/Pango"],["bulk_ingredients","Bulk Ingredients"],["bulk_cold_drinks","Cold Drinks/Baridi"],["bulk_beer","Beer/Bia"],["bulk_spirits","Gin & Spirits"],["equipment","Equipment/Vifaa"],["marketing","Marketing"],["other","Other/Nyingine"]].map(([k,l])=>(
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
        <span style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,marginLeft:5}}>{cost.cost_date} · {COST_CAT_LABEL[cost.category]||cost.category}</span>
        {isBulk&&<span style={{fontFamily:"sans-serif",fontSize:"8px",fontWeight:700,color:t.bl,background:t.bl+"18",borderRadius:4,padding:"1px 5px",marginLeft:4}}>BULK</span>}
      </div>
      <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.rd}}>{fmt(cost.amount)}</span>
      <button onClick={()=>onEdit(cost)} style={{background:t.rd+"18",border:"1px solid "+t.rd+"40",color:t.rd,borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"10px",cursor:"pointer",flexShrink:0}}>✏️</button>
    </div>
  );
}

/* ═══ PIN GATE ═══ */
/* ═══ EXPENSE CATEGORY LABELS (shared by the Input tab, edit window, lists and reports) ═══ */
const BEV_CATS=[
  {k:"bulk_cold_drinks",l:"🥤 Cold Drinks / Vinywaji Baridi"},
  {k:"bulk_beer",l:"🍺 Beer / Bia"},
  {k:"bulk_spirits",l:"🥃 Gin & Spirits / Pombe Kali"},
];
// Chakula vs Vinywaji — classify a sale as food / soft (non-alcoholic) / beer / spirits
const SOFT_IDS=new Set(["chai-maziwa","chai-rangi"]);
const BEER_RE=/\b(bia|beer|lager|safari|kilimanjaro|serengeti|tusker|castle|balimi|ndovu|heineken|guinness|windhoek)\b/i;
const SPIRIT_RE=/(pombe kali|spirit|alcohol|gin\b|konyagi|whisky|whiskey|vodka|rum\b|brandy|wine|mvinyo|valeur|k-vant|kvant|chubby|smirnoff|jameson|amarula)/i;
const SOFT_RE=/(vinywaji|cold drink|soda|juice|maji|water|chai|tea|kahawa|coffee|maziwa)/i;
function classifyItem(itemId,sectionId,itemName,customMap){
  if(SOFT_IDS.has(itemId)) return "soft";
  const sec=customMap[itemId]||"";
  const hay=sec+" "+(sectionId||"");
  if(BEER_RE.test(sec)) return "beer";
  if(SPIRIT_RE.test(sec)) return "spirits";
  if(sectionId==="vinywaji") return "soft";
  if(sec && SOFT_RE.test(sec)) return "soft";
  if(!sec && !["vitafunwa","mchele","standard","pilau","specials","jioni"].includes(sectionId)){
    const n=itemName||"";
    if(SPIRIT_RE.test(n)) return "spirits";
    if(BEER_RE.test(n)) return "beer";
    if(SOFT_RE.test(n)) return "soft";
  }
  return "food";
}
const CLS_META={food:{l:"🍛 Chakula / Food"},soft:{l:"🥤 Visivyo na Pombe / Non-alcoholic"},beer:{l:"🍺 Bia / Beer"},spirits:{l:"🥃 Pombe Kali / Gin & Spirits"}};
const COST_CAT_LABEL={
  gas:"Gas/Gesi",staff:"Staff/Wafanyakazi",ingredients:"Ingredients/Malighafi",bulk_ingredients:"Bulk Ingredients",
  rent:"Rent/Pango",equipment:"Equipment/Vifaa",marketing:"Marketing",other:"Nyingine/Other",bulk_other:"Other Bulk",
  bulk_cold_drinks:"Cold Drinks/Vinywaji Baridi",bulk_beer:"Beer/Bia",bulk_spirits:"Gin & Spirits/Pombe Kali",
  matengenezo:"Matengenezo/Maintenance",
};

/* ═══ STAFF LOGIN (Supabase Auth) ═══ */
// The 4-digit PIN signs in to one shared Supabase account; the real check happens on Supabase's server.
const OWNER_LOGIN_EMAIL="msimamizi@jikolabibijjj.com";
const OWNER_PW_PREFIX="jiko-bibi-";
function LoginGate({onPin}) {
  const {t} = useT();
  const {signIn} = useAdmin();
  const [email,setEmail]=useState(()=>{try{return localStorage.getItem("jiko-login-email")||"";}catch{return "";}});
  const [pw,setPw]=useState(""); const [show,setShow]=useState(false);
  const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  async function go(e){
    e&&e.preventDefault();
    if(!email.trim()||!pw||busy) return;
    setBusy(true);setErr("");
    const {error}=await signIn(email,pw);
    if(error){
      const m=String(error.message||"");
      setErr(/invalid login/i.test(m)?"Barua pepe au nywila si sahihi / Wrong email or password":/network|fetch/i.test(m)?"Hakuna mtandao / No connection — jaribu tena":"Imeshindikana / Could not sign in: "+m);
      setBusy(false);
    } else { try{localStorage.setItem("jiko-login-email",email.trim());}catch{} }
  }
  const field={width:"100%",padding:"13px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:16,outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"};
  return (
    <div style={{minHeight:"100vh",background:t.pinBg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <img src="/shield.webp" alt="" width={104} height={117} style={{objectFit:"contain",marginBottom:"1rem",filter:"drop-shadow(0 0 18px "+t.gold+"55)"}} onError={e=>{e.target.src="/logo.png";e.target.style.borderRadius="50%";e.target.width=88;e.target.height=88;}}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:"#FFFFFF",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",fontFamily:"sans-serif",margin:"0 0 1.6rem",letterSpacing:"0.15em"}}>MSIMAMIZI · INGIA / SIGN IN</p>
      <form onSubmit={go} style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
        <input type="email" autoComplete="username" inputMode="email" autoCapitalize="none" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Barua pepe / Email" style={field}/>
        <div style={{position:"relative"}}>
          <input type={show?"text":"password"} autoComplete="current-password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Nywila / Password" style={{...field,paddingRight:64}}/>
          <button type="button" onClick={()=>setShow(v=>!v)} style={{position:"absolute",right:8,top:8,bottom:8,background:"none",border:"none",color:t.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{show?"Ficha":"Onyesha"}</button>
        </div>
        {err&&<p style={{color:"#ff8a8a",fontFamily:"sans-serif",fontSize:13,margin:0,textAlign:"center"}}>{err}</p>}
        <button type="submit" disabled={busy||!email.trim()||!pw} style={{marginTop:4,padding:14,borderRadius:12,border:"none",background:(busy||!email.trim()||!pw)?"rgba(255,255,255,0.15)":"linear-gradient(135deg,"+t.gold+",#b8860b)",color:(busy||!email.trim()||!pw)?"rgba(255,255,255,0.5)":"#0B1F45",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"sans-serif"}}>{busy?"Inaingia… / Signing in…":"Ingia / Sign in"}</button>
      </form>
      {onPin&&<button onClick={onPin} style={{marginTop:14,background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"sans-serif",textDecoration:"underline",cursor:"pointer"}}>← Tumia PIN / Use PIN</button>}
      <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,fontFamily:"sans-serif",margin:"1.4rem 0 0",textAlign:"center",maxWidth:300}}>Utaingia mara moja tu kwenye simu hii. / You only sign in once on this phone.</p>
    </div>
  );
}

function PinGate({onAuth,check,onEmail}) {
  const {t} = useT();
  const [pin,setPin]=useState(""), [err,setErr]=useState(false), [busy,setBusy]=useState(false);
  const PAD=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  function tap(k){
    if(k==="")return; if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}
    if(busy||pin.length>=4) return;
    const next=pin+k; setPin(next);
    if(next.length===4){
      if(check){
        setBusy(true);
        check(next).then(ok=>{ if(!ok){setErr(true);setPin("");setTimeout(()=>setErr(false),1400);} setBusy(false); });
      } else if(next===(business.adminPin||"5566"))onAuth();
      else{setErr(true);setPin("");setTimeout(()=>setErr(false),1400);}
    }
  }
  return (
    <div style={{minHeight:"100vh",background:t.pinBg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <img src="/shield.webp" alt="" width={104} height={117} style={{objectFit:"contain",marginBottom:"1rem",filter:"drop-shadow(0 0 18px "+t.gold+"55)"}} onError={e=>{e.target.src="/logo.png";e.target.style.borderRadius="50%";e.target.width=88;e.target.height=88;}}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:"#FFFFFF",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",fontFamily:"sans-serif",margin:"0 0 1.8rem",letterSpacing:"0.15em"}}>MSIMAMIZI · COMMAND CENTER</p>
      <div style={{display:"flex",gap:14,marginBottom:"1.4rem"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?t.gold:"rgba(255,255,255,0.15)",border:"2px solid "+(pin.length>i?t.gold:"rgba(255,255,255,0.2)"),transition:"all 0.15s"}}/>)}
      </div>
      {err&&<p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>Incorrect PIN / PIN si sahihi</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:14,fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":k==="⌫"?"rgba(255,100,100,0.15)":"rgba(255,255,255,0.1)",color:k==="⌫"?"#ff6b6b":"#FFFFFF",border:k===""?"none":"1px solid rgba(255,255,255,0.15)",cursor:k===""?"default":"pointer"}}>{k}</button>)}
      </div>
      {onEmail&&<button onClick={onEmail} style={{marginTop:22,background:"none",border:"none",color:"rgba(255,255,255,0.45)",fontSize:12,fontFamily:"sans-serif",textDecoration:"underline",cursor:"pointer"}}>Ingia kwa barua pepe / Sign in with email</button>}
    </div>
  );
}

/* ═══ DAILY WHATSAPP SUMMARY ═══ */
function buildDailyReportText(daySales, gross, overhead, net, dateLabel, dayCosts, mix) {
  const dateStr = dateLabel || new Date().toLocaleDateString("sw-TZ", {day:"numeric", month:"long", year:"numeric", timeZone:"America/New_York"});
  const itemMap = {};
  daySales.forEach(s => {
    if (!itemMap[s.item_name]) itemMap[s.item_name] = {qty:0, rev:0};
    itemMap[s.item_name].qty += s.quantity;
    itemMap[s.item_name].rev += s.total_price;
  });
  const top = Object.entries(itemMap).sort((a,b)=>b[1].rev-a[1].rev).slice(0,3);
  const topLines = top.map(([name,d],i)=>`${i+1}. ${name} — x${d.qty} (${fmt(d.rev)})`).join("\n");

  // Cost breakdown — shows WHERE the money went, so a negative balance is never a mystery
  let costLines = "";
  if (dayCosts && dayCosts.length > 0) {
    const catMap = {};
    dayCosts.forEach(c => {
      const label = (c.description && c.description.trim()) || c.category || "Nyingine";
      catMap[label] = (catMap[label]||0) + c.amount;
    });
    const sorted = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
    costLines = sorted.map(([label,amt])=>`   • ${label}: ${fmt(amt)}`).join("\n");
  }

  return [
    `📊 *RIPOTI — ${dateStr}*`,
    ``,
    `💰 Mapato Ghafi: ${fmt(gross)}`,
    `💸 Gharama: ${fmt(overhead)}`,
    net !== null ? `📈 Faida Halisi: ${fmt(net)}` : ``,
    `🧾 Idadi ya Mauzo: ${daySales.length}`,
    ``,
    mix && mix.total>0 ? `🍽️ *Chakula vs Vinywaji / Food vs Beverages:*` : ``,
    mix && mix.total>0 ? `   🍛 Chakula/Food: ${fmt(mix.m.food.rev)} (${Math.round(mix.m.food.rev/mix.total*100)}%)` : ``,
    mix && mix.total>0 ? `   🥂 Vinywaji/Beverages: ${fmt(mix.bev)} (${Math.round(mix.bev/mix.total*100)}%)` : ``,
    mix && mix.total>0 && mix.bev>0 ? `      🥤 Bila Pombe/Non-alc: ${fmt(mix.soft)}` : ``,
    mix && mix.total>0 && mix.bev>0 ? `      🍺 Bia/Beer: ${fmt(mix.m.beer.rev)}` : ``,
    mix && mix.total>0 && mix.bev>0 ? `      🥃 Pombe Kali/Spirits: ${fmt(mix.m.spirits.rev)}` : ``,
    mix && mix.total>0 ? `` : ``,
    costLines ? `💸 *Chanzo cha Gharama / Cost Breakdown:*` : ``,
    costLines,
    ``,
    top.length > 0 ? `⭐ *Bidhaa Bora:*` : ``,
    topLines,
    ``,
    `— Unyamwezini Jiko La Bibi JJJ`,
  ].filter(l => l !== undefined && l !== "").join("\n");
}

function sendTextToWhatsApp(text) {
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
}

/* ═══ SHARED REPORT PREVIEW MODAL (used by Akili & Malengo) ═══ */
function ReportPreviewModal({text, onClose}) {
  const {t} = useT();
  if(!text) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.85)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 16px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:t.bg2,border:"1px solid "+t.border,borderRadius:"20px 20px 12px 12px",padding:18,width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>Ona Kabla ya Kutuma / Preview</span>
          <button onClick={onClose} style={{background:t.bg4,border:"none",color:t.dim,borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <div style={{background:t.bg4,borderRadius:12,padding:14,overflowY:"auto",flex:1,marginBottom:10}}>
          <pre style={{fontFamily:"sans-serif",fontSize:13,color:t.text,whiteSpace:"pre-wrap",margin:0,lineHeight:1.6}}>{text}</pre>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 10px",lineHeight:1.5}}>
          Nambari zisizo sahihi? Funga hii kisha bonyeza ✏️ karibu na mauzo au gharama husika chini. / See a wrong number? Close this, then tap the ✏️ next to the specific sale or expense below to fix it.
        </p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>Funga / Close</button>
          <button onClick={()=>{sendTextToWhatsApp(text);onClose();}} style={{flex:2,background:"rgba(37,211,102,0.15)",color:"#25d366",border:"1px solid rgba(37,211,102,0.4)",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <i className="ti ti-brand-whatsapp"/>Tuma Sasa / Send Now
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══ TAB 1: LEO ═══ */
function LeoTab({onGoTo,flags=[]}) {
  const {t, presenterMode} = useT();
  const {todaySales,todayGross,todayNet,todayOverhead,todayCosts,goals,updateSale,deleteSale,updateCost,deleteCost,allSales,allCosts,fetchRange,customItems} = useAdmin();
  const [editRec,setEditRec]=useState(null);
  const [editType,setEditType]=useState("sale");
  const [reportMode,setReportMode]=useState("today");
  const [reportDate,setReportDate]=useState(today());
  const [quickRange,setQuickRange]=useState("today");
  const [waSending,setWaSending]=useState(false);
  const [previewText,setPreviewText]=useState(null);
  function getReportRange(){
    const now=new Date();
    const fmtD=d=>dateStrET(d);
    if(reportMode==="today") return {start:today(),end:today(),label:"Leo — "+today()};
    if(reportMode==="yesterday"){const y=new Date(now);y.setDate(y.getDate()-1);const ys=fmtD(y);return {start:ys,end:ys,label:"Jana — "+ys};}
    if(reportMode==="week"){
      // Wiki inaanza Jumamosi (Saturday) na inaisha Ijumaa (Friday)
      const startD = new Date(now); startD.setDate(now.getDate()-daysSinceWeekStart(now.getDay()));
      const start = fmtD(startD), end = fmtD(now);
      return {start,end,label:"Wiki Hii, Jumamosi-Ijumaa ("+start+" hadi "+end+")"};
    }
    if(reportMode==="month"){const s=new Date(now.getFullYear(),now.getMonth(),1);return {start:fmtD(s),end:today(),label:"Mwezi Huu ("+fmtD(s)+" hadi "+today()+")"};}
    return {start:reportDate,end:reportDate,label:reportDate};
  }
  async function sendPickedDateWhatsApp(){
    setWaSending(true);
    try{
      const {start,end,label} = getReportRange();
      let text;
      if(start===today()&&end===today()){
        const todayCosts = allCosts.filter(c=>c.cost_date===today());
        text = buildDailyReportText(todaySales,todayGross,todayOverhead,todayNet,label,todayCosts,computeCatMix(todaySales,todayCosts,customItems));
      } else {
        const {sales:freshSales, costs:freshCosts} = await fetchRange(start,end);
        const rangeSales=freshSales.filter(s=>s.sale_date>=start&&s.sale_date<=end);
        const rangeCosts=freshCosts.filter(c=>c.cost_date>=start&&c.cost_date<=end);
        const gross=rangeSales.reduce((s,r)=>s+r.total_price,0);
        const overhead=rangeCosts.reduce((s,c)=>s+c.amount,0);
        const net=gross-overhead;
        text = buildDailyReportText(rangeSales,gross,overhead,net,label,rangeCosts,computeCatMix(rangeSales,rangeCosts,customItems));
      }
      setPreviewText(text);
    } finally { setWaSending(false); }
  }
  const catMixL=useMemo(()=>computeCatMix(todaySales,todayCosts,customItems),[todaySales,todayCosts,customItems]);
  const h=new Date().getHours();
  const alerts=[];
  if(todayGross===0&&h>9) alerts.push({c:t.rd,msg:"No sales yet today — is the menu ready? / Hakuna mauzo bado leo."});
  if(goals.daily&&todayGross>=goals.daily) alerts.push({c:t.gr,msg:"Daily goal reached! / Lengo la leo limefikiwa!"});
  if(todayOverhead>todayGross*0.5&&todayGross>0) alerts.push({c:t.rd,msg:"Expenses > 50% of revenue today / Gharama zaidi ya nusu ya mapato leo."});
  return (
    <div style={{padding:"1rem"}}>
      {flags.length>0&&(()=>{const warn=flags.some(f=>f.c==="warn");const gc=warn?"#ffb300":"#2ecc71";return (
        <button className="jiko-glow" onClick={()=>onGoTo("akili")} style={{"--glow":gc,display:"block",width:"100%",textAlign:"left",cursor:"pointer",background:gc+"18",border:"2px solid "+gc,borderRadius:14,padding:"11px 13px",marginBottom:10,fontFamily:"sans-serif",color:t.text}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:5}}>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:"0.5px",textTransform:"uppercase",color:warn?"#b36b00":"#1b8a4a"}}>🔔 Tahadhari / Alert · Chakula vs Vinywaji</span>
            <span style={{fontSize:10,fontWeight:700,color:t.dim2,flexShrink:0}}>Akili ›</span>
          </div>
          {flags.slice(0,2).map((f,i)=><div key={i} style={{fontSize:12,lineHeight:1.45,marginTop:i?5:0}}>{f.msg}</div>)}
          {flags.length>2&&<div style={{fontSize:10,color:t.dim2,marginTop:5}}>+{flags.length-2} zaidi / more — bonyeza / tap</div>}
        </button>);})()}
      <div style={{background:t.heroBg,borderRadius:16,padding:"1.4rem",marginBottom:10,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,"+t.gold+","+t.gr+","+t.gold+")"}}/>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:"rgba(255,255,255,0.5)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"2px"}}>Mapato ya Leo / Today's Revenue</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"40px",fontWeight:900,color:t.gold,margin:0,lineHeight:1}}>{presenterMode ? (goals.daily>0 ? pct(todayGross,goals.daily)+"% ya lengo" : "—") : fmt(todayGross)}</p>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          {[[presenterMode?(todayGross>0?Math.round(todayOverhead/todayGross*100)+"%":"—"):fmt(todayOverhead),t.rd,"Gharama/Costs"],[todayNet===null?"--":(presenterMode?(todayGross>0?Math.round(todayNet/todayGross*100)+"%":"—"):fmt(todayNet)),todayNet!==null&&todayNet>=0?t.gr:t.rd,"Faida/Profit"],[todaySales.length,"#fff","Mauzo/Sales"]].map(([v,c,l])=>(
            <div key={l}><div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(255,255,255,0.4)",textTransform:"uppercase"}}>{l}</div><div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:c}}>{v}</div></div>
          ))}
        </div>
      </div>
      {goals.daily>0&&(
        <Card style={{padding:"1rem",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <Ring label="Leo/Today" current={todayGross} goal={goals.daily} color={goalColor(todayGross,goals.daily,t)} size={80}/>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:900,color:t.gold}}>{presenterMode?"Lengo/Target":fmt(goals.daily)}</div><div style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",marginTop:2}}>Daily Goal</div></div>
        </Card>
      )}
      <FoodDrinkCard mix={catMixL}/>
      {alerts.map((a,i)=><div key={i} style={{borderLeft:"3px solid "+a.c,background:a.c+"12",borderRadius:"0 10px 10px 0",padding:"8px 12px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:a.c,lineHeight:1.4}}>{a.msg}</div>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <button onClick={()=>onGoTo("ingiza")} style={{background:"linear-gradient(135deg,"+t.gr+",#009940)",color:"#fff",border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px "+t.gr+"44",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-plus"/>Record Sale / Mauzo
        </button>
        <button onClick={()=>onGoTo("ingiza")} style={{background:"linear-gradient(135deg,"+t.rd+",#a80018)",color:"#fff",border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px "+t.rd+"44",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-minus"/>Record Expense / Gharama
        </button>
      </div>
      <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><IconBadge emoji="💬" color={"#25d366"}/><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Tuma Ripoti / Send Report</p></div>
        <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
          {[["today","Leo"],["yesterday","Jana"],["week","Wiki Hii"],["month","Mwezi Huu"],["custom","Chagua Tarehe"]].map(([k,l])=>(
            <button key={k} onClick={()=>setReportMode(k)} style={{padding:"6px 12px",borderRadius:99,border:"1px solid "+(reportMode===k?t.gold:t.border),background:reportMode===k?t.gold+"18":"transparent",color:reportMode===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:reportMode===k?700:400,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {reportMode!=="custom" && <div style={{marginBottom:10,padding:"9px 12px",borderRadius:10,background:t.gold+"12",display:"flex",alignItems:"center",gap:7}}>
          <i className="ti ti-calendar" style={{fontSize:14,color:t.gold}}/>
          <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{getReportRange().start} → {getReportRange().end}</span>
        </div>}
        {reportMode==="custom" && <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} max={today()} style={{width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>}
        <button onClick={sendPickedDateWhatsApp} disabled={waSending} style={{width:"100%",background:waSending?t.bg4:"rgba(37,211,102,0.12)",color:waSending?t.dim2:"#25d366",border:"1px solid "+(waSending?t.border:"rgba(37,211,102,0.3)"),borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:waSending?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <i className="ti ti-eye"/>{waSending?"Inapakia...":"Angalia Ripoti / Preview Report"}
        </button>
      </Card>
      {todaySales.length>0&&(
        <Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Today's Sales / Mauzo ya Leo ({todaySales.length}) — Tap ✏️ to edit</p>
          {todaySales.slice(0,15).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={r=>{setEditType("sale");setEditRec(r);}} i={i}/>)}
        </Card>
      )}
      {todayCosts.length>0&&(
        <Card style={{padding:"1rem",marginTop:10}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.rd,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Today's Expenses / Gharama za Leo ({todayCosts.length}) — Tap ✏️ to edit</p>
          {todayCosts.slice(0,15).map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={r=>{setEditType("cost");setEditRec(r);}} i={i}/>)}
        </Card>
      )}
      {editRec&&<EditModal type={editType} record={editRec} onSave={editType==="sale"?updateSale:updateCost} onDelete={editType==="sale"?deleteSale:deleteCost} onClose={()=>setEditRec(null)}/>}
      {previewText && (
        <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.85)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 16px"}} onClick={e=>{if(e.target===e.currentTarget)setPreviewText(null);}}>
          <div style={{background:t.bg2,border:"1px solid "+t.border,borderRadius:"20px 20px 12px 12px",padding:18,width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>Ona Ripoti Kabla ya Kutuma / Preview</span>
              <button onClick={()=>setPreviewText(null)} style={{background:t.bg4,border:"none",color:t.dim,borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <div style={{background:t.bg4,borderRadius:12,padding:14,overflowY:"auto",flex:1,marginBottom:10}}>
              <pre style={{fontFamily:"sans-serif",fontSize:13,color:t.text,whiteSpace:"pre-wrap",margin:0,lineHeight:1.6}}>{previewText}</pre>
            </div>
            <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 10px",lineHeight:1.5}}>
              Nambari zisizo sahihi? Funga hii kisha bonyeza ✏️ karibu na mauzo au gharama husika chini kwenye Leo. / See a wrong number? Close this, then tap the ✏️ next to the specific sale or expense below on the Leo tab to fix it. For a past date, use the Ripoti tab instead.
            </p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setPreviewText(null)} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>Funga / Close</button>
              <button onClick={()=>{sendTextToWhatsApp(previewText);setPreviewText(null);}} style={{flex:2,background:"rgba(37,211,102,0.15)",color:"#25d366",border:"1px solid rgba(37,211,102,0.4)",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <i className="ti ti-brand-whatsapp"/>Tuma Sasa / Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ TAB 2: INGIZA ═══ */
function IngizaTab() {
  const {t} = useT();
  const {prices,recordSale,recordCost,allCosts,deleteCost,updateCost,customItems,menuEdits={},menuSections={},menuOrder={}} = useAdmin();
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
  // Build virtual sections from custom items so they appear in Ingiza
  const customSections = useMemo(() => {
    const names = new Set();
    const builtIn = new Set(sections.map(secLabel));
    customItems.forEach(ci => { const n = ci.sectionName || "Bidhaa Mpya"; if(!builtIn.has(n)) names.add(n); });
    return Array.from(names).map((name, i) => ({
      id: "custom_sec_" + i,
      sectionName: name,
      name: { sw: name.split("/")[0].trim(), en: (name.includes("/") ? name.slice(name.indexOf("/")+1) : name).trim() }
    }));
  }, [customItems]);
  const allSections = [...sections, ...customSections].map((x,i)=>({x,i,k:x.sectionName||x.id}))
    .sort((a,b)=>secOrderOf(menuSections,a.k,a.i)-secOrderOf(menuSections,b.k,b.i)||a.i-b.i).map(o=>o.x);
  // Convert custom items to menu-item shape so the rest of the code works unchanged
  function customAsMenuItem(ci, secId) {
    return {
      id: ci.id,
      section: secId,
      name: { sw: ci.sw, en: ci.en || ci.sw },
      emoji: ci.em || "🍽️",
      price: parseInt(String(ci.pr).replace(/,/g, "")) || 0,
      photo: ci.ph || null
    };
  }
  let secItems;
  if (sections.find(s => s.id === sec)) {
    const bs = sections.find(s => s.id === sec);
    secItems = [
      ...menu.filter(m => m.section === sec && !menuEdits[m.id]?.hidden).map(m => withEdit(m, menuEdits)),
      ...customItems.filter(ci => ci.sectionName === secLabel(bs)).map(ci => customAsMenuItem(ci, sec))
    ];
  } else {
    const customSec = customSections.find(s => s.id === sec);
    secItems = customSec
      ? customItems.filter(ci => (ci.sectionName || "Bidhaa Mpya") === customSec.sectionName).map(ci => customAsMenuItem(ci, sec))
      : [];
  }
  secItems = secItems.map((x,i)=>({x,i})).sort((a,b)=>posOf(menuOrder,a.x.id,a.i)-posOf(menuOrder,b.x.id,b.i)||a.i-b.i).map(o=>o.x);
  const isToday=date===today();
  const recentCosts=allCosts.filter(c=>c.cost_date===date).slice(0,10);
  const DCATS=[{k:"gas",l:"Gas/Gesi"},{k:"staff",l:"Staff/Wafanyakazi"},{k:"ingredients",l:"Ingredients/Malighafi"},{k:"rent",l:"Rent/Pango"},{k:"matengenezo",l:"Matengenezo/Maintenance"},{k:"vifaa",l:"Vifaa/Materials"},{k:"contractor",l:"Mkandarasi/Contractor"},{k:"other",l:"Other/Nyingine"}];
  const BCATS=[{k:"bulk_ingredients",l:"🍚 Bulk Ingredients"},...BEV_CATS,{k:"equipment",l:"🔧 Equipment/Vifaa"},{k:"marketing",l:"📣 Marketing"},{k:"bulk_other",l:"📦 Other Bulk"}];
  const inp = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  async function doSale(){if(!item||saleBusy)return;setSaleBusy(true);await recordSale(item,qty,svc,date);setItem(null);setQty(1);setSaleBusy(false);setSaleOk(true);setTimeout(()=>setSaleOk(false),2000);}
  async function doCost(){if(!amount||costBusy)return;setCostBusy(true);await recordCost(cat,desc,amount,date,costType);setAmount("");setDesc("");setCostBusy(false);setCostOk(true);setTimeout(()=>setCostOk(false),2000);}
  return (
    <div style={{padding:"1rem"}}>
      <Card glow={!isToday} style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:isToday?t.gr:t.gold,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>{isToday?"Today / Leo":"Past Date / Tarehe Iliyopita"}</p>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,border:"2px solid "+(isToday?t.gr:t.gold),fontWeight:700,fontSize:14,marginBottom:0,display:"block",minWidth:0,maxWidth:"100%",WebkitAppearance:"none",appearance:"none",minHeight:44}}/>
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
            {allSections.map(s=><button key={s.id} onClick={()=>{setSec(s.id);setItem(null);}} style={{background:sec===s.id?t.gr+"18":"transparent",color:sec===s.id?t.gr:t.dim2,border:"1px solid "+(sec===s.id?(s.id.startsWith("custom_")?t.gold:t.gr):t.border),borderRadius:99,padding:"4px 10px",whiteSpace:"nowrap",fontFamily:"sans-serif",fontSize:"10px",fontWeight:sec===s.id?700:400,cursor:"pointer",flexShrink:0}}>{s.id.startsWith("custom_")?"✨ ":""}{s.name.sw.split(" ")[0]}</button>)}
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
            {costType==="daily"?"Daily costs: gas, staff wages, small ingredients, rent.":"One-time bulk: big ingredient orders, drinks stock (cold drinks, beer, gin), equipment, marketing."}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
            {(costType==="daily"?DCATS:BCATS).map(c=>{const isBev=c.k.startsWith("bulk_")&&BEV_CATS.some(x=>x.k===c.k);return <button key={c.k} onClick={()=>setCat(c.k)} style={{padding:"9px 8px",minHeight:42,borderRadius:10,border:"1.5px solid "+(cat===c.k?t.gold:t.border),background:cat===c.k?t.gold+"18":(isBev?t.pu+"0d":"transparent"),color:cat===c.k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"11px",lineHeight:1.2,fontWeight:cat===c.k?700:500,cursor:"pointer",minWidth:0,overflowWrap:"anywhere"}}>{c.l}</button>;})}
          </div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder={BEV_CATS.some(x=>x.k===cat)?"Maelezo / Details (e.g. Kreti 5 Kilimanjaro, Soda kreti 3)":"Maelezo Kamili / Full description (e.g. Mkaa 10kg, Fundi Umeme - Switch)"} style={{...inp,marginBottom:8,minHeight:44,borderColor:!desc?t.gold+"55":t.border}}/>{!desc&&<p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.gold,margin:"-3px 0 8px",fontStyle:"italic"}}>💡 Andika maelezo kamili kwa ripoti bora / Write full description for clearer reports</p>}
          <input type="number" inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount / Kiasi (TZS)" style={{...inp,marginBottom:6,minHeight:44}}/>
          <p style={{fontFamily:"Georgia,serif",fontSize:"15px",fontWeight:700,color:amount?t.rd:t.dim2,margin:"0 0 12px",minHeight:20}}>{amount?fmt(parseInt(amount)||0):"\u00a0"}</p>
          <button onClick={doCost} disabled={costBusy||!amount} style={{width:"100%",background:costOk?"linear-gradient(135deg,"+t.gr+",#009940)":!amount?t.bg4:"linear-gradient(135deg,"+t.rd+",#a80018)",color:!amount?t.dim2:"#fff",border:"none",borderRadius:12,padding:14,minHeight:48,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:!amount?"default":"pointer",transition:"all 0.3s"}}>
            {costOk?"✓ Saved! / Imehifadhiwa!":costBusy?"Saving...":"SAVE EXPENSE / HIFADHI GHARAMA"}
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

/* ═══ COMPARISON ROW ═══ */
function ComparisonRow({range, cStart, cEnd, currentGross}) {
  const {t} = useT();
  const {fetchRange, allSales} = useAdmin();
  const [prevGross,setPrevGross] = useState(null);
  const [loaded,setLoaded] = useState(false);

  function getPreviousPeriod(){
    const fmt = d => dateStrET(d);
    const now = new Date();
    if(range==="today"){const y=new Date(now);y.setDate(y.getDate()-1);return {start:fmt(y),end:fmt(y),label:"yesterday"};}
    if(range==="yesterday"){const y=new Date(now);y.setDate(y.getDate()-2);return {start:fmt(y),end:fmt(y),label:"day before"};}
    if(range==="last7"){const e=new Date(now);e.setDate(e.getDate()-7);const s=new Date(e);s.setDate(s.getDate()-6);return {start:fmt(s),end:fmt(e),label:"previous 7 days"};}
    if(range==="month"){const s=new Date(now.getFullYear(),now.getMonth()-1,1);const e=new Date(now.getFullYear(),now.getMonth(),0);return {start:fmt(s),end:fmt(e),label:"last month"};}
    return null;
  }

  useEffect(()=>{
    async function fetchPrev(){
      const p = getPreviousPeriod(); if(!p) return;
      const {supabase} = await import("../lib/supabase");
      if(!supabase) return;
      const {data} = await supabase.from("sales").select("total_price").gte("sale_date",p.start).lte("sale_date",p.end);
      const sum = (data||[]).reduce((s,r)=>s+r.total_price,0);
      setPrevGross(sum);
      setLoaded(true);
    }
    fetchPrev();
  },[range,cStart,cEnd]);

  if(range==="custom"||prevGross===null||!loaded) return null;
  const period = getPreviousPeriod(); if(!period) return null;
  const change = prevGross>0 ? Math.round((currentGross-prevGross)/prevGross*100) : (currentGross>0?100:0);
  const flat = Math.abs(change) <= 3;
  const up = change >= 0;
  const trendColor = flat ? t.gold : (up ? t.gr : t.rd);
  const arrow = flat ? "→" : (up ? "▲" : "▼");
  return (
    <Card style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px"}}>vs {period.label}</div>
        <div style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim,marginTop:2}}>Previous: TZS {Number(prevGross).toLocaleString()}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:18,color:trendColor}}>{arrow}</span>
        <span style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:900,color:trendColor}}>{Math.abs(change)}%</span>
      </div>
    </Card>
  );
}

/* ═══ TAB 3: RIPOTI ═══ */

/* ═══ STOREFRONT: publish Akili's top dishes to the public site (names + rank only, never money) ═══ */
const FAV_SECTIONS = ["mchele","standard","pilau","specials","jioni"];
const FAV_KINDS=[{kind:"soft",n:4,l:"🥤 Vinywaji Baridi / Soft drinks"},{kind:"beer",n:4,l:"🍺 Bia / Beer"},{kind:"spirits",n:4,l:"🥃 Gin na Pombe Kali / Gin & Spirits"}];
async function syncFavorites(sales,customItems){
  try{
    const {supabase}=await import("../lib/supabase"); if(!supabase) return {ok:false,why:"no-supabase"};
    const cust={}, cm={}; (customItems||[]).forEach(c=>{ cust[c.id]=c; cm[c.id]=c.sectionName||""; });
    const meals={}; menu.forEach(m=>{ if(FAV_SECTIONS.includes(m.section)) meals[m.id]=m; });
    const now=new Date().toISOString();
    const lists=[];   // {kind, top:[[id,qty,label]]}
    // food: top 6 meals
    const tot={};
    (sales||[]).forEach(r=>{ if(meals[r.item_id]) tot[r.item_id]=(tot[r.item_id]||0)+(r.quantity||0); });
    const topFood=Object.entries(tot).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id,q])=>[id,q,meals[id].name.sw]);
    if(topFood.length>=2) lists.push({kind:"food",top:topFood});   // not enough sales yet -> site keeps default favorites
    // drinks: top 4 per class (menu.js drinks + custom items), classified the same way as Ripoti
    const menuById=Object.fromEntries(menu.map(m=>[m.id,m]));
    const dt={ soft:{}, beer:{}, spirits:{} };
    (sales||[]).forEach(r=>{
      if(!r.item_id||meals[r.item_id]) return;
      if(!menuById[r.item_id]&&!cust[r.item_id]) return;                       // only items the site can show
      const k=classifyItem(r.item_id,r.section_id,r.item_name,cm);
      if(dt[k]) dt[k][r.item_id]=(dt[k][r.item_id]||0)+(r.quantity||0);
    });
    FAV_KINDS.forEach(({kind,n})=>{
      const top=Object.entries(dt[kind]).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]).slice(0,n)
        .map(([id,q])=>[id,q,(menuById[id]?menuById[id].name.sw:(cust[id]&&cust[id].sw))||id]);
      if(top.length) lists.push({kind,top});
    });
    let wrote=0, kindOk=true;
    for(const L of lists){
      const rows=L.top.map(([id,q,label],i)=>({menu_id:id,label,rank:i+1,units:q,kind:L.kind,updated_at:now}));
      let {error}=await supabase.from("popular_dishes").upsert(rows,{onConflict:"menu_id"});   // keeps pinned / hidden untouched
      if(error&&/kind/i.test(error.message||"")){                                            // drinks column not added yet
        kindOk=false; if(L.kind!=="food") continue;
        ({error}=await supabase.from("popular_dishes").upsert(rows.map(({kind,...r})=>r),{onConflict:"menu_id"}));
      }
      if(error) return {ok:false,why:error.message||"error"};
      wrote+=rows.length;
      let q=supabase.from("popular_dishes").delete().eq("pinned",false).eq("hidden",false).not("menu_id","in","("+L.top.map(([id])=>id).join(",")+")");
      if(kindOk) q=q.eq("kind",L.kind);
      await q;
    }
    return {ok:true,n:wrote,noKind:!kindOk};
  }catch(e){ return {ok:false,why:String(e.message||e)}; }
}

// ═══ MIHURI / STAMP CARD — staff add a stamp per order; customers see their own card on the website ═══
function StampsTab(){
  const {t}=useT();
  const [goal,setGoal]=useState(10);
  const [reward,setReward]=useState("Kinywaji Bure / Free drink");
  const [goalIn,setGoalIn]=useState("10");
  const [phone,setPhone]=useState("");
  const [name,setName]=useState("");
  const [cur,setCur]=useState(null);          // {phone,stamps,redeemed} of the customer being served
  const [list,setList]=useState(null);        // recent cards (null = loading)
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [note,setNote]=useState(null);        // {ok,msg}
  const noteT=useRef(null);
  const flash=(ok,msg)=>{ setNote({ok,msg}); clearTimeout(noteT.current); noteT.current=setTimeout(()=>setNote(null),ok?4000:9000); };
  const inp={width:"100%",boxSizing:"border-box",padding:"10px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg||"transparent",color:t.inputColor||t.text,fontFamily:"sans-serif",fontSize:14,marginBottom:8};
  const pill=(on,c)=>({fontFamily:"sans-serif",fontSize:11,fontWeight:700,padding:"8px 12px",borderRadius:99,cursor:"pointer",border:"1px solid "+(on?c:t.border),background:on?c+"22":"transparent",color:on?c:t.dim2});
  async function sb(){ const {supabase}=await import("../lib/supabase"); return supabase; }
  async function load(){
    setErr("");
    try{
      const supabase=await sb();
      const f=await supabase.from("site_flags").select("*").eq("id","main").limit(1);
      const fl=f.data&&f.data[0]; if(fl){ if(fl.stamp_goal>0){ setGoal(fl.stamp_goal); setGoalIn(String(fl.stamp_goal)); } if(fl.stamp_reward) setReward(fl.stamp_reward); }
      const c=await supabase.from("stamp_cards").select("*").order("updated_at",{ascending:false}).limit(40);
      if(c.error){ setErr(c.error.message||"error"); setList([]); return; }
      setList(c.data||[]);
    }catch(e){ setErr(String(e.message||e)); setList([]); }
  }
  useEffect(()=>{ load(); },[]);

  const np=waPhone(phone);
  async function act(fn,args,okMsg){
    setBusy(true);
    try{
      const supabase=await sb();
      const {data,error}=await supabase.rpc(fn,args);
      if(error) throw error;
      setCur({phone:args.p_phone,stamps:data.stamps,redeemed:data.redeemed});
      flash(true,okMsg); await load();
    }catch(e){ const m=String(e.message||e); flash(false,/stamp_|function|schema cache|does not exist/i.test(m)?"✗ Endesha migration_stamp_card.sql kwenye Supabase kwanza / Run migration_stamp_card.sql in Supabase first":"✗ "+m); }
    setBusy(false);
  }
  const addStamp=d=>{ if(!np){ flash(false,"✗ Namba si sahihi — tarakimu 10, mfano 0712345678 / Invalid number"); return; } act("stamp_add",{p_phone:np,p_name:name.trim(),p_delta:d,p_note:d>0?"muhuri / stamp":"marekebisho / correction"},d>0?"⭐ Muhuri umewekwa / Stamp added":"↩️ Muhuri umeondolewa / Stamp removed"); };
  const redeem=()=>act("stamp_redeem",{p_phone:cur.phone},"🎁 Zawadi imetolewa / Reward given");
  async function saveSettings(){
    const g=parseInt(goalIn,10); if(!(g>=3&&g<=20)){ flash(false,"✗ Mihuri iwe kati ya 3 na 20 / Goal must be 3 to 20"); return; }
    setBusy(true);
    try{ const supabase=await sb(); const {error}=await supabase.from("site_flags").update({stamp_goal:g,stamp_reward:reward.trim()||"Kinywaji Bure / Free drink"}).eq("id","main"); if(error) throw error; setGoal(g); flash(true,"✓ Imehifadhiwa / Saved"); }
    catch(e){ flash(false,"✗ Endesha migration_stamp_card.sql kwanza / Run migration_stamp_card.sql first"); }
    setBusy(false);
  }
  function pick(c){ setPhone("0"+c.phone.slice(3)); setName(c.name||""); setCur({phone:c.phone,stamps:c.stamps,redeemed:c.redeemed}); window.scrollTo&&window.scrollTo({top:0,behavior:"smooth"}); }
  const ready=cur&&cur.stamps>=goal;

  return (
    <div style={{padding:"0 0 24px"}}>
      {note&&<div role="status" style={{position:"fixed",top:58,left:12,right:12,maxWidth:520,margin:"0 auto",zIndex:300,padding:"10px 14px",borderRadius:12,background:note.ok?"#0F766E":"#B42318",color:"#fff",fontFamily:"sans-serif",fontSize:12.5,fontWeight:700,lineHeight:1.4,boxShadow:"0 6px 22px rgba(0,0,0,0.35)",textAlign:"center"}}>{note.msg}</div>}
      <p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:"0 0 10px",lineHeight:1.5}}>Mteja anapoagiza, andika namba yake kisha bonyeza <b>+1 Muhuri</b>. Mteja anaona kadi yake kwenye tovuti (Zawadi) kwa kuingiza namba yake. / When a guest orders, type their number and tap <b>+1 Stamp</b>. They see their card on the website (Rewards) with their number.</p>
      {err&&<Card style={{padding:"10px 12px",marginBottom:10,borderLeft:"3px solid "+t.rd}}><p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:0,lineHeight:1.6}}>⚙️ Endesha <b>migration_stamp_card.sql</b> kwenye Supabase mara moja. / Run <b>migration_stamp_card.sql</b> once in Supabase.<br/><span style={{fontSize:10,color:t.rd}}>{err}</span></p></Card>}

      <Card style={{padding:"12px 14px",marginBottom:12}}>
        <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold,marginBottom:8}}>⭐ WEKA MUHURI / ADD A STAMP</div>
        <input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="Namba ya mteja / Customer phone (07xx xxx xxx)" style={inp}/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jina (hiari) / Name (optional)" style={inp}/>
        <div style={{display:"flex",gap:8}}>
          <button disabled={busy||!np} onClick={()=>addStamp(1)} style={{flex:1,background:np?t.gold:t.border,color:np?"#06132E":t.dim2,border:"none",borderRadius:10,padding:"12px 8px",fontFamily:"sans-serif",fontWeight:800,fontSize:14,cursor:np?"pointer":"default",opacity:busy?0.6:1}}>⭐ +1 Muhuri / Stamp</button>
          <button disabled={busy||!np} onClick={()=>addStamp(-1)} style={{...pill(false,t.rd),opacity:np?1:0.4}}>↩️ −1</button>
        </div>
        {phone&&!np&&<div style={{fontFamily:"sans-serif",fontSize:10.5,color:t.rd,marginTop:6}}>Tarakimu 10, mfano 0712345678 / 10 digits, e.g. 0712345678</div>}
        {cur&&(
          <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid "+t.border}}>
            <div style={{fontFamily:"sans-serif",fontSize:12,color:t.text,fontWeight:700,marginBottom:6}}>📱 0{cur.phone.slice(3)} — {cur.stamps} / {goal} {cur.redeemed>0?" · 🎁 zawadi "+cur.redeemed+" zimetolewa":""}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {Array.from({length:goal}).map((_,i)=>(<span key={i} style={{width:22,height:22,borderRadius:"50%",display:"inline-grid",placeItems:"center",fontSize:11,fontWeight:900,fontFamily:"sans-serif",background:i<Math.min(cur.stamps,goal)?t.gold:"transparent",color:i<Math.min(cur.stamps,goal)?"#06132E":t.dim2,border:"1.5px "+(i<Math.min(cur.stamps,goal)?"solid "+t.gold:"dashed "+t.border)}}>{i<Math.min(cur.stamps,goal)?"★":i+1}</span>))}
            </div>
            {ready&&<button disabled={busy} onClick={redeem} style={{marginTop:10,width:"100%",background:t.gr,color:"#fff",border:"none",borderRadius:10,padding:"12px 8px",fontFamily:"sans-serif",fontWeight:800,fontSize:14,cursor:"pointer"}}>🎁 Toa Zawadi / Give reward: {reward}</button>}
            {!ready&&<div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,marginTop:6}}>Bado {goal-cur.stamps} upate zawadi / {goal-cur.stamps} more to the reward</div>}
          </div>
        )}
      </Card>

      <Card style={{padding:"12px 14px",marginBottom:12}}>
        <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold,marginBottom:8}}>🕘 WATEJA WA KARIBUNI / RECENT GUESTS</div>
        {list===null&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,margin:0}}>Inapakia… / Loading…</p>}
        {list&&list.length===0&&!err&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,margin:0}}>Bado hakuna kadi. Weka muhuri wa kwanza hapo juu. / No cards yet — add the first stamp above.</p>}
        {(list||[]).map(c=>(
          <button key={c.phone} onClick={()=>pick(c)} style={{display:"flex",width:"100%",alignItems:"center",gap:8,padding:"9px 0",background:"none",border:"none",borderTop:"1px solid "+t.border,cursor:"pointer",textAlign:"left"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:12.5,fontWeight:700,color:t.text,overflowWrap:"anywhere"}}>{c.name?c.name+" · ":""}0{c.phone.slice(3)}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim}}>Zawadi zilizotolewa / Rewards given: {c.redeemed}</div>
            </div>
            <span style={{fontFamily:"sans-serif",fontSize:12,fontWeight:800,color:c.stamps>=goal?t.gr:t.gold,whiteSpace:"nowrap"}}>{c.stamps>=goal?"🎁 ":""}{c.stamps}/{goal}</span>
          </button>
        ))}
      </Card>

      <Card style={{padding:"12px 14px"}}>
        <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold,marginBottom:8}}>⚙️ MIPANGO / SETTINGS</div>
        <label style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,fontWeight:700}}>Mihuri inayohitajika / Stamps needed (3–20)</label>
        <input value={goalIn} onChange={e=>setGoalIn(e.target.value.replace(/[^0-9]/g,""))} inputMode="numeric" style={{...inp,marginTop:4}}/>
        <label style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,fontWeight:700}}>Zawadi / Reward</label>
        <input value={reward} onChange={e=>setReward(e.target.value)} maxLength={60} style={{...inp,marginTop:4}}/>
        <button disabled={busy} onClick={saveSettings} style={{...pill(true,t.gold),opacity:busy?0.6:1}}>💾 Hifadhi / Save</button>
      </Card>
    </div>
  );
}

function StorefrontTab(){
  const {t}=useT();
  const {allSales,customItems}=useAdmin();
  const [favs,setFavs]=useState(null);       // null = loading
  const [offers,setOffers]=useState(null);
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(null);       // {n,at} after a successful refresh
  const [editing,setEditing]=useState(null); // offer object (id may be "new")
  const [addId,setAddId]=useState("");
  const byId=useMemo(()=>Object.fromEntries(menu.map(m=>[m.id,m])),[]);
  const cmap=useMemo(()=>{const m={};(customItems||[]).forEach(c=>{m[c.id]=c.sectionName||"";});return m;},[customItems]);
  // everything the owner can feature: meals + drinks from the menu and from Msimamizi's custom items
  const addInfo=useMemo(()=>{
    const o={};
    menu.forEach(m=>{ const k=FAV_SECTIONS.includes(m.section)?"food":classifyItem(m.id,m.section,m.name.sw,{}); if(k!=="food"||FAV_SECTIONS.includes(m.section)) o[m.id]={kind:k,label:m.name.sw}; });
    (customItems||[]).forEach(c=>{ const k=classifyItem(c.id,c.section||"",c.sw,cmap); if(k!=="food") o[c.id]={kind:k,label:c.sw||c.id}; });
    return o;
  },[customItems,cmap]);

  async function sb(){ const {supabase}=await import("../lib/supabase"); return supabase; }
  async function load(){
    setErr("");
    try{
      const supabase=await sb();
      const f=await supabase.from("popular_dishes").select("*");
      const o=await supabase.from("site_offers").select("*").order("sort",{ascending:true});
      if(f.error||o.error){ setErr((f.error||o.error).message||"error"); setFavs([]); setOffers([]); return; }
      setFavs((f.data||[]).sort((a,b)=>(b.pinned-a.pinned)||(a.rank-b.rank)));
      setOffers(o.data||[]);
    }catch(e){ setErr(String(e.message||e)); setFavs([]); setOffers([]); }
  }
  useEffect(()=>{ load(); },[]);

  async function refreshFavs(){
    setBusy(true); setDone(null);
    const t0=Date.now();
    const r=await syncFavorites(allSales,customItems); if(!r.ok) setErr(r.why); else if(r.noKind) setErr('kind');
    await load();
    const wait=700-(Date.now()-t0); if(wait>0) await new Promise(res=>setTimeout(res,wait));   // so the tap always feels like it did something
    setBusy(false);
    if(r.ok){ const at=new Date().toLocaleTimeString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"}); setDone({n:r.n,at}); setTimeout(()=>setDone(null),8000); }
  }
  async function patchFav(id,patch){
    setFavs(l=>(l||[]).map(x=>x.menu_id===id?{...x,...patch}:x));
    try{ const supabase=await sb(); const {error}=await supabase.from("popular_dishes").update({...patch,updated_at:new Date().toISOString()}).eq("menu_id",id); if(error){ setErr(error.message); load(); } }catch(e){ setErr(String(e.message||e)); }
  }
  async function addFav(){
    if(!addId||!addInfo[addId]) return;
    try{ const supabase=await sb(); const rec={menu_id:addId,label:addInfo[addId].label,rank:50,units:0,pinned:true,hidden:false,kind:addInfo[addId].kind,updated_at:new Date().toISOString()};
      let {error}=await supabase.from("popular_dishes").upsert(rec,{onConflict:"menu_id"});
      if(error&&/kind/i.test(error.message||"")){ if(rec.kind==="food"){ const {kind,...r2}=rec; ({error}=await supabase.from("popular_dishes").upsert(r2,{onConflict:"menu_id"})); } else { setErr("kind"); return; } }
      if(error) setErr(error.message); }catch(e){ setErr(String(e.message||e)); }
    setAddId(""); load();
  }
  async function saveOffer(){
    const o=editing; if(!o||!o.title.trim()) return;
    const rec={title:o.title.trim().slice(0,120),body:(o.body||"").slice(0,400),price_text:(o.price_text||"").slice(0,40),badge:(o.badge||"").slice(0,24),active:!!o.active,sort:parseInt(o.sort,10)||0};
    try{ const supabase=await sb();
      const r=o.id==="new"?await supabase.from("site_offers").insert(rec):await supabase.from("site_offers").update(rec).eq("id",o.id);
      if(r.error) setErr(r.error.message);
    }catch(e){ setErr(String(e.message||e)); }
    setEditing(null); load();
  }
  async function toggleOffer(o){ setOffers(l=>l.map(x=>x.id===o.id?{...x,active:!x.active}:x)); try{ const supabase=await sb(); await supabase.from("site_offers").update({active:!o.active}).eq("id",o.id); }catch(e){} }
  async function delOffer(o){ if(!window.confirm("Futa ofa hii? / Delete this offer?")) return; try{ const supabase=await sb(); await supabase.from("site_offers").delete().eq("id",o.id); }catch(e){} load(); }

  const lab={fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold};
  const inp={width:"100%",boxSizing:"border-box",padding:"9px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.bg2||"transparent",color:t.text,fontFamily:"sans-serif",fontSize:13,marginBottom:8};
  const pill=(on,c)=>({fontFamily:"sans-serif",fontSize:10,fontWeight:700,padding:"6px 10px",borderRadius:99,cursor:"pointer",border:"1px solid "+(on?c:t.border),background:on?c+"22":"transparent",color:on?c:t.dim2});

  return (
    <div style={{padding:"1rem"}}>
      <ShieldBanner sw="Tovuti Yetu" en="Website storefront"/>
      {err&&<Card style={{padding:"10px 12px",marginBottom:10,borderLeft:"3px solid "+t.rd}}><p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:0,lineHeight:1.6}}>{err==="kind"?<>⚙️ Endesha <b>migration_storefront_drinks.sql</b> kwenye Supabase mara moja ili vinywaji vionekane. / Run <b>migration_storefront_drinks.sql</b> once in Supabase to publish drinks.</>:<>⚙️ Endesha <b>migration_storefront.sql</b> kwenye Supabase mara moja. / Run <b>migration_storefront.sql</b> once in Supabase.<br/><span style={{fontSize:10,color:t.rd}}>{err}</span></>}</p></Card>}

      <Card style={{padding:"12px 14px",marginBottom:12}}>
        <div style={lab}>🔥 VIPENDWA VYA WATEJA / WEBSITE FAVORITES</div>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,margin:"6px 0 10px",lineHeight:1.5}}>Akili huchagua vyakula 6 na vinywaji (baridi, bia, gin) vinavyouzwa zaidi na kuvichapisha kwenye tovuti kila unapofungua Msimamizi (majina tu, hakuna pesa). Bandika 📌 kuviweka juu, au ficha 👁 usivyovitaka. / Akili picks the 6 best-selling dishes plus top soft drinks, beers and gin/spirits and publishes them (names only, never money). Pin to keep on top, hide to remove.</p>
        {favs===null&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim}}>…</p>}
        {favs&&favs.length===0&&!err&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim}}>Bado hakuna — bonyeza "Sasisha sasa". / None yet — tap "Refresh now".</p>}
        {[{kind:"food",l:"🍛 Chakula / Food"},...FAV_KINDS].map(G=>{
          const rows=(favs||[]).filter(f=>(f.kind||"food")===G.kind); if(!rows.length) return null;
          return (<div key={G.kind} style={{marginTop:8}}>
            <div style={{fontFamily:"sans-serif",fontSize:10.5,fontWeight:800,color:t.gold,margin:"6px 0 2px"}}>{G.l}</div>
            {rows.map(f=>{ const m=byId[f.menu_id]; const nm=m?m.name.sw:((customItems||[]).find(c=>c.id===f.menu_id)||{}).sw||f.label; return (
          <div key={f.menu_id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderTop:"1px solid "+t.border,opacity:f.hidden?0.5:1}}>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontFamily:"sans-serif",fontSize:12.5,fontWeight:700,color:t.text,overflowWrap:"anywhere"}}>{f.pinned?"📌 ":""}{nm}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim}}>{f.units>0?"#"+f.rank+" · "+f.units+" zimeuzwa / sold":"Imebandikwa / Pinned"}{f.hidden?" · IMEFICHWA / HIDDEN":""}</div>
            </div>
            <button onClick={()=>patchFav(f.menu_id,{pinned:!f.pinned})} style={pill(f.pinned,t.gold)}>📌</button>
            <button onClick={()=>patchFav(f.menu_id,{hidden:!f.hidden})} style={pill(f.hidden,t.rd)}>{f.hidden?"Onyesha":"Ficha"}</button>
          </div>); })}
          </div>); })}
        <div style={{display:"flex",gap:6,marginTop:10}}>
          <select value={addId} onChange={e=>setAddId(e.target.value)} style={{...inp,marginBottom:0,flex:1}}>
            <option value="">➕ Ongeza kipendwa / Add a favorite…</option>
            {Object.entries(addInfo).filter(([id])=>!(favs||[]).some(f=>f.menu_id===id)).map(([id,v])=><option key={id} value={id}>{({food:"🍛",soft:"🥤",beer:"🍺",spirits:"🥃"})[v.kind]} {v.label}</option>)}
          </select>
          <button onClick={addFav} disabled={!addId} style={{...pill(!!addId,t.gr),opacity:addId?1:0.5}}>OK</button>
        </div>
        <button onClick={refreshFavs} disabled={busy} style={{...pill(!!done,done?t.gr:t.gold),marginTop:10,opacity:busy?0.7:1,transition:"all .2s"}}>
          {busy?"⏳ Inasasisha… / Updating…":done?"✅ Imesasishwa "+done.at+" · "+done.n+" vitu / Updated":"🔄 Sasisha sasa / Refresh now"}
        </button>
        {done&&<p style={{fontFamily:"sans-serif",fontSize:10.5,color:t.gr,margin:"6px 0 0"}}>Tovuti sasa inaonyesha orodha mpya — fungua upya ukurasa wa tovuti kuiona. / The website now shows the new list — reload the site to see it.</p>}
      </Card>

      <Card style={{padding:"12px 14px"}}>
        <div style={lab}>🎁 OFA ZA SASA / CURRENT OFFERS (tab ya Zawadi)</div>
        {offers===null&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim}}>…</p>}
        {offers&&offers.length===0&&!err&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim,margin:"8px 0"}}>Hakuna ofa bado. / No offers yet.</p>}
        {(offers||[]).map(o=>(
          <div key={o.id} style={{padding:"10px 0",borderTop:"1px solid "+t.border,opacity:o.active?1:0.55}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:t.text,overflowWrap:"anywhere"}}>{o.badge&&<span style={{fontFamily:"sans-serif",fontSize:9,background:"#0F766E",color:"#fff",padding:"2px 6px",borderRadius:5,marginRight:6}}>{o.badge}</span>}{o.title}</div>
            {o.body&&<div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:2,whiteSpace:"pre-line"}}>{o.body}</div>}
            {o.price_text&&<div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.gold,marginTop:2}}>{o.price_text}</div>}
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              <button onClick={()=>toggleOffer(o)} style={pill(o.active,t.gr)}>{o.active?"🟢 Inaonekana / Visible":"⚪ Imefichwa / Hidden"}</button>
              <button onClick={()=>setEditing({...o})} style={pill(false,t.bl)}>✏️ Hariri</button>
              <button onClick={()=>delOffer(o)} style={pill(false,t.rd)}>🗑</button>
            </div>
          </div>))}
        {!editing&&<button onClick={()=>setEditing({id:"new",title:"",body:"",price_text:"",badge:"",active:true,sort:(offers||[]).length+1})} style={{...pill(true,t.gold),marginTop:10}}>➕ Ongeza Ofa / Add Offer</button>}
        {editing&&(
          <div style={{marginTop:10,padding:10,border:"1px solid "+t.border,borderRadius:10}}>
            <input style={inp} maxLength={120} placeholder="Kichwa / Title (e.g. Pilau Ijumaa / Pilau Friday)" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/>
            <textarea style={{...inp,minHeight:64}} maxLength={400} placeholder="Maelezo / Details (Kiswahili / English)" value={editing.body} onChange={e=>setEditing({...editing,body:e.target.value})}/>
            <input style={inp} maxLength={40} placeholder="Bei / Price (e.g. TSh 5,000)" value={editing.price_text} onChange={e=>setEditing({...editing,price_text:e.target.value})}/>
            <input style={inp} maxLength={24} placeholder="Alama / Badge (hiari, e.g. KWA MUDA MFUPI)" value={editing.badge} onChange={e=>setEditing({...editing,badge:e.target.value})}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={saveOffer} disabled={!editing.title.trim()} style={{...pill(true,t.gr),opacity:editing.title.trim()?1:0.5}}>💾 Hifadhi / Save</button>
              <button onClick={()=>setEditing(null)} style={pill(false,t.dim2)}>Ghairi</button>
            </div>
          </div>)}
      </Card>
    </div>
  );
}

// The business week starts on SATURDAY (JS getDay: 0=Sun … 6=Sat) and runs Saturday → Friday.
const WEEK_START=6;
const daysSinceWeekStart=(dow)=>(dow-WEEK_START+7)%7;
function computeWeekCmp(allSales,customItems){
    const addD=(str,n)=>{const d=new Date(str+"T12:00:00");d.setDate(d.getDate()+n);return dateStrET(d);};
    const tdy=today(); const dow=new Date(tdy+"T12:00:00").getDay(); // 0=Sun
    const sinceMon=daysSinceWeekStart(dow);   // days since this week's Saturday (name kept for the code below)
    const thisStart=addD(tdy,-sinceMon), lastStart=addD(thisStart,-7), lastSame=addD(lastStart,sinceMon), lastEnd=addD(lastStart,6);
    const inR=(a,b)=>allSales.filter(r=>r.sale_date>=a&&r.sale_date<=b);
    const cur=computeCatMix(inR(thisStart,tdy),[],customItems);
    const prevSame=computeCatMix(inR(lastStart,lastSame),[],customItems);
    const prevFull=computeCatMix(inR(lastStart,lastEnd),[],customItems);
    return {cur,prevSame,prevFull,thisStart,lastStart,lastSame,lastEnd,days:sinceMon+1};
}
function buildMixFlags(wk){
  const out=[];
  {
    const cw=wk.cur, pw=wk.prevSame;
    const foodC=cw.m.food.rev, foodP=pw.m.food.rev, bevC=cw.bev, bevP=pw.bev;
    if(cw.total>0&&pw.total>0&&foodP>0&&bevP>0){
      const fg=Math.round((foodC-foodP)/foodP*100), bg=Math.round((bevC-bevP)/bevP*100), gap=bg-fg;
      if(gap>=15) out.push({glow:true,c:bg>0?"good":"warn",msg:"🥂 Vinywaji vinakua haraka kuliko chakula wiki hii / Drinks are growing faster than food this week ("+(bg>0?"+":"")+bg+"% vs "+(fg>0?"+":"")+fg+"%)."+(fg<0?" Chakula kinashuka — angalia menyu ya chakula na bei. / Food is slipping — check the food menu and prices.":" Hakikisha jikoni inaendana na kasi ya baa. / Make sure the kitchen keeps pace with the bar.")});
      else if(gap<=-15) out.push({glow:true,c:fg>0?"good":"warn",msg:"🍛 Chakula kinakua haraka kuliko vinywaji wiki hii / Food is growing faster than drinks this week ("+(fg>0?"+":"")+fg+"% vs "+(bg>0?"+":"")+bg+"%)."+(bg<0?" Vinywaji vinashuka — angalia stock na bei za baa. / Drinks are slipping — check bar stock and prices.":" Fikiria kuuza vinywaji pamoja na chakula. / Consider pairing drinks with meals.")});
      const sh=Math.round(bevC/cw.total*100), shP=Math.round(bevP/pw.total*100);
      if(Math.abs(sh-shP)>=10) out.push({glow:true,c:"info",msg:"📊 Sehemu ya vinywaji kwenye mauzo imebadilika: "+shP+"% → "+sh+"% (wiki iliyopita → hii). / Beverage share of sales moved from "+shP+"% to "+sh+"%."});
      const alcC=cw.alc, alcP=pw.alc;
      if(alcP>0&&alcC>0){ const ag=Math.round((alcC-alcP)/alcP*100); if(ag-fg>=25&&ag>=20) out.push({glow:true,c:"info",msg:"🍺 Pombe inakua kwa +"+ag+"% (chakula "+(fg>0?"+":"")+fg+"%). Hakikisha stock ya bia/pombe kali inatosha. / Alcohol is up +"+ag+"% — make sure beer/spirits stock keeps up."}); }
    } else if(cw.total>0&&pw.total>0&&foodP===0&&bevP>0&&foodC>0) out.push({glow:true,c:"good",msg:"🍛 Chakula kimeanza kuuzwa wiki hii baada ya wiki iliyopita kuwa bila chakula. / Food sales picked up this week after none in the same days last week."});
    else if(cw.total>0&&pw.total>0&&bevP===0&&bevC>0&&foodP>0) out.push({glow:true,c:"good",msg:"🥂 Vinywaji vimeanza kuuzwa wiki hii (wiki iliyopita hakukuwa na). / Drink sales started this week (none in the same days last week)."});
  }
  return out;
}
// Pombe Kali (spirits) sold today vs your usual spirits day — returns a glow flag when it is a big day
function spiritsTodayFlag(allSales,customItems){
  const cm={};(customItems||[]).forEach(c=>{cm[c.id]=c.sectionName||"";});
  const td=today(); const byDay={}; let tq=0, tr=0;
  allSales.forEach(r=>{
    if(classifyItem(r.item_id,r.section_id,r.item_name,cm)!=="spirits") return;
    if(r.sale_date===td){tq+=r.quantity||0;tr+=r.total_price||0;}
    else byDay[r.sale_date]=(byDay[r.sale_date]||0)+(r.quantity||0);
  });
  const days=Object.values(byDay); const avg=days.length?days.reduce((a,b)=>a+b,0)/days.length:0;
  const hot = tq>=3 && (avg===0 ? tq>=5 : tq>=avg*1.5);
  if(!hot) return [];
  const usual = avg>0 ? " (kawaida/usual ~"+Math.round(avg)+")" : "";
  return [{glow:true,c:"info",msg:"🥃 Pombe Kali leo / today: "+tq+" vipande/pcs · "+fmt(tr)+usual+" — siku nzuri ya pombe kali! / a big spirits day!"}];
}
function deltaPct(cur,prev){ if(prev>0) return Math.round((cur-prev)/prev*100); return cur>0?null:0; }
function computeCatMix(sales,costs,customItems){
  const cm={};(customItems||[]).forEach(c=>{cm[c.id]=c.sectionName||"";});
  const m={food:{rev:0,qty:0},soft:{rev:0,qty:0},beer:{rev:0,qty:0},spirits:{rev:0,qty:0}};
  sales.forEach(r=>{const k=classifyItem(r.item_id,r.section_id,r.item_name,cm);m[k].rev+=r.total_price||0;m[k].qty+=r.quantity||0;});
  const buy={soft:0,beer:0,spirits:0};
  costs.forEach(c=>{if(c.category==="bulk_cold_drinks")buy.soft+=c.amount;else if(c.category==="bulk_beer")buy.beer+=c.amount;else if(c.category==="bulk_spirits")buy.spirits+=c.amount;});
  const bev=m.soft.rev+m.beer.rev+m.spirits.rev, alc=m.beer.rev+m.spirits.rev;
  return {m,buy,bev,alc,soft:m.soft.rev,total:m.food.rev+bev,bevQty:m.soft.qty+m.beer.qty+m.spirits.qty,buyTotal:buy.soft+buy.beer+buy.spirits};
}
function FoodDrinkCard({mix}){
  const {t,presenterMode}=useT();
  if(!mix||mix.total<=0) return null;
  const pc=v=>Math.round(v/mix.total*100);
  const rows=[["food","#1B6B20",mix.m.food.rev],["soft",t.bl,mix.soft],["beer",t.gold,mix.m.beer.rev],["spirits",t.pu,mix.m.spirits.rev]];
  return (<Card style={{padding:"1rem"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <IconBadge emoji="🍽️" color={t.gold}/>
      <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Chakula vs Vinywaji / Food vs Beverages</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      {[["🍛","Chakula / Food",mix.m.food.rev,t.gr],["🥂","Vinywaji / Beverages",mix.bev,t.bl]].map(([em,lb,v,col])=>(
        <div key={lb} style={{background:col+"14",border:"1px solid "+col+"44",borderRadius:12,padding:"10px",minWidth:0}}>
          <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,color:t.dim2}}>{em} {lb}</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:col,margin:"2px 0",overflowWrap:"anywhere"}}>{presenterMode?pc(v)+"%":fmt(v)}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{pc(v)}%</div>
        </div>))}
    </div>
    {rows.map(([k,col,v])=>(<div key={k} style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.text,marginBottom:3}}>
        <span style={{minWidth:0}}>{CLS_META[k].l}</span><span style={{flexShrink:0}}>{presenterMode?pc(v)+"%":fmt(v)}</span>
      </div>
      <Bar value={v} max={mix.total} color={col} h={6}/>
    </div>))}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
      <div style={{background:t.gr+"14",borderRadius:10,padding:"8px 10px"}}>
        <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase"}}>Bila Pombe / Non-alc</div>
        <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:800,color:t.gr}}>{presenterMode?pc(mix.soft)+"%":fmt(mix.soft)}</div>
      </div>
      <div style={{background:t.pu+"14",borderRadius:10,padding:"8px 10px"}}>
        <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase"}}>Pombe / Alcoholic</div>
        <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:800,color:t.pu}}>{presenterMode?pc(mix.alc)+"%":fmt(mix.alc)}</div>
      </div>
    </div>
    {!presenterMode&&mix.buyTotal>0&&<p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"10px 0 0"}}>Stock ya vinywaji iliyonunuliwa / Beverage stock bought: <b>{fmt(mix.buyTotal)}</b></p>}
  </Card>);
}
function RipodiTab() {
  const {t, presenterMode} = useT();
  const {allSales,allCosts,itemCosts,fetchRange,loading,goals,updateSale,deleteSale,updateCost,deleteCost,includeStaffCosts,toggleIncludeStaffCosts,customItems} = useAdmin();
  const [range,setRange]=useState("today");
  const [cStart,setCStart]=useState(today());
  const [cEnd,setCEnd]=useState(today());
  const [fetched,setFetched]=useState(false);
  const [editRec,setEditRec]=useState(null);
  const [editType,setEditType]=useState("sale");
  const [search,setSearch]=useState("");
  function getRangeDates(){
    const T2=new Date();const fmt=d=>dateStrET(d);
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
  const overheadFull=costs.reduce((s,c)=>s+c.amount,0);
  const staffCostsInRange=costs.filter(c=>c.category==="staff").reduce((s,c)=>s+c.amount,0);
  // "overhead" respects the Na/Bila Wafanyakazi toggle — drives the topline Gharama/Faida chips
  const overhead = includeStaffCosts ? overheadFull : (overheadFull - staffCostsInRange);
  const itemCostTotal=sales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0);
  const net=gross-itemCostTotal-overhead;
  const dailyCosts=costs.filter(c=>!c.spending_type||c.spending_type==="daily");
  const bulkCosts=costs.filter(c=>c.spending_type==="bulk");
  const searchLower = search.trim().toLowerCase();
  const filteredSales = searchLower ? sales.filter(s=>(s.item_name||"").toLowerCase().includes(searchLower)) : sales;
  const filteredCosts = searchLower ? costs.filter(c=>((c.description||"")+" "+(c.category||"")).toLowerCase().includes(searchLower)) : costs;
  const byDate=useMemo(()=>{const m={};sales.forEach(s=>{if(!m[s.sale_date])m[s.sale_date]={gross:0,count:0};m[s.sale_date].gross+=s.total_price;m[s.sale_date].count+=s.quantity;});return Object.entries(m).sort(([a],[b])=>b.localeCompare(a));},[sales]);
  const catMixR=useMemo(()=>computeCatMix(sales,costs,customItems),[sales,costs,customItems]);
  const wkGoal=range==="last7"&&goals.weekly?goals.weekly:null;
  const moGoal=range==="month"&&goals.monthly?goals.monthly:null;
  const inp={flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"};
  async function doFetch(){await fetchRange(start,end);setFetched(true);}
  function sendWA(){
    const lines=["RIPOTI — "+start+(start!==end?" hadi "+end:""),"Mapato Ghafi: "+fmt(gross),"Daily Costs: "+fmt(dailyCosts.reduce((s,c)=>s+c.amount,0)),"Bulk Purchases: "+fmt(bulkCosts.reduce((s,c)=>s+c.amount,0)),"Faida Halisi: "+fmt(net),"Mauzo: "+sales.length].concat(catMixR.total>0?["","Chakula/Food: "+fmt(catMixR.m.food.rev),"Vinywaji/Beverages: "+fmt(catMixR.bev),"  Bila Pombe/Non-alc: "+fmt(catMixR.soft),"  Bia/Beer: "+fmt(catMixR.m.beer.rev),"  Pombe Kali/Spirits: "+fmt(catMixR.m.spirits.rev)]:[]).concat(["","Unyamwezini Jiko La Bibi JJJ"]).join("\n");
    window.open("https://wa.me/?text="+encodeURIComponent(lines),"_blank");
  }
  function printZReport(){
    const w = window.open("","_blank");
    const salesRows = sales.map(s=>"<tr><td>"+s.sale_date+"</td><td>"+s.item_name+"</td><td style='text-align:center'>"+s.quantity+"</td><td style='text-align:right'>"+fmt(s.unit_price)+"</td><td style='text-align:right'>"+fmt(s.total_price)+"</td></tr>").join("");
    const costRows = costs.map(c=>"<tr><td>"+c.cost_date+"</td><td>"+(c.description||c.category)+"</td><td>"+(c.category||"")+"</td><td style='text-align:right'>"+fmt(c.amount)+"</td></tr>").join("");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Z-Report ${start} - ${end}</title>
      <style>
        body{font-family:Arial;max-width:800px;margin:0 auto;padding:30px;color:#0B1F45}
        h1{font-family:Georgia;font-size:20px;text-align:center;margin-bottom:2px}
        .sub{text-align:center;font-size:12px;color:#777;margin-bottom:20px}
        h2{font-size:14px;color:#B8860B;border-bottom:2px solid #B8860B;padding-bottom:4px;margin-top:24px}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
        th{text-align:left;border-bottom:2px solid #ddd;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#666}
        td{padding:6px 8px;border-bottom:1px solid #eee}
        .totals{display:flex;justify-content:space-between;background:#f5f5f5;border-radius:8px;padding:14px 18px;margin-top:16px}
        .totals div{text-align:center}
        .totals .label{font-size:10px;color:#777;text-transform:uppercase}
        .totals .val{font-size:16px;font-weight:bold;margin-top:2px}
        @media print{button{display:none}}
      </style></head><body>
      <h1>UNYAMWEZINI JIKO LA BIBI JJJ</h1>
      <p class="sub">Z-REPORT &middot; ${start}${start!==end?" hadi "+end:""} &middot; Imetengenezwa: ${new Date().toLocaleString("sw-TZ", {timeZone:"America/New_York", hour12:false})}</p>
      <div class="totals">
        <div><div class="label">Mapato Ghafi</div><div class="val" style="color:#B8860B">${fmt(gross)}</div></div>
        <div><div class="label">Gharama</div><div class="val" style="color:#C62828">${fmt(overhead)}</div></div>
        <div><div class="label">Faida Halisi</div><div class="val" style="color:${net>=0?'#1B7A20':'#C62828'}">${fmt(net)}</div></div>
        <div><div class="label">Mauzo</div><div class="val">${sales.length}</div></div>
      </div>
      ${catMixR.total>0?`<h2>Chakula vs Vinywaji / Food vs Beverages</h2>
      <table><tr><th>Aina</th><th style="text-align:right">Mauzo</th><th style="text-align:right">%</th></tr>
      ${[["Chakula / Food",catMixR.m.food.rev],["Vinywaji Jumla / Beverages",catMixR.bev],["&nbsp;&nbsp;Bila Pombe / Non-alcoholic",catMixR.soft],["&nbsp;&nbsp;Bia / Beer",catMixR.m.beer.rev],["&nbsp;&nbsp;Pombe Kali / Gin &amp; Spirits",catMixR.m.spirits.rev]].map(([l,v])=>"<tr><td>"+l+"</td><td style='text-align:right'>"+fmt(v)+"</td><td style='text-align:right'>"+Math.round(v/catMixR.total*100)+"%</td></tr>").join("")}</table>`:""}
      <h2>Mauzo / Sales (${sales.length})</h2>
      <table><tr><th>Tarehe</th><th>Bidhaa</th><th>Idadi</th><th>Bei</th><th>Jumla</th></tr>${salesRows||"<tr><td colspan=5 style='text-align:center;color:#999'>Hakuna mauzo</td></tr>"}</table>
      <h2>Gharama / Expenses (${costs.length})</h2>
      <table><tr><th>Tarehe</th><th>Maelezo</th><th>Aina</th><th>Kiasi</th></tr>${costRows||"<tr><td colspan=4 style='text-align:center;color:#999'>Hakuna gharama</td></tr>"}</table>
      <p style="margin-top:24px;font-size:10px;color:#999;text-align:center">Unyamwezini Jiko La Bibi JJJ &middot; Goba Njia Nne, Dar es Salaam</p>
      <button onclick="window.print()" style="display:block;margin:24px auto 0;padding:12px 28px;background:#B8860B;color:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer">🖨️ Print / Save PDF</button>
      </body></html>`);
    w.document.close();
  }
  return (
    <div style={{padding:"1rem"}}>
      <StaffCostToggle includeStaffCosts={includeStaffCosts} onToggle={toggleIncludeStaffCosts}/>
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
          <Chip label="Mapato Ghafi" value={presenterMode?"100%":fmt(gross)} color={t.gold} icon="💰"/>
          <Chip label="Faida Halisi" value={presenterMode?(gross?Math.round(net/gross*100):0)+"%":fmt(net)} color={net>=0?t.gr:t.rd} icon={net>=0?"📈":"📉"}/>
          <Chip label="Gharama Yote" value={presenterMode?(gross?Math.round(overhead/gross*100):0)+"%":fmt(overhead)} color={t.rd} icon="💸"/>
          <Chip label="Mauzo" value={sales.length} color={t.bl} icon="🧾"/>
        </div>
        <ComparisonRow range={range} cStart={cStart} cEnd={cEnd} currentGross={gross}/>
        <FoodDrinkCard mix={catMixR}/>
        {wkGoal&&<Card style={{padding:"1rem"}}><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>Weekly Goal</p><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text,fontWeight:700}}>Lengo la Wiki</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:goalColor(gross,wkGoal,t)}}>{fmt(gross)} / {fmt(wkGoal)}</span></div><Bar value={gross} max={wkGoal} color={goalColor(gross,wkGoal,t)}/></Card>}
        {moGoal&&<Card style={{padding:"1rem"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text,fontWeight:700}}>Lengo la Mwezi</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:goalColor(gross,moGoal,t)}}>{fmt(gross)} / {fmt(moGoal)}</span></div><Bar value={gross} max={moGoal} color={goalColor(gross,moGoal,t)}/></Card>}
        {sales.length>0 || costs.length>0 ? <Card style={{padding:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:t.bg4,borderRadius:10,padding:"8px 12px"}}>
            <i className="ti ti-search" style={{fontSize:15,color:t.dim2}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tafuta bidhaa au gharama / Search item or expense..." style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"sans-serif",fontSize:13,color:t.text}}/>
            {search && <button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:t.dim2,fontSize:14,cursor:"pointer",padding:0}}>✕</button>}
          </div>
        </Card> : null}
        {filteredSales.length>0&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Sales / Mauzo ({filteredSales.length}{search?" ya "+sales.length:""}) — Tap ✏️ to edit</p>
          {filteredSales.slice(0,20).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={r=>{setEditRec(r);setEditType("sale");}} i={i}/>)}
        </Card>}
        {filteredCosts.length>0&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Expenses / Gharama ({filteredCosts.length}{search?" ya "+costs.length:""}) — Tap ✏️ to edit</p>
          {!search && <>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text}}>Daily / Kila Siku</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.bl}}>{fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:t.text}}>Bulk / Jumla</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.pu}}>{fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}</span></div>
          </>}
          {filteredCosts.slice(0,15).map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={r=>{setEditRec(r);setEditType("cost");}} i={i}/>)}
        </Card>}
        {search && filteredSales.length===0 && filteredCosts.length===0 && <Card style={{padding:"1.5rem",textAlign:"center"}}>
          <p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,margin:0}}>Hakuna matokeo ya "{search}" / No results for "{search}"</p>
        </Card>}
        {byDate.length>1&&<Card style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>By Day / Kwa Siku</p>
          {byDate.map(([d,v])=><div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+t.border+"66"}}><span style={{fontFamily:"sans-serif",fontSize:"12px",color:t.text}}>{d}</span><div style={{textAlign:"right"}}><span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:t.gold}}>{fmt(v.gross)}</span><span style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,marginLeft:6}}>{v.count}</span></div></div>)}
        </Card>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={sendWA} style={{flex:1,background:"rgba(37,211,102,0.12)",color:"#25d366",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Send Report / Tuma Ripoti</button>
          <button onClick={printZReport} style={{flex:1,background:t.gold+"12",color:t.gold,border:"1px solid "+t.gold+"44",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <i className="ti ti-printer"/> Z-Report
          </button>
        </div>
      </>}
      {editRec&&<EditModal type={editType} record={editRec} onSave={editType==="sale"?updateSale:updateCost} onDelete={editType==="sale"?deleteSale:deleteCost} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 4: MALENGO ═══ */
const BUSINESS_START_DATE = "2026-05-06"; // Siku ya kwanza ya biashara / Business launch date

function MalengoTab() {
  const {t, presenterMode} = useT();
  const {goals,setGoal,todayGross,allSales,fetchRange,todaySales,customItems} = useAdmin();
  const [dv,setDv]=useState(String(goals.daily||""));
  const [wv,setWv]=useState(String(goals.weekly||""));
  const [mv,setMv]=useState(String(goals.monthly||""));
  const [saved,setSaved]=useState(false);
  const [growthPct,setGrowthPct]=useState(15);
  const [loadedAll,setLoadedAll]=useState(false);
  // Keep input fields synced with saved goals so values persist when switching tabs
  useEffect(()=>{
    if(goals.daily) setDv(String(goals.daily));
    if(goals.weekly) setWv(String(goals.weekly));
    if(goals.monthly) setMv(String(goals.monthly));
  },[goals.daily,goals.weekly,goals.monthly]);
  // Load the ENTIRE sales history since business launch so suggestions reflect the whole journey, not just a recent slice
  useEffect(()=>{
    if(!loadedAll){
      fetchRange(BUSINESS_START_DATE, today());
      setLoadedAll(true);
    }
  },[loadedAll]);
  const ws=new Date();ws.setDate(ws.getDate()-daysSinceWeekStart(ws.getDay()));   // week starts Saturday
  const ms=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkG=allSales.filter(s=>s.sale_date>=dateStrET(ws)).reduce((s,r)=>s+r.total_price,0);
  const moG=allSales.filter(s=>s.sale_date>=dateStrET(ms)).reduce((s,r)=>s+r.total_price,0);

  // ═══ MCHANGANYIKO WA MALENGO / GOAL MIX — food vs beverage contribution to each goal (no new DB columns) ═══
  const goalMix=useMemo(()=>{
    const wsS=dateStrET(ws), msS=dateStrET(ms);
    const wkS=allSales.filter(s=>s.sale_date>=wsS), moS=allSales.filter(s=>s.sale_date>=msS);
    const hist=computeCatMix(allSales.filter(s=>s.sale_date>=BUSINESS_START_DATE),[],customItems);
    return {
      day:computeCatMix(todaySales||[],[],customItems),
      wk:computeCatMix(wkS,[],customItems),
      mo:computeCatMix(moS,[],customItems),
      foodShare:hist.total>0?hist.m.food.rev/hist.total:null,
      softShare:hist.total>0?hist.soft/hist.total:0,
      alcShare:hist.total>0?hist.alc/hist.total:0
    };
  },[allSales,todaySales,customItems]);

  // ═══ DATA-DRIVEN GOAL SUGGESTIONS — ALL-TIME HISTORY ═══
  // Daily/Weekly use the full lifetime average per operating day (since business launch).
  // Monthly is anchored explicitly to LAST MONTH'S actual total, so the goal is literally "beat last month."
  const suggestion = useMemo(()=>{
    const all = allSales.filter(s=>s.sale_date>=BUSINESS_START_DATE);
    const byDate = {};
    all.forEach(s=>{ byDate[s.sale_date]=(byDate[s.sale_date]||0)+s.total_price; });
    const activeDays = Object.keys(byDate).length;
    if(activeDays===0) return null;
    const totalAll = all.reduce((s,r)=>s+r.total_price,0);
    const avgPerActiveDay = totalAll/activeDays;
    const growth = 1+(growthPct/100);

    // Last full calendar month's actual total (for "beat last month")
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lmStartStr = dateStrET(lastMonthStart);
    const lmEndStr = dateStrET(lastMonthEnd);
    const lastMonthTotal = all.filter(s=>s.sale_date>=lmStartStr&&s.sale_date<=lmEndStr).reduce((s,r)=>s+r.total_price,0);
    const lastMonthName = lastMonthStart.toLocaleDateString("sw-TZ",{month:"long",year:"numeric",timeZone:"America/New_York"});

    const sDaily = Math.round(avgPerActiveDay*growth/500)*500; // round to nearest 500 TZS
    const sWeekly = sDaily*6;   // siku 6 za kazi kwa wiki (Jumapili imefungwa)
    // Monthly goal: beat last month by the chosen growth % (falls back to daily*26 if no data last month yet)
    const sMonthly = lastMonthTotal>0
      ? Math.round(lastMonthTotal*growth/500)*500
      : sDaily*26;

    return { activeDays, avgPerActiveDay, sDaily, sWeekly, sMonthly, lastMonthTotal, lastMonthName, totalAll };
  },[allSales,growthPct]);

  function applySuggestion(){
    if(!suggestion) return;
    setDv(String(suggestion.sDaily));
    setWv(String(suggestion.sWeekly));
    setMv(String(suggestion.sMonthly));
  }

  const [malengoPreview,setMalengoPreview]=useState(null);
  function pct(cur,goal){ return goal>0 ? Math.round(cur/goal*100) : 0; }
  function sendMalengoReport(){
    // Use the CURRENT input box values (dv/wv/mv), not the saved `goals` object —
    // this guarantees the report always matches exactly what's on screen right now,
    // even if you haven't tapped "Save Goals" yet.
    const dGoal = parseInt(dv)||0, wGoal = parseInt(wv)||0, mGoal = parseInt(mv)||0;
    const lines = [
      `🎯 *RIPOTI YA MALENGO / GOALS REPORT*`,
      `📅 ${new Date().toLocaleDateString("sw-TZ",{day:"numeric",month:"long",year:"numeric",timeZone:"America/New_York"})}`,
      ``,
    ];
    if(dGoal>0) lines.push(`📆 Leo/Today: ${fmt(todayGross)} / ${fmt(dGoal)} (${pct(todayGross,dGoal)}%)`);
    if(wGoal>0) lines.push(`🗓️ Wiki/Week: ${fmt(wkG)} / ${fmt(wGoal)} (${pct(wkG,wGoal)}%)`);
    if(mGoal>0) lines.push(`📈 Mwezi/Month: ${fmt(moG)} / ${fmt(mGoal)} (${pct(moG,mGoal)}%)`);
    if(!dGoal && !wGoal && !mGoal) lines.push(`Hakuna malengo yaliyowekwa bado. / No goals set yet.`);
    const mixLine=(lbl,m)=>m.total>0?`   ${lbl}: 🍛 ${fmt(m.m.food.rev)} · 🥤 ${fmt(m.soft)} · 🍺🥃 ${fmt(m.alc)}`:null;
    const ml=[dGoal>0&&mixLine("Leo",goalMix.day),wGoal>0&&mixLine("Wiki",goalMix.wk),mGoal>0&&mixLine("Mwezi",goalMix.mo)].filter(Boolean);
    if(ml.length){ lines.push(``,`🍽️ *Chakula · Bila Pombe · Pombe / Food · Non-alc · Alcohol:*`); ml.forEach(l=>lines.push(l)); }
    if(suggestion && suggestion.lastMonthTotal>0){
      lines.push(``,`🏆 ${suggestion.lastMonthName}: ${fmt(suggestion.lastMonthTotal)}`);
    }
    lines.push(``,`— Unyamwezini Jiko La Bibi JJJ`);
    setMalengoPreview(lines.join("\n"));
  }

  function save(){if(dv)setGoal("daily",dv);if(wv)setGoal("weekly",wv);if(mv)setGoal("monthly",mv);setSaved(true);setTimeout(()=>setSaved(false),2000);}
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:"2px solid ",background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{padding:"1rem"}}>
      {(goals.daily||goals.weekly||goals.monthly)>0&&<Card glow style={{padding:"1.4rem",marginBottom:10}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 16px"}}>Current Progress / Maendeleo ya Sasa</p>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {goals.daily>0&&<Ring label="Leo/Today" current={todayGross} goal={goals.daily} color={goalColor(todayGross,goals.daily,t)} size={82} showGoal/>}
          {goals.weekly>0&&<Ring label="Wiki/Week" current={wkG} goal={goals.weekly} color={goalColor(wkG,goals.weekly,t)} size={82} showGoal/>}
          {goals.monthly>0&&<Ring label="Mwezi/Month" current={moG} goal={goals.monthly} color={goalColor(moG,goals.monthly,t)} size={82} showGoal/>}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr,display:"inline-block"}}/>90%+</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gold,display:"inline-block"}}/>50-89%</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.rd,display:"inline-block"}}/>&lt;50%</span>
        </div>
      </Card>}
      {(goals.daily>0||goals.weekly>0||goals.monthly>0)&&(goalMix.day.total>0||goalMix.wk.total>0||goalMix.mo.total>0)&&<Card style={{padding:"1.2rem",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <IconBadge emoji="🍽️" color={t.gold}/>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Mchanganyiko wa Malengo / Goal Mix: Chakula vs Vinywaji</p>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 12px",lineHeight:1.5}}>Kila lengo limejazwa na nini? / What is filling each goal?</p>
        {[["Leo / Today",goals.daily,goalMix.day],["Wiki / Week",goals.weekly,goalMix.wk],["Mwezi / Month",goals.monthly,goalMix.mo]].filter(([,g])=>g>0).map(([lb,g,m])=>{
          const w=v=>Math.min(100,Math.max(0,v/g*100));
          const wf=w(m.m.food.rev), ws2=Math.min(100-wf,w(m.soft)), wa=Math.min(100-wf-ws2,w(m.alc));
          return (<div key={lb} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.text,marginBottom:5}}>
              <span>{lb}</span><span style={{color:t.dim2,fontWeight:600}}>{presenterMode?pct(m.total,g)+"%":fmt(m.total)+" / "+fmt(g)}</span>
            </div>
            <div style={{display:"flex",height:10,borderRadius:99,overflow:"hidden",background:t.border+"55"}}>
              <div style={{width:wf+"%",background:t.gr}}/><div style={{width:ws2+"%",background:t.bl}}/><div style={{width:wa+"%",background:t.pu}}/>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"2px 12px",marginTop:5,fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>
              <span>🍛 {presenterMode?pct(m.m.food.rev,g)+"%":fmt(m.m.food.rev)}</span>
              <span>🥤 {presenterMode?pct(m.soft,g)+"%":fmt(m.soft)}</span>
              <span>🍺🥃 {presenterMode?pct(m.alc,g)+"%":fmt(m.alc)}</span>
            </div>
            {!presenterMode&&goalMix.foodShare!==null&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:4,fontStyle:"italic"}}>
              Kulenga / Aim: 🍛 ~{fmt(Math.round(g*goalMix.foodShare/500)*500)} · 🥤 ~{fmt(Math.round(g*goalMix.softShare/500)*500)} · 🍺🥃 ~{fmt(Math.round(g*goalMix.alcShare/500)*500)}
            </div>}
          </div>);
        })}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr}}/>Chakula/Food</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.bl}}/>Bila Pombe/Non-alc</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.pu}}/>Pombe/Alcohol</span>
        </div>
        {!presenterMode&&goalMix.foodShare!==null&&<p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"8px 0 0",lineHeight:1.5}}>"Kulenga/Aim" inatumia mchanganyiko wa kawaida wa mauzo yako yote ({Math.round(goalMix.foodShare*100)}% chakula). / "Aim" uses your all-time sales mix ({Math.round(goalMix.foodShare*100)}% food).</p>}
      </Card>}
      {suggestion ? (
        <Card glow style={{padding:"1.2rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <IconBadge emoji="🎯" color={t.gold}/>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Pendekezo la Malengo / Suggested Goals</p>
          </div>
          <p style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim,margin:"8px 0 12px",lineHeight:1.6}}>
            Kutokana na siku {suggestion.activeDays} za mauzo halisi tangu {BUSINESS_START_DATE} (mauzo yote / all-time), {presenterMode ? <>wastani wa siku umehesabiwa kutoka <b style={{color:t.gold}}>{suggestion.activeDays}</b> siku za uendeshaji.</> : <>wastani wa mauzo kwa siku ni <b style={{color:t.gold}}>{fmt(Math.round(suggestion.avgPerActiveDay))}</b>. Jumla ya mauzo yote: <b style={{color:t.gold}}>{fmt(suggestion.totalAll)}</b>.</>}
          </p>
          {suggestion.lastMonthTotal>0 && (
            <div style={{background:t.gold+"10",border:"1px solid "+t.gold+"33",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
              <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim,margin:0,lineHeight:1.6}}>
                🏆 <b>{suggestion.lastMonthName}</b> {presenterMode ? <>ilikuwa msingi (100%) wa lengo hili.</> : <>ulipata <b style={{color:t.gold}}>{fmt(suggestion.lastMonthTotal)}</b>.</>} Lengo la mwezi huu limewekwa kupita hilo kwa +{growthPct}%. / This month's goal is set to beat last month by +{growthPct}%.
              </p>
            </div>
          )}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:t.dim2,marginBottom:6}}>
              <span>Ukuaji Unaotarajiwa / Growth Target</span><span style={{fontWeight:700,color:t.gold}}>+{growthPct}%</span>
            </div>
            <div style={{display:"flex",gap:5}}>
              {[5,10,15,20,25].map(p=>(
                <button key={p} onClick={()=>setGrowthPct(p)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:"1px solid "+(growthPct===p?t.gold:t.border),background:growthPct===p?t.gold+"18":"transparent",color:growthPct===p?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:11,fontWeight:growthPct===p?700:400,cursor:"pointer"}}>+{p}%</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            <div style={{background:t.gold+"12",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textTransform:"uppercase"}}>Kila Siku</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.gold,marginTop:2}}>{presenterMode?"+"+growthPct+"%":fmt(suggestion.sDaily)}</div>
              {!presenterMode && goals.daily>0 && <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:3}}>Sasa/Now: {fmt(goals.daily)}</div>}
            </div>
            <div style={{background:t.bl+"12",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textTransform:"uppercase"}}>Kila Wiki</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.bl,marginTop:2}}>{presenterMode?"+"+growthPct+"%":fmt(suggestion.sWeekly)}</div>
              {!presenterMode && goals.weekly>0 && <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:3}}>Sasa/Now: {fmt(goals.weekly)}</div>}
            </div>
            <div style={{background:t.gr+"12",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textTransform:"uppercase"}}>Kila Mwezi{suggestion.lastMonthTotal>0?" 🏆":""}</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.gr,marginTop:2}}>{presenterMode?"+"+growthPct+"%":fmt(suggestion.sMonthly)}</div>
              {!presenterMode && goals.monthly>0 && <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:3}}>Sasa/Now: {fmt(goals.monthly)}</div>}
            </div>
          </div>
          <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"0 0 12px",fontStyle:"italic",textAlign:"center"}}>
            "Sasa/Now" ni lengo lako linalotumika sasa hivi. Bonyeza chini kubadilisha kwenda kwenye hii pendekezo. / "Now" is your currently active goal. Tap below to switch to this suggestion instead.
          </p>
          <button onClick={applySuggestion} style={{width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <i className="ti ti-wand"/> Tumia Pendekezo / Apply Suggestion
          </button>
        </Card>
      ) : (
        <Card style={{padding:"1.2rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,margin:0,textAlign:"center"}}>Bado hakuna mauzo ya kutosha kufanya pendekezo. Rekodi mauzo zaidi kwanza. / Not enough sales data yet to suggest goals. Record more sales first.</p>
        </Card>
      )}
      <Card style={{padding:"1.2rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 4px"}}>Malengo Yanayotumika Sasa / Currently Active Goals</p>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 16px",lineHeight:1.5}}>
          Haya ndiyo malengo yanayoonyeshwa kwenye pete za Maendeleo ya Sasa hapo juu na Leo/Ripoti. / These are the goals actually shown on the Current Progress rings above and on Leo/Ripoti — not the suggestion, unless you tap "Apply Suggestion".
        </p>
        {[[t.gold,"Daily Goal / Lengo la Kila Siku",dv,setDv],[t.bl,"Weekly Goal / Lengo la Wiki",wv,setWv],[t.gr,"Monthly Goal / Lengo la Mwezi",mv,setMv]].map(([color,label,val,setter])=><div key={label} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:color}}/><label style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color}}>{label}</label></div>
          <input type="number" value={val} onChange={e=>setter(e.target.value)} placeholder="0" style={{...inp,borderColor:color+"44"}}/>
          {val&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color,margin:"3px 0 0",opacity:0.8}}>{fmt(val)}</p>}
        </div>)}
        <button onClick={save} style={{width:"100%",background:saved?"linear-gradient(135deg,"+t.gr+",#009940)":"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.3s"}}>
          {saved?"✓ Saved! / Imehifadhiwa!":"Save Goals / Hifadhi Malengo"}
        </button>
      </Card>
      <button onClick={sendMalengoReport} style={{width:"100%",background:"rgba(37,211,102,0.12)",color:"#25d366",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <i className="ti ti-brand-whatsapp"/> Tuma Ripoti ya Malengo / Send Goals Report
      </button>
      <ReportPreviewModal text={malengoPreview} onClose={()=>setMalengoPreview(null)}/>
    </div>
  );
}

/* ═══ TAB 5: AKILI ═══ */
function AkiliTab() {
  const {t, presenterMode} = useT();
  const {allSales,allCosts,itemCosts,fetchRange,stockQty,customItems,menuEdits={},goals,setCompassTarget,includeStaffCosts,toggleIncludeStaffCosts,staff,showFullWeek,toggleShowFullWeek,closedWeekday} = useAdmin();
  const [akiliRange,setAkiliRange]=useState("30days");
  const [topItemsN,setTopItemsN]=useState(10);
  const [slowN,setSlowN]=useState(6);
  const [stockN,setStockN]=useState(10);
  const [advisorN,setAdvisorN]=useState(3);
  const [akiliCustomStart,setAkiliCustomStart]=useState(today());
  const [akiliCustomEnd,setAkiliCustomEnd]=useState(today());
  function getAkiliRangeDates(){
    const now=new Date();
    const fmtD=d=>dateStrET(d);
    if(akiliRange==="30days"){ const s=new Date(Date.now()-29*86400000); return {start:fmtD(s),end:today(),label:"Siku 30 / Last 30 Days"}; }
    if(akiliRange==="month"){ const s=new Date(now.getFullYear(),now.getMonth(),1); return {start:fmtD(s),end:today(),label:"Mwezi Huu / This Month"}; }
    if(akiliRange==="alltime"){ return {start:BUSINESS_START_DATE,end:today(),label:"Muda Wote / All-Time"}; }
    return {start:akiliCustomStart,end:akiliCustomEnd,label:"Tarehe Maalum / Custom"};
  }
  const {start:rangeStart,end:rangeEnd,label:rangeLabel} = getAkiliRangeDates();
  useEffect(()=>{ fetchRange(rangeStart,rangeEnd); },[akiliRange,akiliCustomStart,akiliCustomEnd]);
  const s30=allSales.filter(s=>s.sale_date>=rangeStart&&s.sale_date<=rangeEnd);
  const c30=allCosts.filter(c=>c.cost_date>=rangeStart&&c.cost_date<=rangeEnd);
  const gross=s30.reduce((s,r)=>s+r.total_price,0);
  const costsFull30=c30.reduce((s,c)=>s+c.amount,0);
  const staffCostsForToggle30 = c30.filter(c=>c.category==="staff").reduce((s,c)=>s+c.amount,0);
  // "costs" respects the global Na/Bila Wafanyakazi toggle — drives Faida/Margin/Health/Insights view-wide
  const costs = includeStaffCosts ? costsFull30 : (costsFull30 - staffCostsForToggle30);
  const net=gross-costs;
  const margin=gross?Math.round(net/gross*100):0;

  // ═══ DIRA YA BIASHARA / BUSINESS COMPASS ═══
  // Revenue-to-cost ratio, shown as "1 : X" — X<1 losing, ~1 breaking even, >1 progressing.
  // Two versions: including staff payroll, and excluding it (so payroll-heavy months don't hide operational health).
  const staffCosts30 = staffCostsForToggle30;
  const costsExStaff30 = costsFull30 - staffCosts30;
  const compassFull = costsFull30>0 ? gross/costsFull30 : (gross>0?99:0);
  const compassExStaff = costsExStaff30>0 ? gross/costsExStaff30 : (gross>0?99:0);
  const compassTarget = goals.compassTarget || 2;
  const [editingTarget,setEditingTarget]=useState(false);
  const [targetInput,setTargetInput]=useState(String(compassTarget));
  function saveTarget(){
    const v = parseFloat(targetInput);
    if(v>0){ setCompassTarget(v); }
    setEditingTarget(false);
  }
  function compassZone(r){
    if(r>=compassTarget) return {label:"Umefikia Lengo!", labelEn:"Target Reached!", color:t.gr};
    if(r>=1.05) return {label:"Unaendelea", labelEn:"Progressing", color:t.gr};
    if(r>=0.95) return {label:"Sawa Sawa", labelEn:"Breaking Even", color:t.gold};
    return {label:"Unapoteza", labelEn:"Losing Ground", color:t.rd};
  }
  const itemStats=useMemo(()=>{const m={};s30.forEach(s=>{if(!m[s.item_id])m[s.item_id]={id:s.item_id,name:s.item_name,qty:0,rev:0,cost:0};m[s.item_id].qty+=s.quantity;m[s.item_id].rev+=s.total_price;m[s.item_id].cost+=(itemCosts[s.item_id]||0)*s.quantity;});return Object.values(m).map(i=>({...i,profit:i.rev-i.cost,margin:i.rev?Math.round((i.rev-i.cost)/i.rev*100):0})).sort((a,b)=>b.rev-a.rev);},[s30,itemCosts]);
  const customSecMap=useMemo(()=>{const m={};customItems.forEach(c=>{m[c.id]=c.sectionName||"";});return m;},[customItems]);
  const catMix=useMemo(()=>{
    const m={food:{rev:0,qty:0},soft:{rev:0,qty:0},beer:{rev:0,qty:0},spirits:{rev:0,qty:0}};
    s30.forEach(r=>{const k=classifyItem(r.item_id,r.section_id,r.item_name,customSecMap);m[k].rev+=r.total_price||0;m[k].qty+=r.quantity||0;});
    const buy={soft:0,beer:0,spirits:0};
    c30.forEach(c=>{if(c.category==="bulk_cold_drinks")buy.soft+=c.amount;else if(c.category==="bulk_beer")buy.beer+=c.amount;else if(c.category==="bulk_spirits")buy.spirits+=c.amount;});
    const bev=m.soft.rev+m.beer.rev+m.spirits.rev, alc=m.beer.rev+m.spirits.rev;
    const total=m.food.rev+bev;
    return {m,buy,bev,alc,soft:m.soft.rev,total,bevQty:m.soft.qty+m.beer.qty+m.spirits.qty,alcQty:m.beer.qty+m.spirits.qty,buyTotal:buy.soft+buy.beer+buy.spirits};
  },[s30,c30,customSecMap]);
  const [topFilter,setTopFilter]=useState("all");
  const itemCls=useMemo(()=>{const o={};s30.forEach(r=>{if(!(r.item_id in o))o[r.item_id]=classifyItem(r.item_id,r.section_id,r.item_name,customSecMap);});return o;},[s30,customSecMap]);
  const itemsView=itemStats.filter(i=>{const c=itemCls[i.id]||"food";return topFilter==="all"||topFilter===c;});
  // Wiki Hii vs Wiki Iliyopita — like-for-like (same weekdays), Saturday-start
  const wkCmp=useMemo(()=>computeWeekCmp(allSales,customItems),[allSales,customItems]);
  useEffect(()=>{ const d=new Date(today()+"T12:00:00"); d.setDate(d.getDate()-16); fetchRange(dateStrET(d),today()); },[]);
  const svcMap=useMemo(()=>{const m={pickup:0,delivery:0,dinein:0};s30.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});return m;},[s30]);
  const CATEGORY_LABELS = {
    gas:"Gas/Gesi", staff:"Staff/Wafanyakazi", ingredients:"Ingredients/Malighafi",
    bulk_ingredients:"Ingredients/Malighafi", rent:"Rent/Pango",
    equipment:"Equipment/Vifaa", marketing:"Marketing", other:"Nyingine/Other",
    bulk_cold_drinks:"Vinywaji Baridi/Cold Drinks", bulk_beer:"Bia/Beer", bulk_spirits:"Pombe Kali/Gin & Spirits",
  };
  const costMap=useMemo(()=>{
    const staffNameSet = new Set((staff||[]).map(s=>s.name));
    const m={};
    c30.forEach(c=>{
      let label;
      if(c.category==="staff" && c.description && staffNameSet.has(c.description.trim())){
        // Staff costs: keep grouping by the individual staff member's name — this is
        // intentional and lets Margin Advisor give per-person scheduling advice.
        // Guarded by staffNameSet so a miscategorized expense (e.g. a bulk grocery
        // note accidentally logged under "Staff") can't hijack this path — if the
        // description isn't an actual name on the roster, it falls through below.
        label = c.description.trim().charAt(0).toUpperCase() + c.description.trim().slice(1);
      } else {
        // Everything else: group by the structured category, NOT the free-text description.
        // A dozen different grocery-run notes ("Mchele, Unga... wiki 20-27", "Manunuzi ya
        // wiki ijayo", etc.) all describe the same underlying cost driver and must roll up
        // into one total — otherwise every individual bulk purchase fragments into its own
        // slice, and the Margin Advisor ends up "advising" on a single week's grocery note
        // instead of the true Ingredients total for the whole selected period.
        label = CATEGORY_LABELS[c.category] || "Nyingine/Other";
      }
      m[label]=(m[label]||0)+c.amount;
    });
    // Limit to top 8 slices, group rest as "Nyingine / Other"
    const entries = Object.entries(m).sort((a,b)=>b[1]-a[1]);
    if(entries.length > 8){
      const top = entries.slice(0, 7);
      const rest = entries.slice(7).reduce((s,[,v])=>s+v, 0);
      return Object.fromEntries([...top, ["Nyingine / Other", rest]]);
    }
    return m;
  },[c30,staff]);
  const PALETTE=[t.gold,t.bl,t.gr,t.rd,t.pu,"#FF9800","#00BCD4","#8BC34A"];
  const svcData=[{label:"Pickup/Kuchukua",value:svcMap.pickup,color:t.bl},{label:"Delivery",value:svcMap.delivery,color:t.gr},{label:"Dine-in/Kula Hapa",value:svcMap.dinein,color:t.pu}].filter(d=>d.value>0);
  const costData=Object.entries(costMap).map(([k,v],i)=>({label:k,value:v,color:PALETTE[i%PALETTE.length]}));
  // Kishauri cha Faida / Margin Advisor — turns the cost breakdown into concrete next steps
  const marginAdvice = useMemo(()=>{
    if(gross<=0 || Object.keys(costMap).length===0) return null;
    const staffNames = new Set((staff||[]).map(s=>s.name));
    function adviceFor(label){
      const l = label.toLowerCase();
      if(staffNames.has(label)) return ["Angalia masaa yake dhidi ya mauzo halisi ya zamu zake / Review their scheduled hours against actual sales during their shifts.","Fikiria mafunzo ya kazi mbalimbali ili masaa machache yaweze kufunika / Consider cross-training so fewer staff can cover slow hours.","Linganisha ratiba yake na Siku/Saa Bora — mpange zaidi siku zenye mauzo mengi / Match their schedule to your Best Day/Hour data — schedule them more on peak times."];
      if(/malighafi|ingredient|chakula|mboga|nyama|raw material|food cost/.test(l)) return ["Linganisha bei za wauzaji wengine mwezi huu / Compare at least one alternative supplier's prices this month.","Kagua kiasi cha malighafi kwenye bidhaa zinazouzwa zaidi — ziada kidogo kwa wingi inagharimu / Check portion sizes on your top sellers — small over-portioning adds up fast at volume.","Fuatilia upotevu/uharibifu kwa wiki moja peke yake kuona kama ndio chanzo, si bei ya ununuzi / Track waste/spoilage separately for a week to see if that — not purchase price — is the real driver.","Fikiria kupandisha bei kidogo (5-8%) kwenye bidhaa zinazotumia malighafi nyingi zaidi / Consider a small 5-8% price increase on items that eat the most ingredient cost."];
      if(/umeme|stima|electric|gesi|gas|maji|water/.test(l)) return ["Kagua kama vifaa vinaachwa vikiwaka nje ya saa za kazi / Check if equipment is left running outside business hours.","Linganisha matumizi ya mwezi huu na mwezi uliopita — ongezeko la ghafla mara nyingi ni kifaa kimoja / Compare this month's usage to last month's — a sudden jump usually means one appliance is the problem.","Kama ni gesi, kagua uvujaji — uvujaji mdogo unaweza kuongeza gharama maradufu bila kujua / If it's gas, check for leaks — a slow leak can quietly double the bill."];
      if(/kodi|rent|pango/.test(l)) return ["Kodi kwa kawaida ni gharama isiyobadilika — njia bora ni kuongeza mauzo ili asilimia yake ipungue, si kukata kodi / Rent is usually fixed — the lever here is growing revenue to shrink its share, not cutting the rent itself.","Elekeza nguvu kwenye ukuaji (matangazo, masaa, delivery) badala ya kujaribu kupunguza kodi katikati ya mkataba / Focus on growth (promotions, hours, delivery) rather than renegotiating mid-lease."];
      if(/usafiri|fuel|mafuta|transport|delivery/.test(l)) return ["Kusanya maagizo ya delivery kwa eneo/muda badala ya safari moja moja / Batch deliveries by neighborhood/time window instead of one trip at a time.","Fikiria kiwango cha chini cha oda ya delivery ili kufidia gharama ya mafuta kwa kila safari / Consider a minimum order size for delivery to offset fuel cost per trip."];
      if(/vifungashio|packaging|chupa|mifuko/.test(l)) return ["Linganisha bei za jumla kutoka kwa wauzaji tofauti wa vifungashio / Compare bulk pricing from different packaging suppliers.","Kagua kama oda za kuchukua/kula hapa zinapewa vifungashio vya delivery bila sababu / Check if pickup/dine-in orders are getting delivery-grade packaging unnecessarily."];
      return ["Pata mchanganuo wa kina wa kilichomo humu — 'Nyingine/Other' isiyoeleweka mara nyingi inaficha gharama moja inayoweza kurekebishwa / Get an itemized breakdown of what's in this bucket — a vague 'Other' category often hides one fixable expense.","Linganisha kiasi cha mwezi huu na mwezi uliopita, na uangalie kama kimeongezeka bila sababu / Compare this month's amount to last month's and flag any unexplained jump."];
    }
    const entries = Object.entries(costMap).map(([label,value])=>({label,value,pct:Math.round(value/gross*100)})).sort((a,b)=>b.value-a.value);
    const top = entries.filter(e=>e.pct>=5).map(e=>({...e,tips:adviceFor(e.label)}));
    if(top.length===0) return null;
    const targetCosts = compassTarget>0 ? gross/compassTarget : null;
    const cutNeeded = targetCosts!==null ? Math.max(0,Math.round(costs-targetCosts)) : 0;
    const pctCutOfTop = (cutNeeded>0 && top[0].value>0) ? Math.min(100,Math.round(cutNeeded/top[0].value*100)) : 0;
    return {top, cutNeeded, pctCutOfTop, topLabel:top[0].label};
  },[costMap,gross,costs,staff,compassTarget]);
  const health=Math.min(100,Math.max(0,50+(margin/100*30)+(itemStats.length>5?10:0)+(gross>500000?10:0)));
  const hc=health>=70?t.gr:health>=40?t.gold:t.rd;
  // Low-stock prediction: sales velocity per item over last 14 days
  const stockPredictions = useMemo(()=>{
    const s14 = allSales.filter(s=>s.sale_date>=dateStrET(new Date(Date.now()-14*86400000)));
    const velo = {};
    s14.forEach(s=>{
      if(!velo[s.item_id]) velo[s.item_id]={name:s.item_name,qty:0,days:new Set()};
      velo[s.item_id].qty+=s.quantity;
      velo[s.item_id].days.add(s.sale_date);
    });
    return Object.entries(velo).map(([id,v])=>{
      const activeDays = Math.max(v.days.size,1);
      const perDay = v.qty/14; // average over full 14-day window (accounts for gaps)
      return {id,name:v.name,perDay,qty14:v.qty};
    }).filter(p=>p.perDay>0).sort((a,b)=>b.perDay-a.perDay);
  },[allSales]);

  // Best day/hour analysis — uses created_at timestamps from last 30 days
  const dayHourAnalysis = useMemo(()=>{
    const dayNames = ["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"];
    const byDay = {}; // 0-6 -> revenue
    const byHour = {}; // 0-23 -> revenue
    s30.forEach(s=>{
      // "Best Day" MUST use sale_date (the intended/real day of the sale), never created_at.
      // created_at is just when the record was TYPED IN — backfilling past sales in one sitting
      // would otherwise wrongly attribute weeks of historical sales to whatever real-world day
      // the data entry happened on (e.g. a bulk catch-up session on a Sunday making Sunday look
      // like the best day, even if the business is closed Sundays).
      if(s.sale_date){
        const [y,m,d] = s.sale_date.split("-").map(Number);
        const dayOfWeek = new Date(y, m-1, d).getDay(); // local calendar date, no UTC shift
        byDay[dayOfWeek] = (byDay[dayOfWeek]||0) + s.total_price;
      }
      // "Best Hour" genuinely needs a clock time, which only created_at has. To avoid the same
      // backfill-pollution problem, only count entries made the SAME calendar day they're for
      // (i.e. real-time entries), so a bulk backfill session doesn't fake a "peak hour."
      if(s.created_at && s.sale_date){
        const entryDateStr = dateStrET(new Date(s.created_at));
        if(entryDateStr===s.sale_date){
          const hour = new Date(s.created_at).getHours();
          byHour[hour] = (byHour[hour]||0) + s.total_price;
        }
      }
    });
    const dayEntries = Object.entries(byDay).sort((a,b)=>b[1]-a[1]);
    let hourEntries = Object.entries(byHour).sort((a,b)=>b[1]-a[1]);
    let hourIsEstimate = false;
    // Fallback: if literally no same-day (real-time) entries exist yet, use created_at hours anyway
    // so the card isn't just empty — but flag it as an estimate since it may include backfilled data.
    if(hourEntries.length===0){
      const byHourFallback = {};
      s30.forEach(s=>{ if(s.created_at){ const h=new Date(s.created_at).getHours(); byHourFallback[h]=(byHourFallback[h]||0)+s.total_price; } });
      hourEntries = Object.entries(byHourFallback).sort((a,b)=>b[1]-a[1]);
      hourIsEstimate = true;
    }
    const bestDay = dayEntries[0] ? {name:dayNames[dayEntries[0][0]], rev:dayEntries[0][1]} : null;
    const bestHour = hourEntries[0] ? {hour:parseInt(hourEntries[0][0]), rev:hourEntries[0][1], isEstimate:hourIsEstimate} : null;
    const dayChartFull = [6,0,1,2,3,4,5].map(i=>({name:dayNames[i],dow:i,rev:byDay[i]||0}));   // Saturday first
    const dayChart = showFullWeek ? dayChartFull : dayChartFull.filter(d=>d.dow!==closedWeekday);
    return { bestDay, bestHour, dayChart };
  },[s30,showFullWeek,closedWeekday]);

  // Slow-moving items — menu items with no sales in the last 30-day window
  const slowMoving = useMemo(()=>{
    const lastSaleMap = {}; // itemId -> latest sale_date string
    allSales.forEach(s=>{
      if(!lastSaleMap[s.item_id] || s.sale_date > lastSaleMap[s.item_id]) lastSaleMap[s.item_id] = s.sale_date;
    });
    const allMenuItems = [...menu.filter(m=>!menuEdits[m.id]?.hidden).map(m=>withEdit(m,menuEdits)), ...customItems.map(ci=>({id:ci.id, name:{sw:ci.sw}}))];
    const todayStr2 = today();
    const results = allMenuItems.map(item=>{
      const last = lastSaleMap[item.id];
      let daysSince;
      if(!last){ daysSince = null; } // never sold in fetched window
      else {
        const d1 = new Date(last), d2 = new Date(todayStr2);
        daysSince = Math.round((d2-d1)/86400000);
      }
      return { id:item.id, name:item.name?.sw||item.sw||item.id, daysSince };
    }).filter(r => r.daysSince===null || r.daysSince>=14)
      .sort((a,b)=>{
        if(a.daysSince===null && b.daysSince===null) return 0;
        if(a.daysSince===null) return -1;
        if(b.daysSince===null) return 1;
        return b.daysSince-a.daysSince;
      })
      .slice(0,50);
    return results;
  },[allSales,customItems,menuEdits]);

  // Shared Stock Forecast list — hoisted here so both the live UI and the Picha Kamili
  // export use the exact same filtered list (was previously computed separately in each).
  const stockList = useMemo(()=>stockPredictions.filter(p=>stockQty[p.id]>0),[stockPredictions,stockQty]);

  // Resolved "how many to show" counts for each ranked list, driven by the CountSelector controls.
  const topItemsShown = topItemsN==="All" ? itemsView.length : Math.min(topItemsN,itemsView.length);
  const slowShown = slowN==="All" ? slowMoving.length : Math.min(slowN,slowMoving.length);
  const stockShown = stockN==="All" ? stockList.length : Math.min(stockN,stockList.length);
  const advisorShown = marginAdvice ? (advisorN==="All" ? marginAdvice.top.length : Math.min(advisorN,marginAdvice.top.length)) : 0;

  // Revenue trend line, following whichever period is selected in Analysis Period —
  // daily points for short ranges, weekly buckets for long ones (e.g. Muda Wote as the
  // business grows) so the chart never becomes hundreds of unreadable daily points.
  const trendData = useMemo(()=>{
    const [sy,sm,sd] = rangeStart.split("-").map(Number);
    const [ey,em,ed] = rangeEnd.split("-").map(Number);
    const start = new Date(sy,sm-1,sd), end = new Date(ey,em-1,ed);
    const totalDays = Math.round((end-start)/86400000)+1;
    const DAILY_CAP = 60;
    const useWeekly = totalDays > DAILY_CAP;
    const revByDate = {};
    s30.forEach(s=>{ revByDate[s.sale_date] = (revByDate[s.sale_date]||0) + s.total_price; });
    const points = [];
    let cursor = new Date(start);
    if(useWeekly) cursor.setDate(cursor.getDate()-daysSinceWeekStart(cursor.getDay()));   // weekly bars begin on a Saturday
    while(cursor<=end){
      const bucketSize = useWeekly ? 7 : 1;
      let rev = 0, firstDs = null, anyDay = false;
      for(let i=0;i<bucketSize;i++){
        const d = new Date(cursor); d.setDate(d.getDate()+i);
        if(d>end) break;
        const ds = dateStrET(d);
        const [dy,dm,dd] = ds.split("-").map(Number);
        const dow = new Date(dy,dm-1,dd).getDay(); // weekday of the ET calendar date, not the device's local day
        if(!showFullWeek && dow===closedWeekday) continue;
        if(!firstDs) firstDs = ds;
        anyDay = true;
        rev += revByDate[ds]||0;
      }
      if(anyDay){
        const [ly,lm,ld] = firstDs.split("-").map(Number);
        points.push({date:firstDs, rev, label:(useWeekly?"Wiki ya ":"")+ld+"/"+lm});
      }
      cursor.setDate(cursor.getDate()+bucketSize);
    }
    return points;
  },[s30,showFullWeek,closedWeekday,rangeStart,rangeEnd]);

  const weekOverWeek = useMemo(()=>{
    const now = new Date();
    const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate()-6);
    const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate()-13);
    const lastWeekEnd = new Date(now); lastWeekEnd.setDate(now.getDate()-7);
    const fmtD = d=>dateStrET(d);
    const thisWeek = s30.filter(s=>s.sale_date>=fmtD(thisWeekStart)).reduce((s,r)=>s+r.total_price,0);
    const lastWeek = s30.filter(s=>s.sale_date>=fmtD(lastWeekStart)&&s.sale_date<=fmtD(lastWeekEnd)).reduce((s,r)=>s+r.total_price,0);
    const pct = lastWeek>0 ? Math.round((thisWeek-lastWeek)/lastWeek*100) : (thisWeek>0?100:0);
    return {thisWeek, lastWeek, pct};
  },[s30]);

  const insights=[];
  itemStats.filter(i=>i.margin<0&&i.qty>0).slice(0,2).forEach(i=>insights.push({c:"danger",msg:i.name+" is losing money (margin "+i.margin+"%). Raise price or stop selling."}));
  itemStats.filter(i=>i.margin>40&&i.qty>3).slice(0,2).forEach(i=>insights.push({c:"good",msg:i.name+" is your star product ("+i.margin+"% margin). Promote it more!"}));
  if(costs>gross*0.6&&gross>0)insights.push({c:"warn",msg:"Expenses are "+Math.round(costs/gross*100)+"% of revenue. Reduce costs to increase profit."});
  buildMixFlags(wkCmp).slice().reverse().forEach(f=>insights.unshift(f));
  if(!Object.keys(itemCosts).length)insights.push({c:"info",msg:"Set item cooking costs in Menu tab to see true profit margins."});

  const [akiliPreview,setAkiliPreview]=useState(null);
  function sendAkiliReport(){
    const lines = [
      `🧠 *RIPOTI YA AKILI / ANALYTICS REPORT*`,
      `📅 ${rangeStart} hadi ${rangeEnd} (${rangeLabel})`,
      ``,
      `💰 Mapato Ghafi: ${fmt(gross)}`,
      `📈 Faida Halisi: ${fmt(net)}`,
      `🎯 Margin: ${margin}%`,
      `❤️ Afya ya Biashara / Health: ${Math.round(health)}/100 (${healthGrade(health)})`,
      ``,
      `🧭 *Dira ya Biashara / Business Compass:*`,
      `   Jumla/Full: 1:${compassFull>=99?"∞":compassFull.toFixed(2)} (${compassZone(compassFull).labelEn})`,
      `   Bila Wafanyakazi/Excl. Staff: 1:${compassExStaff>=99?"∞":compassExStaff.toFixed(2)} (${compassZone(compassExStaff).labelEn})`,
      ``,
    ];
    if(itemStats.length>0){
      lines.push(`⭐ *Bidhaa Bora / Top Items:*`);
      itemStats.slice(0,3).forEach((it,i)=>lines.push(`${i+1}. ${it.name} — ${fmt(it.rev)}`));
      lines.push(``);
    }
    if(catMix.total>0){
      lines.push(`🍽️ *Chakula vs Vinywaji / Food vs Beverages:*`);
      lines.push(`   Chakula/Food: ${fmt(catMix.m.food.rev)} (${Math.round(catMix.m.food.rev/catMix.total*100)}%)`);
      lines.push(`   Vinywaji/Beverages: ${fmt(catMix.bev)} (${Math.round(catMix.bev/catMix.total*100)}%)`);
      lines.push(`     🥤 Bila Pombe/Non-alcoholic: ${fmt(catMix.soft)}`);
      lines.push(`     🍺 Bia/Beer: ${fmt(catMix.m.beer.rev)}`);
      lines.push(`     🥃 Pombe Kali/Spirits: ${fmt(catMix.m.spirits.rev)}`);
      lines.push(``);
    }
    if(wkCmp.cur.total>0||wkCmp.prevSame.total>0){
      const dl=(a,b)=>{const d=deltaPct(a,b);return d===null?"mpya/new":(d>0?"+":"")+d+"%";};
      lines.push(`📆 *Wiki Hii vs Iliyopita / This vs Last Week (siku ${wkCmp.days}):*`);
      lines.push(`   🍛 Chakula/Food: ${fmt(wkCmp.cur.m.food.rev)} (${dl(wkCmp.cur.m.food.rev,wkCmp.prevSame.m.food.rev)})`);
      lines.push(`   🥤 Bila Pombe/Non-alc: ${fmt(wkCmp.cur.soft)} (${dl(wkCmp.cur.soft,wkCmp.prevSame.soft)})`);
      lines.push(`   🍺🥃 Pombe/Alcohol: ${fmt(wkCmp.cur.alc)} (${dl(wkCmp.cur.alc,wkCmp.prevSame.alc)})`);
      lines.push(``);
    }
    if(dayHourAnalysis.bestDay){
      lines.push(`📅 Siku Bora / Best Day: ${dayHourAnalysis.bestDay.name} (${fmt(dayHourAnalysis.bestDay.rev)})`);
    }
    if(dayHourAnalysis.bestHour){
      lines.push(`⏰ Saa Bora / Peak Hour: ${dayHourAnalysis.bestHour.hour}:00`);
    }
    if(slowMoving.length>0){
      lines.push(``,`⚠️ Bidhaa Zisizouzwa / Slow-Moving: ${slowMoving.length} bidhaa`);
    }
    const lowStock = stockPredictions.filter(p=>stockQty[p.id]>0 && (stockQty[p.id]/p.perDay)<5);
    if(lowStock.length>0){
      lines.push(`📦 Stoki Inayoisha / Low Stock: ${lowStock.length} bidhaa`);
    }
    lines.push(``,`— Unyamwezini Jiko La Bibi JJJ`);
    setAkiliPreview(lines.join("\n"));
  }

  const [sharingImage,setSharingImage]=useState(false);
  async function shareAkiliVisualImage(){
    setSharingImage(true);
    try {
      const W=800, PAD=36;
      const dateStart = rangeStart;
      const dateEnd = rangeEnd;
      const rowsForItems = topItemsShown;
      const rowsForSlow = slowShown;
      const rowsForInsights = insights.length;
      const hasSvc = svcData.length>0, hasCost = costData.length>0;
      const rowsForStock = stockShown;
      const marginAdviceRows = marginAdvice ? marginAdvice.top.slice(0,advisorShown).reduce((s,c)=>s+24+c.tips.length*54+16, 0) : 0;

      // Dynamic height: base sections + variable-length lists
      let H = 700; // header + health + compass + margin ring + stats + trend chart baseline
      H += rowsForItems>0 ? (60+rowsForItems*46) : 0;
      H += rowsForStock>0 ? (50+rowsForStock*40) : 0; // stock forecast block
      H += dayHourAnalysis.bestDay ? (90+dayHourAnalysis.dayChart.length*26+30) : 0; // best day/hour block + weekday revenue bars + legend
      H += (hasSvc||hasCost) ? (60 + 190) : 0; // donuts row
      H += catMix.total>0 ? 230 : 0; // food vs beverage block
      const hasWk = wkCmp.cur.total>0||wkCmp.prevSame.total>0;
      H += hasWk ? 190 : 0; // weekly comparison block
      H += marginAdvice ? (50 + (marginAdvice.cutNeeded>0?100:0) + marginAdviceRows) : 0; // margin advisor
      H += rowsForSlow>0 ? (60+rowsForSlow*32) : 0;
      H += rowsForInsights>0 ? (60+rowsForInsights*46) : 0;
      H += 60; // footer margin

      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");

      function healthGrade(h){
        if(h>=85) return "A";
        if(h>=70) return "B";
        if(h>=55) return "C";
        if(h>=40) return "D";
        return "F";
      }

      // Background
      ctx.fillStyle = "#F0F4F8";
      ctx.fillRect(0,0,W,H);

      // Header band
      ctx.fillStyle = "#0B1F45";
      ctx.fillRect(0,0,W,120);
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 30px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("UNYAMWEZINI JIKO LA BIBI JJJ", W/2, 55);
      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("Ripoti ya Akili / Analytics Report", W/2, 82);
      ctx.font = "13px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(dateStart + " \u2013 " + dateEnd, W/2, 104);

      let y = 165;

      // Health score circle + letter grade
      const hcx = 110, hcy = y+55, hr = 50;
      ctx.beginPath(); ctx.arc(hcx,hcy,hr,0,Math.PI*2); ctx.strokeStyle = hc+"22"; ctx.lineWidth=10; ctx.stroke();
      const healthFrac = Math.min(1,health/100);
      ctx.beginPath(); ctx.arc(hcx,hcy,hr,-Math.PI/2,-Math.PI/2+healthFrac*Math.PI*2); ctx.strokeStyle=hc; ctx.lineWidth=10; ctx.lineCap="round"; ctx.stroke();
      ctx.fillStyle = hc; ctx.font = "bold 24px Georgia, serif"; ctx.textAlign="center";
      ctx.fillText(String(Math.round(health)), hcx, hcy);
      ctx.font = "bold 15px Georgia, serif";
      ctx.fillText("Daraja "+healthGrade(health), hcx, hcy+20);
      ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
      ctx.fillText("Afya ya Biashara", hcx+70, hcy-14);
      ctx.font = "13px Arial"; ctx.fillStyle="rgba(11,31,69,0.6)";
      ctx.fillText("Business Health Score / Grade", hcx+70, hcy+6);
      ctx.font = "bold 13px Arial"; ctx.fillStyle = hc;
      ctx.fillText(health>=70?"Excellent / Nzuri Sana":health>=40?"Average / Wastani":"At Risk / Hatarini", hcx+70, hcy+26);

      y += 140;

      // Dira ya Biashara / Business Compass — bold, always shown with real numbers (ratios don't leak absolute figures)
      ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
      ctx.fillText("\ud83e\udded Dira ya Biashara / Business Compass", PAD, y);
      y += 18;
      const compW = (W-PAD*2-16)/2;
      [{lbl:"Jumla / Full", r:compassFull},{lbl:"Bila Wafanyakazi / Excl. Staff", r:compassExStaff}].forEach((c,i)=>{
        const cx0 = PAD + i*(compW+16);
        const zoneColor = c.r>=1.05 ? "#1B7A20" : c.r>=0.95 ? "#B8860B" : "#C62828";
        const zoneLabel = c.r>=compassTarget?"Lengo Limefikiwa!":c.r>=1.05?"Unaendelea":c.r>=0.95?"Sawa Sawa":"Unapoteza";
        ctx.fillStyle = zoneColor+"15";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx0,y,compW,90,10) : ctx.rect(cx0,y,compW,90); ctx.fill();
        ctx.fillStyle = "rgba(11,31,69,0.5)"; ctx.font="10px Arial"; ctx.textAlign="center";
        ctx.fillText(c.lbl.toUpperCase(), cx0+compW/2, y+22);
        ctx.fillStyle = zoneColor; ctx.font="bold 26px Georgia, serif";
        ctx.fillText("1:"+(c.r>=99?"\u221e":c.r.toFixed(2)), cx0+compW/2, y+56);
        ctx.font="bold 12px Arial";
        ctx.fillText(zoneLabel, cx0+compW/2, y+76);
      });
      y += 110;

      // Margin % hero ring — centered, matches the live screen's featured Margin display
      const marginColor = margin>25?"#1B7A20":margin>0?"#B8860B":"#C62828";
      const marginFillPct = Math.max(0, Math.min(100, margin));
      const marginActionTip = margin>=25 ? "Afya njema \u2014 wekeza kwenye ukuaji / Healthy \u2014 reinvest in growth"
        : margin>=10 ? "Karibu \u2014 punguza gharama kubwa / Close \u2014 trim your biggest cost"
        : margin>=0 ? "Chini ya afya njema / Below healthy target" : "Unapoteza pesa / Losing money";
      const ringCx = W/2, ringCy = y+50, ringR = 42;
      ctx.beginPath(); ctx.arc(ringCx,ringCy,ringR,0,2*Math.PI); ctx.strokeStyle=marginColor+"22"; ctx.lineWidth=10; ctx.stroke();
      ctx.beginPath(); ctx.arc(ringCx,ringCy,ringR,-Math.PI/2,-Math.PI/2+(marginFillPct/100)*2*Math.PI); ctx.strokeStyle=marginColor; ctx.lineWidth=10; ctx.lineCap="round"; ctx.stroke();
      ctx.fillStyle=marginColor; ctx.font="bold 22px Georgia, serif"; ctx.textAlign="center";
      ctx.fillText(margin+"%", ringCx, ringCy+7);
      ctx.fillStyle="rgba(11,31,69,0.55)"; ctx.font="bold 11px Arial";
      ctx.fillText("MARGIN", ringCx, ringCy+ringR+24);
      ctx.fillStyle="rgba(11,31,69,0.6)"; ctx.font="11px Arial";
      ctx.fillText(marginActionTip, ringCx, ringCy+ringR+42);
      ctx.fillStyle="rgba(11,31,69,0.45)"; ctx.font="9px Arial";
      ctx.fillText("\ud83d\udfe2 25%+ Afya Njema  \u00b7  \ud83d\udfe1 0-24% Boresha  \u00b7  \ud83d\udd34 <0% Hasara", ringCx, ringCy+ringR+58);
      y += 168;

      // Stat boxes: Gross, Net, Sales, Total Expenses (4 across, matching the live screen)
      const stats = [
        {label:"Mapato Ghafi", val: presenterMode?(weekOverWeek.pct>=0?"+":"")+weekOverWeek.pct+"%":fmt(gross), color:"#B8860B"},
        {label:"Faida Halisi", val: presenterMode?margin+"%":fmt(net), color: net>=0?"#1B7A20":"#C62828"},
        {label:"Mauzo/Sales", val: String(s30.length), color:"#1565C0"},
        {label:"Gharama Jumla", val: presenterMode?(gross?Math.round(costs/gross*100)+"%":"—"):fmt(costs), color:"#C62828"},
      ];
      const boxW = (W-PAD*2-30)/4;
      stats.forEach((s,i)=>{
        const bx = PAD + i*(boxW+10);
        ctx.fillStyle = s.color+"15";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx,y,boxW,74,10) : ctx.rect(bx,y,boxW,74); ctx.fill();
        ctx.fillStyle = "rgba(11,31,69,0.5)"; ctx.font="10px Arial"; ctx.textAlign="center";
        ctx.fillText(s.label.toUpperCase(), bx+boxW/2, y+26);
        ctx.fillStyle = s.color; ctx.font="bold 15px Georgia, serif";
        ctx.fillText(s.val, bx+boxW/2, y+52);
      });

      y += 110;

      // Revenue trend chart
      ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
      ctx.fillText("Mwenendo wa Mauzo / Revenue Trend"+(showFullWeek?"":" (Siku 6 za Kazi/6 Operating Days)"), PAD, y);
      y += 20;
      const chartH = 130, chartW = W-PAD*2;
      const maxRev = Math.max(...trendData.map(d=>d.rev),1);
      const avgRev = trendData.reduce((s,d)=>s+d.rev,0)/Math.max(trendData.length,1);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(PAD,y,chartW,chartH);
      ctx.strokeStyle = "rgba(11,31,69,0.08)"; ctx.lineWidth=1; ctx.strokeRect(PAD,y,chartW,chartH);
      const avgY = y+chartH-10-(avgRev/maxRev)*(chartH-20);
      ctx.setLineDash([4,4]); ctx.strokeStyle="rgba(11,31,69,0.3)"; ctx.beginPath();
      ctx.moveTo(PAD,avgY); ctx.lineTo(PAD+chartW,avgY); ctx.stroke(); ctx.setLineDash([]);
      for(let i=1;i<trendData.length;i++){
        const p0 = trendData[i-1], p1 = trendData[i];
        const x0 = PAD + ((i-1)/(trendData.length-1))*chartW;
        const x1 = PAD + (i/(trendData.length-1))*chartW;
        const y0 = y+chartH-10-(p0.rev/maxRev)*(chartH-20);
        const y1 = y+chartH-10-(p1.rev/maxRev)*(chartH-20);
        const segColor = avgRev<=0 ? "#B8860B" : p1.rev>=avgRev*1.1 ? "#1B7A20" : p1.rev<=avgRev*0.85 ? "#C62828" : "#B8860B";
        ctx.strokeStyle = segColor; ctx.lineWidth=2.5; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      }
      ctx.fillStyle = "rgba(11,31,69,0.4)"; ctx.font="10px Arial"; ctx.textAlign="left";
      ctx.fillText(trendData[0]?.label||"", PAD, y+chartH+16);
      ctx.textAlign="right";
      ctx.fillText(trendData[trendData.length-1]?.label||"", PAD+chartW, y+chartH+16);

      y += chartH + 40;

      // Top items
      if(itemsView.length>0){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Bidhaa Bora / Top Items", PAD, y);
        y += 16;
        const maxItemRev = itemsView[0].rev || 1;
        itemsView.slice(0,topItemsShown).forEach((it,i)=>{
          const barY = y + i*46 + 14;
          ctx.fillStyle = "#0B1F45"; ctx.font="13px Arial"; ctx.textAlign="left";
          ctx.fillText((i+1)+". "+it.name, PAD, barY);
          const barW = (it.rev/maxItemRev) * (W-PAD*2-100);
          ctx.fillStyle = i===0 ? "#B8860B" : "#1565C0";
          ctx.fillRect(PAD, barY+8, Math.max(barW,4), 8);
          ctx.textAlign="right";
          ctx.fillStyle = "rgba(11,31,69,0.7)"; ctx.font="12px Arial";
          const pctOfTop = Math.round((it.rev/maxItemRev)*100);
          ctx.fillText(presenterMode?pctOfTop+"%":fmt(it.rev), W-PAD, barY+2);
        });
        y += rowsForItems*46 + 30;
      }

      // Stock Forecast — was missing from this export entirely; mirrors the live Utabiri wa Stoki card
      if(stockList.length>0){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("\ud83d\udce6 Utabiri wa Stoki / Stock Forecast", PAD, y);
        y += 22;
        stockList.slice(0,stockShown).forEach(p=>{
          const qty = stockQty[p.id]||0;
          const daysLeft = p.perDay>0 ? qty/p.perDay : 99;
          const color = daysLeft<2 ? "#C62828" : daysLeft<5 ? "#B8860B" : "#1B7A20";
          ctx.fillStyle = "rgba(11,31,69,0.85)"; ctx.font="bold 12px Arial"; ctx.textAlign="left";
          ctx.fillText(p.name, PAD, y);
          ctx.fillStyle = "rgba(11,31,69,0.5)"; ctx.font="10px Arial";
          ctx.fillText(qty+" units left \u00b7 "+p.perDay.toFixed(1)+"/siku wastani", PAD, y+15);
          ctx.fillStyle = color; ctx.font="bold 14px Georgia, serif"; ctx.textAlign="right";
          ctx.fillText(daysLeft>=99?"\u2014":daysLeft.toFixed(1)+" siku", W-PAD, y+6);
          y += 40;
        });
        y += 10;
      }

      // Best day / hour
      if(dayHourAnalysis.bestDay || dayHourAnalysis.bestHour){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Siku na Saa Bora / Best Day & Hour", PAD, y);
        y += 26;
        ctx.font="13px Arial"; ctx.fillStyle="rgba(11,31,69,0.75)";
        if(dayHourAnalysis.bestDay) ctx.fillText("\ud83d\udcc5 Siku Bora: "+dayHourAnalysis.bestDay.name, PAD, y);
        if(dayHourAnalysis.bestHour) ctx.fillText("\u23f0 Saa Bora: "+dayHourAnalysis.bestHour.hour+":00", PAD+300, y);
        y += 30;
        // Revenue by Weekday bars — was missing from this export; mirrors the live Mauzo kwa Siku ya Wiki chart
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 12px Arial"; ctx.textAlign="left";
        ctx.fillText("Mauzo kwa Siku ya Wiki / Revenue by Weekday", PAD, y);
        y += 14;
        const dcMax = Math.max(...dayHourAnalysis.dayChart.map(d=>d.rev),1);
        const dcAvg = dayHourAnalysis.dayChart.reduce((s,d)=>s+d.rev,0)/dayHourAnalysis.dayChart.length;
        dayHourAnalysis.dayChart.forEach(d=>{
          const perfColor = dcAvg<=0 ? "#B8860B" : d.rev>=dcAvg*1.1 ? "#1B7A20" : d.rev<=dcAvg*0.85 ? "#C62828" : "#B8860B";
          ctx.fillStyle = "rgba(11,31,69,0.7)"; ctx.font="10px Arial"; ctx.textAlign="left";
          ctx.fillText(d.name, PAD, y+9);
          ctx.fillStyle = perfColor; ctx.font="bold 10px Arial"; ctx.textAlign="right";
          ctx.fillText(fmt(d.rev), W-PAD, y+9);
          const barMaxW = W-PAD*2-140;
          ctx.fillStyle = perfColor+"22";
          ctx.fillRect(PAD+90, y+2, barMaxW, 8);
          ctx.fillStyle = perfColor;
          ctx.fillRect(PAD+90, y+2, Math.max((d.rev/dcMax)*barMaxW,3), 8);
          y += 26;
        });
        y += 20;
      }

      // Service Mix + Cost Breakdown donuts, side by side
      if(hasSvc || hasCost){
        const donutY = y;
        function drawDonut(cx, cyTop, data, title){
          const total = data.reduce((s,d)=>s+d.value,0);
          if(total<=0) return;
          ctx.fillStyle = "#0B1F45"; ctx.font="bold 14px Arial"; ctx.textAlign="left";
          ctx.fillText(title, cx-70, cyTop);
          const cy = cyTop+80, R=55, ir=30;
          let ang = -Math.PI/2;
          data.forEach(d=>{
            const sw = (d.value/total)*Math.PI*2;
            ctx.beginPath();
            ctx.moveTo(cx,cy);
            ctx.arc(cx,cy,R,ang,ang+sw);
            ctx.closePath();
            ctx.fillStyle = d.color;
            ctx.fill();
            ang += sw;
          });
          ctx.fillStyle = "#F0F4F8"; ctx.beginPath(); ctx.arc(cx,cy,ir,0,Math.PI*2); ctx.fill();
          // Legend below
          let legY = cyTop+150;
          data.forEach(d=>{
            ctx.fillStyle = d.color; ctx.fillRect(cx-70, legY-9, 9, 9);
            ctx.fillStyle = "rgba(11,31,69,0.75)"; ctx.font="11px Arial"; ctx.textAlign="left";
            const p = Math.round(d.value/total*100);
            ctx.fillText(d.label+" \u00b7 "+p+"%", cx-56, legY);
            legY += 15;
          });
        }
        if(hasSvc) drawDonut(PAD+130, donutY, svcData, "Aina ya Huduma / Service Mix");
        if(hasCost) drawDonut(PAD+130+320, donutY, costData, "Gharama kwa Aina / Cost Breakdown");
        y += 230;
      }

      // Chakula vs Vinywaji — food vs beverage (non-alcoholic / alcoholic)
      if(catMix.total>0){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Chakula vs Vinywaji / Food vs Beverages", PAD, y);
        y += 12;
        const rowsX=[["food","#1B6B20"],["soft","#00695C"],["beer","#E6A817"],["spirits","#6A1B9A"]];
        const lbl={food:"Chakula / Food",soft:"Visivyo na Pombe / Non-alcoholic",beer:"Bia / Beer",spirits:"Pombe Kali / Gin & Spirits"};
        rowsX.forEach(([k,col],i)=>{
          const v=catMix.m[k].rev, p=Math.round(v/catMix.total*100), by=y+i*34+14;
          ctx.fillStyle="#0B1F45"; ctx.font="12px Arial"; ctx.textAlign="left"; ctx.fillText(lbl[k], PAD, by);
          ctx.textAlign="right"; ctx.fillText(fmt(v)+" \u00b7 "+p+"%", W-PAD, by);
          ctx.fillStyle="rgba(11,31,69,0.08)"; ctx.fillRect(PAD, by+5, W-PAD*2, 7);
          ctx.fillStyle=col; ctx.fillRect(PAD, by+5, Math.max(2,(W-PAD*2)*v/catMix.total), 7);
        });
        y += 4*34+16;
        ctx.fillStyle="rgba(11,31,69,0.75)"; ctx.font="12px Arial"; ctx.textAlign="left";
        ctx.fillText("Vinywaji Jumla / Beverages: "+fmt(catMix.bev)+" ("+Math.round(catMix.bev/catMix.total*100)+"%)  \u00b7  Pombe / Alcohol: "+fmt(catMix.alc)+"  \u00b7  Bila Pombe / Non-alc: "+fmt(catMix.soft), PAD, y);
        y += 22;
        if(catMix.buyTotal>0){ ctx.fillText("Stock ya vinywaji iliyonunuliwa / Beverage stock bought: "+fmt(catMix.buyTotal), PAD, y); y += 22; }
        y += 20;
      }

      // Wiki Hii vs Iliyopita
      if(hasWk){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Wiki Hii vs Iliyopita / This Week vs Last Week (siku "+wkCmp.days+")", PAD, y);
        y += 10;
        [["Chakula / Food",wkCmp.cur.m.food.rev,wkCmp.prevSame.m.food.rev],["Bila Pombe / Non-alcoholic",wkCmp.cur.soft,wkCmp.prevSame.soft],["Pombe / Alcohol",wkCmp.cur.alc,wkCmp.prevSame.alc],["Jumla / Total",wkCmp.cur.total,wkCmp.prevSame.total]].forEach(([lb,c,p],i)=>{
          const by=y+i*30+18, d=deltaPct(c,p);
          ctx.fillStyle="#0B1F45"; ctx.font=(i===3?"bold ":"")+"12px Arial"; ctx.textAlign="left"; ctx.fillText(lb, PAD, by);
          ctx.fillStyle="rgba(11,31,69,0.65)"; ctx.textAlign="right"; ctx.fillText(fmt(c)+" vs "+fmt(p), W-PAD-90, by);
          ctx.fillStyle = d===null||d>0 ? "#1B7A20" : d<0 ? "#C62828" : "#777"; ctx.font="bold 12px Arial";
          ctx.fillText(d===null?"mpya":(d>0?"+":"")+d+"%", W-PAD, by);
        });
        y += 4*30+36;
      }

      // Margin Advisor — was a brand-new section; adding it here from day one so it never falls out of sync with the export
      if(marginAdvice){
        function wrapLines(text, maxW, font){
          ctx.font = font;
          const words = text.split(" ");
          const lines = []; let line = "";
          words.forEach(w=>{
            const test = line+w+" ";
            if(ctx.measureText(test).width > maxW && line){ lines.push(line); line = w+" "; }
            else line = test;
          });
          lines.push(line);
          return lines;
        }
        function wrapText(text, x, startY, maxW, lineH, color, font){
          const lines = wrapLines(text, maxW, font);
          ctx.fillStyle = color; ctx.font = font; ctx.textAlign = "left";
          lines.forEach((line,i)=>ctx.fillText(line, x, startY+i*lineH));
          return startY + (lines.length-1)*lineH;
        }
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("\ud83e\udde0 Kishauri cha Faida / Margin Advisor", PAD, y);
        y += 24;
        if(marginAdvice.cutNeeded>0){
          const gapLine1 = "Ili kufikia lengo 1:"+compassTarget+", punguza gharama kwa "+(presenterMode?marginAdvice.pctCutOfTop+"%":fmt(marginAdvice.cutNeeded))+" \u2014 kupunguza "+marginAdvice.topLabel+" kwa "+marginAdvice.pctCutOfTop+"% pekee kunatosha.";
          const gapLines = wrapLines(gapLine1, W-PAD*2-20, "12px Arial");
          const boxH = gapLines.length*15 + 24;
          ctx.fillStyle = "#FBF3DC"; ctx.fillRect(PAD,y,W-PAD*2,boxH);
          y = wrapText(gapLine1, PAD+10, y+18, W-PAD*2-20, 15, "#0B1F45", "12px Arial") + 22;
        }
        marginAdvice.top.slice(0,advisorShown).forEach((cat,i)=>{
          ctx.fillStyle = "#0B1F45"; ctx.font="bold 13px Georgia, serif"; ctx.textAlign="left";
          ctx.fillText("#"+(i+1)+" "+cat.label, PAD, y);
          ctx.fillStyle = "#B8860B"; ctx.font="bold 11px Arial"; ctx.textAlign="right";
          ctx.fillText(cat.pct+"%"+(presenterMode?"":" ("+fmt(cat.value)+")"), W-PAD, y);
          y += 18;
          cat.tips.forEach(tip=>{
            ctx.fillStyle = "#B8860B"; ctx.font="11px Arial"; ctx.textAlign="left";
            ctx.fillText("\u2192", PAD, y);
            y = wrapText(tip, PAD+14, y, W-PAD*2-14, 15, "rgba(11,31,69,0.75)", "11px Arial") + 19;
          });
          y += 6;
        });
        y += 14;
      }

      // Slow-moving items
      if(slowMoving.length>0){
        ctx.fillStyle = "#C62828"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("\u26a0\ufe0f Bidhaa Zisizouzwa / Slow-Moving Items", PAD, y);
        y += 24;
        slowMoving.slice(0,slowShown).forEach(item=>{
          ctx.fillStyle = "rgba(11,31,69,0.8)"; ctx.font="12px Arial"; ctx.textAlign="left";
          ctx.fillText(item.name, PAD, y);
          ctx.fillStyle = "#C62828"; ctx.font="bold 11px Arial"; ctx.textAlign="right";
          ctx.fillText(item.daysSince===null?"Hakuna 30+ siku":item.daysSince+" siku", W-PAD, y);
          y += 26;
        });
        y += 20;
      }

      // Business Insights
      if(insights.length>0){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Business Insights / Ushauri", PAD, y);
        y += 22;
        insights.forEach(ins=>{
          const c = ins.c==="good"?"#1B7A20":ins.c==="danger"?"#C62828":ins.c==="warn"?"#B8860B":"#1565C0";
          ctx.fillStyle = c; ctx.fillRect(PAD, y-12, 3, 34);
          ctx.fillStyle = "rgba(11,31,69,0.8)"; ctx.font="12px Arial"; ctx.textAlign="left";
          // simple wrap for long insight text
          const words = ins.msg.split(" ");
          let line = "", lineY = y;
          const maxW = W-PAD*2-16;
          words.forEach(w=>{
            const test = line+w+" ";
            if(ctx.measureText(test).width > maxW && line){
              ctx.fillText(line, PAD+12, lineY);
              line = w+" "; lineY += 16;
            } else line = test;
          });
          ctx.fillText(line, PAD+12, lineY);
          y = lineY + 30;
        });
      }

      // Footer
      y += 10;
      ctx.fillStyle = "rgba(11,31,69,0.4)"; ctx.font="11px Arial"; ctx.textAlign="center";
      ctx.fillText("Unyamwezini Jiko La Bibi JJJ \u00b7 " + APP_VERSION, W/2, H-20);

      canvas.toBlob(async (blob)=>{
        if(!blob){ setSharingImage(false); return; }
        const file = new File([blob], "akili-ripoti-"+today()+".png", {type:"image/png"});
        try {
          if(navigator.canShare && navigator.canShare({files:[file]})){
            await navigator.share({files:[file], title:"Ripoti ya Akili", text:"Ripoti ya Akili \u2014 Unyamwezini Jiko La Bibi JJJ"});
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download=file.name; a.click();
            URL.revokeObjectURL(url);
            alert("Picha imepakuliwa kwenye simu yako \u2014 tuma kwa WhatsApp mwenyewe. / Image saved to your phone \u2014 share it to WhatsApp manually.");
          }
        } catch(e){ console.warn("Share failed:", e); }
        setSharingImage(false);
      }, "image/png", 0.95);
    } catch(e){
      console.warn("Image generation failed:", e);
      setSharingImage(false);
    }
  }


  function healthGrade(h){
    if(h>=85) return "A";
    if(h>=70) return "B";
    if(h>=55) return "C";
    if(h>=40) return "D";
    return "F";
  }

  return (
    <div style={{padding:"1rem"}}>
      <Card style={{padding:"1rem",marginBottom:10}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Kipindi cha Uchambuzi / Analysis Period</p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:akiliRange==="custom"?8:0}}>
          {[["30days","Siku 30"],["month","Mwezi Huu"],["alltime","Muda Wote"],["custom","Chagua Tarehe"]].map(([k,l])=>(
            <button key={k} onClick={()=>setAkiliRange(k)} style={{padding:"5px 11px",borderRadius:99,border:"1px solid "+(akiliRange===k?t.gold:t.border),background:akiliRange===k?t.gold+"18":"transparent",color:akiliRange===k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:akiliRange===k?700:400,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        <div style={{marginTop:10,padding:"9px 12px",borderRadius:10,background:t.gold+"12",display:"flex",alignItems:"center",gap:7}}>
          <i className="ti ti-calendar" style={{fontSize:14,color:t.gold}}/>
          <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{rangeStart} → {rangeEnd}</span>
          <span style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>({rangeLabel})</span>
        </div>
        {akiliRange==="custom" && <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
          <input type="date" value={akiliCustomStart} onChange={e=>setAkiliCustomStart(e.target.value)} min={BUSINESS_START_DATE} max={today()} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"}}/>
          <span style={{color:t.dim2,fontSize:"11px"}}>—</span>
          <input type="date" value={akiliCustomEnd} onChange={e=>setAkiliCustomEnd(e.target.value)} min={akiliCustomStart} max={today()} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"}}/>
        </div>}
      </Card>
      <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Analytics / Uchambuzi — {rangeStart} hadi {rangeEnd} ({rangeLabel})</p>
      <StaffCostToggle includeStaffCosts={includeStaffCosts} onToggle={toggleIncludeStaffCosts}/>
      {/* ═══ DIRA YA BIASHARA / BUSINESS COMPASS — bold, always visible, never masked ═══ */}
      <Card glow style={{padding:"1.3rem",marginBottom:10,border:"2px solid "+compassZone(costs>0?compassFull:1).color+"55"}}>
        <div style={{textAlign:"center",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold,textTransform:"uppercase",letterSpacing:"1.5px",margin:0}}>🧭 Dira ya Biashara / Business Compass</p>
          <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"2px 0 0"}}>Uwiano wa Mapato dhidi ya Gharama / Revenue-to-Cost Ratio</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{textAlign:"center",padding:"14px 8px",borderRadius:14,background:compassZone(compassFull).color+"12",border:"1px solid "+compassZone(compassFull).color+"33"}}>
            <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Jumla / Full (na Wafanyakazi)</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:30,fontWeight:900,color:compassZone(compassFull).color,lineHeight:1}}>1:{compassFull>=99?"∞":compassFull.toFixed(2)}</div>
            <div style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:compassZone(compassFull).color,marginTop:6}}>{compassZone(compassFull).label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:1}}>{compassZone(compassFull).labelEn}</div>
            <Bar value={Math.min(compassFull,compassTarget)} max={compassTarget} color={compassZone(compassFull).color} h={4}/>
          </div>
          <div style={{textAlign:"center",padding:"14px 8px",borderRadius:14,background:compassZone(compassExStaff).color+"12",border:"1px solid "+compassZone(compassExStaff).color+"33"}}>
            <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Bila Wafanyakazi / Excl. Staff</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:30,fontWeight:900,color:compassZone(compassExStaff).color,lineHeight:1}}>1:{compassExStaff>=99?"∞":compassExStaff.toFixed(2)}</div>
            <div style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:compassZone(compassExStaff).color,marginTop:6}}>{compassZone(compassExStaff).label}</div>
            <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:1}}>{compassZone(compassExStaff).labelEn}</div>
            <Bar value={Math.min(compassExStaff,compassTarget)} max={compassTarget} color={compassZone(compassExStaff).color} h={4}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:14,paddingTop:12,borderTop:"1px solid "+t.border}}>
          {editingTarget ? (
            <>
              <span style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,fontWeight:700}}>Lengo/Target 1:</span>
              <input type="number" step="0.1" min="1" value={targetInput} onChange={e=>setTargetInput(e.target.value)} autoFocus style={{width:60,padding:"5px 8px",borderRadius:8,border:"1px solid "+t.gold,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",textAlign:"center"}}/>
              <button onClick={saveTarget} style={{background:t.gr,color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Hifadhi</button>
              <button onClick={()=>{setEditingTarget(false);setTargetInput(String(compassTarget));}} style={{background:t.bg4,color:t.dim,border:"none",borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>✕</button>
            </>
          ) : (
            <button onClick={()=>setEditingTarget(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>Lengo Lako / Your Target: </span>
              <span style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:900,color:t.gold}}>1:{compassTarget}</span>
              <i className="ti ti-pencil" style={{fontSize:12,color:t.dim2}}/>
            </button>
          )}
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textAlign:"center",margin:"10px 0 0",lineHeight:1.5}}>
          1:1 = Kuvunja Sawa / Breaking Even &nbsp;&middot;&nbsp; Chini ya 1:1 = Hasara / Losing &nbsp;&middot;&nbsp; 1:{compassTarget}+ = Lengo Limefikiwa / Target Reached
        </p>
        <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textAlign:"center",margin:"6px 0 0",lineHeight:1.5,fontStyle:"italic"}}>
          Kadi hizi mbili huonyeshwa daima — swichi ya Na/Bila Wafanyakazi hapo juu haiathiri hesabu hii. / Both cards always show — the toggle above only affects Net/Margin/Health below, not these two ratios.
        </p>
      </Card>

      <Card glow style={{padding:"1.2rem",display:"flex",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:68,height:68,flexShrink:0}}>
          <svg width={68} height={68} style={{transform:"rotate(-90deg)"}}>
            <circle cx={34} cy={34} r={26} fill="none" stroke={hc} strokeWidth={7} strokeOpacity={0.12}/>
            <circle cx={34} cy={34} r={26} fill="none" stroke={hc} strokeWidth={7} strokeDasharray={health*1.63+" 163"} strokeLinecap="round" style={{filter:"drop-shadow(0 0 6px "+hc+"66)"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:hc,lineHeight:1}}>{Math.round(health)}</span>
            <span style={{fontFamily:"Georgia,serif",fontSize:10,fontWeight:700,color:hc,lineHeight:1,marginTop:1}}>{healthGrade(health)}</span>
          </div>
        </div>
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Business Health / Afya ya Biashara</p>
          <p style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:900,color:hc,margin:"0 0 2px"}}>{health>=70?"Excellent / Nzuri Sana":health>=40?"Average / Wastani":"At Risk / Hatarini"} · Daraja {healthGrade(health)}</p>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,margin:0}}>Gross: {presenterMode?"100%":fmt(gross)} · Net: {presenterMode?(gross?Math.round(net/gross*100):0)+"%":fmt(net)} · Margin: {margin}%</p>
        </div>
      </Card>
      <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <IconBadge emoji="📈" color={t.gold}/>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Mwenendo wa Mauzo / Revenue Trend ({rangeStart}–{rangeEnd})</p>
          </div>
          <div onClick={toggleShowFullWeek} style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:99,background:t.gold+"14",border:"1px solid "+t.gold+"33",cursor:"pointer"}}>
            <i className="ti ti-calendar-off" style={{fontSize:11,color:t.gold}}/>
            <span style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,color:t.gold,whiteSpace:"nowrap"}}>{showFullWeek?"Wiki 7 / Full Week":"Siku 6 za Kazi / 6 Operating"}</span>
          </div>
        </div>
        {!showFullWeek && <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"0 0 8px",fontStyle:"italic"}}>Siku ya kufungwa imeondolewa kwenye wastani na chati / Closed day is excluded from the average and chart, so it doesn't show as a false "bad" day.</p>}
        <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 14px"}}>
          <span style={{fontSize:16,color:weekOverWeek.pct>=0?t.gr:t.rd}}>{weekOverWeek.pct>=0?"▲":"▼"}</span>
          <span style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:900,color:weekOverWeek.pct>=0?t.gr:t.rd}}>{Math.abs(weekOverWeek.pct)}%</span>
          <span style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>wiki hii vs wiki iliyopita / this week vs last</span>
        </div>
        <TrendChart data={trendData} textColor={t.text} dimColor={t.dim2} bgColor={t.bg2} borderColor={t.border}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>{trendData[0]?.label}</span>
          <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>👈 Gusa na buruta kuona tarehe / Touch &amp; drag to explore</span>
          <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>{trendData[trendData.length-1]?.label}</span>
        </div>
      </Card>
      {stockList.length>0 && <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <IconBadge emoji="📦" color={t.bl}/>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Utabiri wa Stoki / Stock Forecast</p>
          </div>
          {stockList.length>5 && <CountSelector value={stockN} onChange={setStockN} total={stockList.length}/>}
        </div>
        {stockList.slice(0,stockShown).map(p=>{
          const qty = stockQty[p.id]||0;
          const daysLeft = p.perDay>0 ? qty/p.perDay : 99;
          const urgent = daysLeft<2, warn = daysLeft>=2&&daysLeft<5;
          const color = urgent?t.rd:warn?t.gold:t.gr;
          return (
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+t.border+"55"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text}}>{p.name}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:1}}>{qty} units left · {p.perDay.toFixed(1)}/siku wastani</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:900,color}}>{daysLeft>=99?"—":daysLeft.toFixed(1)}</div>
                <div style={{fontFamily:"sans-serif",fontSize:8,color,textTransform:"uppercase",fontWeight:700}}>siku/days</div>
              </div>
            </div>
          );
        })}
      </Card>}
      {dayHourAnalysis.bestDay && <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><IconBadge emoji="🕐" color={t.bl}/><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Siku na Saa Bora / Best Day &amp; Hour ({rangeStart}–{rangeEnd})</p></div>
        <div style={{display:"flex",gap:10,marginBottom:14}}>
          <div style={{flex:1,background:t.gold+"12",borderRadius:10,padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>📅</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:t.gold}}>{dayHourAnalysis.bestDay.name}</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:2}}>Siku Bora / Best Day</div>
            <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:3}}>{fmt(dayHourAnalysis.bestDay.rev)}</div>
          </div>
          {dayHourAnalysis.bestHour && <div style={{flex:1,background:t.bl+"12",borderRadius:10,padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>⏰</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:t.bl}}>{dayHourAnalysis.bestHour.hour}:00</div>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:2}}>Saa Bora / Peak Hour{dayHourAnalysis.bestHour.isEstimate?" (makadirio)":""}</div>
            <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:3}}>{fmt(dayHourAnalysis.bestHour.rev)}</div>
          </div>}
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Mauzo kwa Siku ya Wiki / Revenue by Weekday{showFullWeek?"":" (Siku 6/6 Days)"}</p>
        {dayHourAnalysis.dayChart.map(d=>{
          const maxRev = Math.max(...dayHourAnalysis.dayChart.map(x=>x.rev),1);
          const weekAvg = dayHourAnalysis.dayChart.reduce((s,x)=>s+x.rev,0)/dayHourAnalysis.dayChart.length;
          const dayEmojis = {"Jumapili":"😴","Jumatatu":"🌱","Jumanne":"⚡","Jumatano":"🔆","Alhamisi":"🚀","Ijumaa":"🎉","Jumamosi":"🏆"};
          const isBest = d.rev===maxRev && d.rev>0;
          const perfColor = weekAvg<=0 ? t.gold : d.rev>=weekAvg*1.1 ? t.gr : d.rev<=weekAvg*0.85 ? t.rd : t.gold;
          return (
            <div key={d.name} style={{marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,color:t.dim,marginBottom:2}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13}}>{dayEmojis[d.name]||"📆"}</span>
                  <span>{d.name}</span>
                  {isBest && <span style={{fontSize:9,background:t.gold+"20",color:t.gold,padding:"1px 6px",borderRadius:5,fontWeight:700}}>BORA</span>}
                </span>
                <span style={{fontWeight:700,color:perfColor}}>{fmt(d.rev)}</span>
              </div>
              <Bar value={d.rev} max={maxRev} color={perfColor} h={5}/>
            </div>
          );
        })}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:8}}>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr,display:"inline-block"}}/>Juu ya Wastani</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gold,display:"inline-block"}}/>Wastani</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.rd,display:"inline-block"}}/>Chini ya Wastani</span>
        </div>
      </Card>}
      {slowMoving.length>0 && <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}><IconBadge emoji="⚠️" color={t.rd}/><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.rd,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Bidhaa Zisizouzwa / Slow-Moving Items</p></div>
          {slowMoving.length>5 && <CountSelector value={slowN} onChange={setSlowN} total={slowMoving.length}/>}
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,margin:"0 0 12px"}}>Hazijauzwa kwa siku 14+ / Not sold in 14+ days</p>
        {slowMoving.slice(0,slowShown).map(item=>(
          <div key={item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+t.border+"55"}}>
            <span style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text}}>{item.name}</span>
            <span style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,color:t.rd,background:t.rd+"12",padding:"3px 9px",borderRadius:6,flexShrink:0}}>
              {item.daysSince===null ? "Hakuna mauzo 30+ siku" : item.daysSince+" siku"}
            </span>
          </div>
        ))}
        <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim,marginTop:10,marginBottom:0,fontStyle:"italic"}}>💡 Fikiria kuondoa kwenye menyu, kupunguza bei, au kutangaza / Consider removing, discounting, or promoting these.</p>
      </Card>}
      {(() => {
        const marginColor = margin>25?t.gr:margin>0?t.gold:t.rd;
        const marginFillPct = Math.max(0, Math.min(100, margin));
        const actionTip = margin>=25
          ? {sw:"Afya njema — fikiria kuwekeza kwenye ukuaji.", en:"Healthy — consider reinvesting in growth."}
          : margin>=10
          ? {sw:"Karibu — punguza gharama kubwa zaidi kidogo.", en:"Close — trim your biggest cost a bit more."}
          : margin>=0
          ? {sw:"Chini ya afya njema — angalia Kishauri cha Faida chini.", en:"Below healthy — check Margin Advisor below."}
          : {sw:"Unapoteza pesa — hatua za haraka zinahitajika.", en:"Losing money — urgent action needed."};
        return (
          <Card glow style={{padding:"1.2rem",margin:"10px 0"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:14}}>
              <div style={{flex:"1 1 110px",minWidth:110,maxWidth:170}}>
                <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Maana Yake / Meaning</p>
                <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim,margin:0,lineHeight:1.5}}>
                  TZS <b style={{color:marginColor}}>{margin}</b> kati ya kila TZS 100 ya mauzo ni faida. / TZS {margin} of every 100 in sales is profit.
                </p>
              </div>
              <div style={{flexShrink:0,position:"relative",width:100,height:100}}>
                <svg width={100} height={100} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={50} cy={50} r={40} fill="none" stroke={marginColor} strokeWidth={9} strokeOpacity={0.12}/>
                  <circle cx={50} cy={50} r={40} fill="none" stroke={marginColor} strokeWidth={9} strokeDasharray={marginFillPct*2.513+" 251.3"} strokeLinecap="round" style={{filter:"drop-shadow(0 0 6px "+marginColor+"66)"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:900,color:marginColor,lineHeight:1}}>{margin}%</span>
                </div>
              </div>
              <div style={{flex:"1 1 110px",minWidth:110,maxWidth:170,textAlign:"right"}}>
                <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Hatua / Next Step</p>
                <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim,margin:0,lineHeight:1.5}}>
                  {actionTip.sw} / {actionTip.en}
                </p>
              </div>
            </div>
            <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"10px 0 10px",textAlign:"center"}}>Margin %</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",justifyContent:"center",borderTop:"1px solid "+t.border,paddingTop:10}}>
              <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr,display:"inline-block"}}/>25%+ Afya Njema/Healthy</span>
              <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gold,display:"inline-block"}}/>0-24% Boresha/Improve</span>
              <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:4}}><span style={{width:7,height:7,borderRadius:"50%",background:t.rd,display:"inline-block"}}/>&lt;0% Hasara/Losing</span>
            </div>
          </Card>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:8,margin:"0 0 10px"}}>
        <Chip label="Mapato Ghafi" value={presenterMode?"100%":fmt(gross)} color={t.gold} icon="💰"/>
        <Chip label="Faida Halisi" value={presenterMode?(gross?Math.round(net/gross*100):0)+"%":fmt(net)} color={net>=0?t.gr:t.rd} icon="📊"/>
        <Chip label="Mauzo/Sales" value={s30.length} color={t.bl} icon="🧾"/>
        <Chip label="Gharama Jumla" value={presenterMode?(gross?Math.round(costs/gross*100)+"%":"—"):fmt(costs)} color={t.rd} icon="🧾"/>
      </div>
      {(svcData.length>0||costData.length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:10}}>
          {svcData.length>0&&<Card style={{padding:"1rem"}}>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Service Mix / Aina ya Huduma</p>
            <Donut data={svcData} size={120}/>
          </Card>}
          {costData.length>0&&<Card style={{padding:"1rem"}}>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Cost Breakdown / Gharama kwa Aina</p>
            <Donut data={costData} size={120}/>
          </Card>}
        </div>
      )}
      {catMix.total>0&&<Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <IconBadge emoji="🍽️" color={t.gold}/>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Chakula vs Vinywaji / Food vs Beverages</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[["food","🍛","Chakula / Food",catMix.m.food.rev,catMix.m.food.qty,t.gr],["bev","🥂","Vinywaji / Beverages",catMix.bev,catMix.bevQty,t.bl]].map(([k,em,lb,v,q,col])=>(
            <div key={k} style={{background:col+"14",border:"1px solid "+col+"44",borderRadius:12,padding:"10px",minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,color:t.dim2}}>{em} {lb}</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:col,margin:"2px 0",overflowWrap:"anywhere"}}>{presenterMode?Math.round(v/catMix.total*100)+"%":fmt(v)}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{Math.round(v/catMix.total*100)}% · {q} {q===1?"sale item":"items"}</div>
            </div>
          ))}
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Ndani ya Vinywaji / Within Beverages</p>
        {catMix.bev===0?<p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:0}}>Hakuna mauzo ya vinywaji bado / No beverage sales in this period</p>:
        [["soft",t.gr],["beer",t.gold],["spirits",t.pu]].map(([k,col])=>{
          const v=catMix.m[k].rev, buy=catMix.buy[k];
          return (<div key={k} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.text,marginBottom:3}}>
              <span style={{minWidth:0}}>{CLS_META[k].l}</span>
              <span style={{flexShrink:0}}>{presenterMode?Math.round(v/catMix.bev*100)+"%":fmt(v)}</span>
            </div>
            <Bar value={v} max={catMix.bev} color={col} h={6}/>
            <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:3}}>
              {Math.round(v/catMix.bev*100)}% ya vinywaji · {catMix.m[k].qty} pcs{!presenterMode&&buy>0?" · Stock bought "+fmt(buy):""}
            </div>
          </div>);
        })}
        {catMix.bev>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
          <div style={{background:t.gr+"14",borderRadius:10,padding:"8px 10px"}}>
            <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase"}}>Bila Pombe / Non-alc</div>
            <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:800,color:t.gr}}>{presenterMode?Math.round(catMix.soft/catMix.bev*100)+"%":fmt(catMix.soft)}</div>
          </div>
          <div style={{background:t.pu+"14",borderRadius:10,padding:"8px 10px"}}>
            <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase"}}>Pombe / Alcoholic</div>
            <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:800,color:t.pu}}>{presenterMode?Math.round(catMix.alc/catMix.bev*100)+"%":fmt(catMix.alc)}</div>
          </div>
        </div>}
        {!presenterMode&&catMix.buyTotal>0&&<p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"10px 0 0"}}>Vinywaji: mauzo {fmt(catMix.bev)} − stock iliyonunuliwa {fmt(catMix.buyTotal)} = <b style={{color:catMix.bev-catMix.buyTotal>=0?t.gr:t.rd}}>{fmt(catMix.bev-catMix.buyTotal)}</b></p>}
      </Card>}
      {(wkCmp.cur.total>0||wkCmp.prevSame.total>0)&&<Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <IconBadge emoji="📆" color={t.gold}/>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Wiki Hii vs Iliyopita / This Week vs Last Week</p>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 10px",lineHeight:1.5}}>Siku {wkCmp.days} za kwanza za kila wiki (Jumamosi →) / First {wkCmp.days} day(s) of each week (from Saturday), so it is a fair comparison.</p>
        {[["🍛 Chakula / Food",wkCmp.cur.m.food.rev,wkCmp.prevSame.m.food.rev],["🥤 Bila Pombe / Non-alc",wkCmp.cur.soft,wkCmp.prevSame.soft],["🍺🥃 Pombe / Alcohol",wkCmp.cur.alc,wkCmp.prevSame.alc],["Jumla / Total",wkCmp.cur.total,wkCmp.prevSame.total]].map(([lb,c,p],i)=>{
          const d=deltaPct(c,p); const col=d===null?t.gr:d>0?t.gr:d<0?t.rd:t.dim2;
          return (<div key={lb} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderTop:i===3?"2px solid "+t.border:"1px solid "+t.border+"66"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:11,fontWeight:i===3?800:700,color:t.text}}>{lb}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{presenterMode?"—":fmt(c)+" vs "+fmt(p)}</div>
            </div>
            <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:800,color:col,flexShrink:0}}>{d===null?"▲ mpya/new":(d>0?"▲ +":d<0?"▼ ":"= ")+d+"%"}</div>
          </div>);
        })}
        {!presenterMode&&wkCmp.prevFull.total>0&&<p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"8px 0 0",lineHeight:1.5}}>Wiki iliyopita nzima / Last full week ({wkCmp.lastStart}→{wkCmp.lastEnd}): 🍛 {fmt(wkCmp.prevFull.m.food.rev)} · 🥤 {fmt(wkCmp.prevFull.soft)} · 🍺🥃 {fmt(wkCmp.prevFull.alc)}</p>}
      </Card>}
      {marginAdvice && <Card glow style={{padding:"1.1rem",border:"1px solid "+t.gold+"33"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <IconBadge emoji="🧠" color={t.gold}/>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.gold,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Kishauri cha Faida / Margin Advisor</p>
          </div>
          {marginAdvice.top.length>3 && <CountSelector value={advisorN} onChange={setAdvisorN} options={[3,5,10,"All"]} total={marginAdvice.top.length}/>}
        </div>
        {marginAdvice.cutNeeded>0 && (
          <div style={{background:t.gold+"12",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
            <p style={{fontFamily:"sans-serif",fontSize:11,color:t.text,margin:0,lineHeight:1.5}}>
              Ili kufikia lengo lako la <b style={{color:t.gold}}>1:{compassTarget}</b>, unahitaji kupunguza gharama kwa jumla ya <b style={{color:t.gold}}>{presenterMode?marginAdvice.pctCutOfTop+"%":fmt(marginAdvice.cutNeeded)}</b>{presenterMode?"":" (au ongeza mauzo kwa kiasi hicho)"}. Kupunguza <b>{marginAdvice.topLabel}</b> peke yake kwa <b style={{color:t.gold}}>{marginAdvice.pctCutOfTop}%</b> kunatosha kufikia lengo.
              <br/><span style={{color:t.dim2,fontSize:10}}>To hit your 1:{compassTarget} target, total costs need to drop by {presenterMode?marginAdvice.pctCutOfTop+"%":fmt(marginAdvice.cutNeeded)}{presenterMode?"":" (or grow revenue by that much instead)"}. Cutting just {marginAdvice.topLabel} by {marginAdvice.pctCutOfTop}% alone would get you there.</span>
            </p>
          </div>
        )}
        {marginAdvice.top.slice(0,advisorShown).map((cat,i)=>(
          <div key={cat.label} style={{marginBottom:i<advisorShown-1?14:0,paddingBottom:i<advisorShown-1?14:0,borderBottom:i<advisorShown-1?"1px solid "+t.border:"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.text}}>#{i+1} {cat.label}</span>
              <span style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.gold}}>{cat.pct}% {presenterMode?"":"("+fmt(cat.value)+")"} ya mauzo/of revenue</span>
            </div>
            {cat.tips.map((tip,ti)=>(
              <div key={ti} style={{display:"flex",gap:6,marginBottom:5}}>
                <span style={{color:t.gold,fontSize:11,flexShrink:0}}>→</span>
                <span style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,lineHeight:1.5}}>{tip}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>}
      {itemStats.length>0&&<Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <IconBadge emoji="🏆" color={t.gold}/>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Top Items / Bidhaa Bora</p>
          </div>
          {itemsView.length>5 && <CountSelector value={topItemsN} onChange={setTopItemsN} total={itemsView.length}/>}
        </div>
        {catMix.bev>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {[["all","Zote / All"],["food","🍛 Chakula"],["soft","🥤 Bila Pombe"],["beer","🍺 Bia"],["spirits","🥃 Pombe Kali"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTopFilter(k)} style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,padding:"5px 10px",borderRadius:99,cursor:"pointer",border:"1px solid "+(topFilter===k?t.gold:t.border||"#ccc"),background:topFilter===k?t.gold+"22":"transparent",color:topFilter===k?t.gold:t.dim2}}>{l}</button>
          ))}
        </div>}
        {itemsView.length===0&&<p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:"4px 0 0"}}>Hakuna mauzo / No sales</p>}
        {itemsView.slice(0,topItemsShown).map((item,i)=>{
          const maxRev = itemsView[0].rev;
          const ratio = maxRev>0 ? item.rev/maxRev : 0;
          const tempEmoji = ratio>=0.66 ? "🔥" : ratio<=0.33 ? "❄️" : "🌤️";
          const tempColor = ratio>=0.66 ? t.rd : ratio<=0.33 ? t.bl : t.gold;
          return (
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:i===0?t.gold:t.dim2,width:16,flexShrink:0}}>{i+1}</span>
            <IconBadge emoji={tempEmoji} color={tempColor}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.text,marginBottom:3}}>{item.name}</div>
              <Bar value={item.rev} max={itemsView[0].rev} color={i===0?t.gold:t.bl} h={5}/>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.text}}>{fmt(item.rev)}</div>
              {item.margin!==0&&<span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:item.margin<0?t.rd:item.margin<15?t.gold:t.gr}}>{item.margin}%</span>}
            </div>
          </div>
          );
        })}
        <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:4,marginBottom:0,fontStyle:"italic"}}>🔥 Inauzwa sana &nbsp; 🌤️ Wastani &nbsp; ❄️ Polepole</p>
      </Card>}
      {insights.length>0&&<div>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Business Insights / Ushauri</p>
        {insights.map((ins,i)=><div key={i} className={ins.glow?"jiko-glow":undefined} style={{...(ins.glow?{"--glow":ins.c==="warn"?"#ffb300":"#2ecc71"}:{}),background:ins.c==="good"?t.gr+"12":ins.c==="danger"?t.rd+"12":ins.c==="warn"?t.gold+"12":t.bl+"12",borderLeft:"3px solid "+(ins.c==="good"?t.gr:ins.c==="danger"?t.rd:ins.c==="warn"?t.gold:t.bl),borderRadius:"0 10px 10px 0",padding:"9px 13px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:t.text,lineHeight:1.5}}>{ins.msg}</div>)}
      </div>}
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <button onClick={sendAkiliReport} style={{flex:1,background:"rgba(37,211,102,0.12)",color:"#25d366",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-brand-whatsapp"/> Maandishi / Text
        </button>
        <button onClick={shareAkiliVisualImage} disabled={sharingImage} style={{flex:1,background:sharingImage?t.bg4:t.gold+"14",color:sharingImage?t.dim2:t.gold,border:"1px solid "+(sharingImage?t.border:t.gold+"44"),borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:sharingImage?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-photo"/> {sharingImage?"Inatengeneza...":"Picha Kamili / Full Image"}
        </button>
      </div>
      <ReportPreviewModal text={akiliPreview} onClose={()=>setAkiliPreview(null)}/>
    </div>
  );
}

/* ═══ MENU TAB ═══ */
function MenuTab() {
  const {t} = useT();
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost,customItems,addCustomItem,updateCustomItem,deleteCustomItem,stockQty,setStockQty,menuEdits={},editMenuItem,resetMenuItem,menuSections={},menuOrder={},setSectionOrder,setSectionPhoto,setItemOrder} = useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [ced,setCed]=useState(null);const [cv,setCv]=useState("");const [qed,setQed]=useState(null);const [qv,setQv]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const BLANK={sw:"",en:"",pr:"",ph:"",em:"🍽️",sectionName:"Bidhaa Mpya / Specials"};
  const [newItem,setNewItem]=useState(BLANK);
  const [editId,setEditId]=useState(null);
  const [newSecMode,setNewSecMode]=useState(false);
  // Section choices: ready-made beverage sections + any section already used by saved items
  const PRESET_SECS=[...sections.map(secLabel),SEC_BIA,SEC_POMBE,SEC_SPECIALS];
  const secChoices=[...new Set([...PRESET_SECS,...customItems.map(c=>c.sectionName||"Bidhaa Mpya / Specials")])];
  const setNI=k=>e=>setNewItem(p=>({...p,[k]:e.target.value}));
  function resetForm(){setNewItem(BLANK);setEditId(null);setNewSecMode(false);setShowAdd(false);}
  function startEdit(it){
    setNewItem({sw:it.sw||"",en:it.en||"",pr:String(it.pr||""),ph:it.ph||"",em:it.em||"🍽️",sectionName:it.sectionName||"Bidhaa Mpya / Specials"});
    setEditId(it.id);setNewSecMode(false);setShowAdd(true);
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),80);
  }
  function saveNew(){
    if(!newItem.sw.trim()||!String(newItem.pr).trim())return;
    const clean={...newItem,sectionName:(newItem.sectionName||"").trim()||"Bidhaa Mpya / Specials"};
    if(editId)updateCustomItem(editId,clean); else addCustomItem(clean);
    resetForm();
  }
  const formRef=useRef(null);
  const builtInLabels=sections.map(secLabel);
  // Own sections for custom items (Bia, Pombe Kali, and any other section name you typed) — shown as numbered blocks like the built-in ones
  const blockSecs=[...new Set([SEC_BIA,SEC_POMBE,...customItems.map(c=>c.sectionName||SEC_SPECIALS).filter(n=>!builtInLabels.includes(n))])];
  // All sections (built-in + custom) in the owner's chosen order
  const orderedSecs=[...sections.map(b=>({key:b.id,builtin:b})),...blockSecs.map(n=>({key:n}))].map((o,i)=>({...o,_i:i}))
    .sort((a,b)=>secOrderOf(menuSections,a.key,a._i)-secOrderOf(menuSections,b.key,b._i)||a._i-b._i);
  function moveSec(key,dir){const keys=orderedSecs.map(o=>o.key);const i=keys.indexOf(key),j=i+dir;if(i<0||j<0||j>=keys.length)return;[keys[i],keys[j]]=[keys[j],keys[i]];setSectionOrder(keys);}
  const [psec,setPsec]=useState(null);
  // Items of a section in the owner's chosen order (built-in items + custom items placed in that section)
  function secRows(key,sec){
    const rows=[
      ...(sec?menu.filter(m=>m.section===sec.id).map(m0=>({kind:"b",id:m0.id,item:withEdit(m0,menuEdits)})):[]),
      ...customItems.filter(c=>(c.sectionName||SEC_SPECIALS)===(sec?secLabel(sec):key)).map(c=>({kind:"c",id:c.id,it:c}))
    ];
    return rows.map((r,i)=>({...r,_i:i})).sort((a,b)=>posOf(menuOrder,a.id,a._i)-posOf(menuOrder,b.id,b._i)||a._i-b._i);
  }
  function moveItem(ids,id,dir){
    const arr=[...ids];let i=arr.indexOf(id);if(i<0)return;
    let j=i+dir;while(j>=0&&j<arr.length&&menuEdits[arr[j]]?.hidden)j+=dir; // skip removed items
    if(j<0||j>=arr.length)return;
    [arr[i],arr[j]]=[arr[j],arr[i]];setItemOrder(arr);
  }
  const arrowBtn=(on,label,dis)=><button onClick={on} disabled={dis} style={{background:dis?"transparent":"#ffffff33",border:"1px solid #ffffff66",color:"#fff",opacity:dis?0.35:1,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:dis?"default":"pointer"}}>{label}</button>;
  const miniArrow=(on,label)=><button onClick={on} style={{background:t.bg4,border:"1px solid "+t.border,color:t.dim2,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,cursor:"pointer",lineHeight:1}}>{label}</button>;
  function secBar(key,si){
    const ph=menuSections[key]?.photo;
    return <div>
      <div style={{background:t.gold,padding:"0 14px 9px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        {arrowBtn(()=>moveSec(key,-1),"▲ Juu",si===0)}
        {arrowBtn(()=>moveSec(key,1),"▼ Chini",si===orderedSecs.length-1)}
        {arrowBtn(()=>setPsec(psec===key?null:key),ph?"📷 Picha ✓":"📷 Picha",false)}
        {ph&&<img src={ph} alt="" style={{width:26,height:26,objectFit:"cover",borderRadius:6,border:"1px solid #fff9"}}/>}
      </div>
      {psec===key&&<div style={{background:t.bg4,padding:"10px 14px",border:"1px solid "+t.border,borderTop:"none"}}>
        <p style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,margin:"0 0 6px"}}>Picha ya sehemu hii (inaonekana kwenye menyu ya wateja) / Section photo shown on the customer menu</p>
        <PhotoPicker t={t} value={ph||""} onChange={u=>setSectionPhoto(key,u)}/>
      </div>}
    </div>;
  }
  function customRow(it,i,ids){
    return <div key={it.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:i%2===0?t.bg4:"transparent",borderTop:i>0?"1px solid "+t.border+"55":"none",flexWrap:"wrap"}}>
      <ItemThumb it={it}/>
      <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{it.sw}</div><div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>✨ Mpya · TZS {it.pr}</div></div>
      {miniArrow(()=>moveItem(ids,it.id,-1),"▲")}{miniArrow(()=>moveItem(ids,it.id,1),"▼")}
      <button onClick={()=>startEdit(it)} style={{background:t.gold+"18",border:"1px solid "+t.gold+"44",color:t.gold,borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Hariri</button>
      <button onClick={()=>{if(confirm("Delete this item?"))deleteCustomItem(it.id);}} style={{background:t.rd+"18",border:"1px solid "+t.rd+"44",color:t.rd,borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Futa</button>
    </div>;
  }
  function renderBlock(name,si){
    const rows=secRows(name,null);const ids=rows.map(r=>r.id);
    return <div key={name} style={{marginBottom:14}}>
      <div style={{background:t.gold,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{background:"#fff",color:t.gold,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
        <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#fff",flex:1}}>{name}</span>
        <button onClick={()=>addHere(name)} style={{background:"#fff",color:t.gold,border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>+ Ongeza</button>
      </div>
      {secBar(name,si)}
      <div style={{border:"1px solid "+t.border,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:t.bg2}}>
        {rows.length===0&&<p style={{textAlign:"center",color:t.dim2,fontFamily:"sans-serif",fontSize:12,padding:"14px 0",margin:0}}>Hakuna bidhaa bado — bonyeza "+ Ongeza". / Nothing here yet.</p>}
        {rows.map((r,i)=>customRow(r.it,i,ids))}
      </div>
    </div>;
  }
  const [eid,setEid]=useState(null);const [ef,setEf]=useState({sw:"",en:"",em:"",ph:""});
  function addHere(label){setNewItem({...BLANK,sectionName:label});setEditId(null);setNewSecMode(false);setShowAdd(true);setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),80);}
  function startEditBuiltin(item){const e=menuEdits[item.id]||{};setEf({sw:e.sw||item.name.sw,en:e.en||item.name.en||"",em:e.em||item.emoji||"",ph:e.ph||""});setEid(item.id);}
  function saveBuiltin(item){
    const o=menu.find(m=>m.id===item.id)||item; // compare with the ORIGINAL so unchanged fields stay un-overridden
    const patch={sw:ef.sw.trim()===o.name.sw?"":ef.sw.trim(),en:ef.en.trim()===(o.name.en||"")?"":ef.en.trim(),em:ef.em.trim()===(o.emoji||"")?"":ef.em.trim(),ph:ef.ph.trim()};
    editMenuItem(item.id,patch);setEid(null);
  }
  return (
    <div style={{padding:"1rem"}}>
      {orderedSecs.map((o,si)=>{ if(!o.builtin) return renderBlock(o.key,si); const sec=o.builtin; return <div key={sec.id} style={{marginBottom:14}}>
        <div style={{background:t.gold,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{background:"#fff",color:t.gold,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
          <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#fff",flex:1}}>{sec.name.sw}</span>
          <button onClick={()=>addHere(secLabel(sec))} style={{background:"#fff",color:t.gold,border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>+ Ongeza</button>
        </div>
        {secBar(sec.id,si)}
        <div style={{border:"1px solid "+t.border,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:t.bg2}}>
          {(()=>{const rows=secRows(sec.id,sec);const ids=rows.map(r=>r.id);return rows.map((r,i)=>{
            if(r.kind==="c") return customRow(r.it,i,ids);
            const item=r.item;
            const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0); const cost=itemCosts[item.id]; const oos=!!stock[item.id];
            if(menuEdits[item.id]?.hidden) return <div key={item.id} style={{padding:"9px 14px",display:"flex",alignItems:"center",gap:8,borderTop:i>0?"1px solid "+t.border+"55":"none",opacity:0.6}}>
              <span style={{fontSize:16,filter:"grayscale(1)"}}>{item.emoji}</span>
              <div style={{flex:1,minWidth:0,fontFamily:"sans-serif",fontSize:12,color:t.dim2,textDecoration:"line-through",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
              <span style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,fontWeight:700}}>IMEONDOLEWA</span>
              <button onClick={()=>editMenuItem(item.id,{hidden:false})} style={{background:t.gr+"18",border:"1px solid "+t.gr+"44",color:t.gr,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>↩ Rudisha</button>
            </div>;
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
              <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26,marginTop:3}}>
                <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>Stoki/Stock:</span>
                {qed===item.id?<div style={{display:"flex",gap:4}}>
                  <input type="number" value={qv} onChange={e=>setQv(e.target.value)} autoFocus placeholder="0" style={{width:62,padding:"2px 6px",borderRadius:4,border:"1px solid "+t.bl,background:t.inputBg,fontFamily:"sans-serif",fontSize:11,color:t.inputColor,outline:"none"}}/>
                  <button onClick={()=>{setStockQty(item.id,qv);setQed(null);}} style={{background:t.bl,color:"#fff",border:"none",borderRadius:4,padding:"2px 7px",fontSize:11,cursor:"pointer",fontWeight:700}}>OK</button>
                </div>:<button onClick={()=>{setQed(item.id);setQv(String(stockQty[item.id]||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:10,color:stockQty[item.id]?t.bl:t.dim2,cursor:"pointer",padding:0}}>{stockQty[item.id]?stockQty[item.id]+" units":"Weka kiasi"}</button>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,paddingLeft:26,marginTop:6}}>
                <button onClick={()=>startEditBuiltin(item)} style={{background:t.gold+"18",border:"1px solid "+t.gold+"44",color:t.gold,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Hariri</button>
                <button onClick={()=>{if(confirm("Ondoa \""+item.name.sw+"\" kwenye menyu? / Remove from menu? (unaweza kurudisha / you can restore it)"))editMenuItem(item.id,{hidden:true});}} style={{background:t.rd+"18",border:"1px solid "+t.rd+"44",color:t.rd,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑 Ondoa</button>
                <span style={{marginLeft:"auto",display:"flex",gap:4}}>{miniArrow(()=>moveItem(ids,item.id,-1),"▲")}{miniArrow(()=>moveItem(ids,item.id,1),"▼")}</span>
                {(menuEdits[item.id]?.sw||menuEdits[item.id]?.en||menuEdits[item.id]?.em||menuEdits[item.id]?.ph)&&<button onClick={()=>resetMenuItem(item.id)} style={{background:"none",border:"none",color:t.dim2,fontSize:10,cursor:"pointer",textDecoration:"underline",padding:0}}>Rudisha asili</button>}
              </div>
              {eid===item.id&&<div style={{background:t.bg4,border:"1px solid "+t.gold+"55",borderRadius:10,padding:10,margin:"8px 0 0 26px"}}>
                <div style={{display:"grid",gridTemplateColumns:"56px 1fr",gap:6,marginBottom:6}}>
                  <input value={ef.em} onChange={e=>setEf(p=>({...p,em:e.target.value}))} style={{padding:8,borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontSize:18,textAlign:"center",color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
                  <input value={ef.sw} onChange={e=>setEf(p=>({...p,sw:e.target.value}))} placeholder="Jina la Kiswahili" style={{padding:"8px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
                </div>
                <input value={ef.en} onChange={e=>setEf(p=>({...p,en:e.target.value}))} placeholder="English name" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
                <PhotoPicker t={t} value={ef.ph} onChange={u=>setEf(p=>({...p,ph:u}))}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>saveBuiltin(item)} disabled={!ef.sw.trim()} style={{flex:1,background:t.gr,color:"#fff",border:"none",borderRadius:8,padding:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>Hifadhi / Save</button>
                  <button onClick={()=>setEid(null)} style={{background:t.bg2,color:t.dim2,border:"1px solid "+t.border,borderRadius:8,padding:"9px 14px",fontSize:12,cursor:"pointer"}}>✕</button>
                </div>
              </div>}
            </div>;
          });})()}
        </div>
      </div>;})}

      {/* ═══ CUSTOM ITEMS / BIDHAA MPYA ═══ */}
      <div style={{marginTop:18}}>
        <div style={{background:t.gold,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#fff",color:t.gold,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:900}}>✨</div>
            <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#fff"}}>Ongeza Bidhaa Mpya / Add New Item</span>
          </div>
          <button onClick={()=>{if(showAdd)resetForm();else setShowAdd(true);}} style={{background:"#fff",color:t.gold,border:"none",borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{showAdd?"✕ Funga":"+ Ongeza"}</button>
        </div>
        <div style={{border:"1px solid "+t.border,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:t.bg2,padding:"12px"}}>
          {showAdd && <div ref={formRef} style={{background:t.bg4,borderRadius:10,padding:12,marginBottom:10}}>
            <p style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:1}}>{editId?"Edit Item / Hariri Bidhaa":"New Item / Bidhaa Mpya"}</p>
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:8,marginBottom:8}}>
              <input value={newItem.em} onChange={setNI("em")} placeholder="🍽️" style={{padding:"9px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:18,textAlign:"center",color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
              <input value={newItem.sw} onChange={setNI("sw")} placeholder="Jina la Kiswahili *" style={{padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <input value={newItem.en} onChange={setNI("en")} placeholder="English name (optional)" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            <input value={newItem.pr} onChange={setNI("pr")} placeholder="Bei (e.g. 2,500) *" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            <PhotoPicker t={t} value={newItem.ph} onChange={u=>setNewItem(p=>({...p,ph:u}))}/>
            <p style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,color:t.dim2,margin:"0 0 4px"}}>Sehemu / Section (mfano: Bia, Soda)</p>
            <select value={newSecMode?"__new__":newItem.sectionName} onChange={e=>{if(e.target.value==="__new__"){setNewSecMode(true);setNewItem(p=>({...p,sectionName:""}));}else{setNewSecMode(false);setNewItem(p=>({...p,sectionName:e.target.value}));}}} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}>
              {secChoices.map(n=><option key={n} value={n}>{n}</option>)}
              <option value="__new__">➕ Sehemu mpya / New section…</option>
            </select>
            {newSecMode && <input value={newItem.sectionName} onChange={setNI("sectionName")} placeholder="Jina la sehemu / Section name (Kiswahili / English)" autoFocus style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.gold,background:t.inputBg,fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>}
            <div style={{height:2}}/>
            <button onClick={saveNew} disabled={!newItem.sw||!newItem.pr||!newItem.sectionName.trim()} style={{width:"100%",background:(!newItem.sw||!newItem.pr)?t.bg4:"linear-gradient(135deg,"+t.gr+",#009940)",color:(!newItem.sw||!newItem.pr)?t.dim2:"#fff",border:"none",borderRadius:10,padding:11,fontSize:13,fontWeight:700,cursor:(!newItem.sw||!newItem.pr)?"default":"pointer"}}>{editId?"Save Changes / Hifadhi Mabadiliko":"Save & Show on Website / Hifadhi"}</button>
          </div>}
          {!showAdd && <p style={{textAlign:"center",color:t.dim2,fontFamily:"sans-serif",fontSize:12,padding:"10px 0",margin:0}}>Bonyeza "+ Ongeza" hapa, au kwenye sehemu yoyote juu. / Tap "+ Ongeza" here, or on any section above.</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══ ORDERS TAB ═══ */
function MaagizoTab() {
  const {t} = useT();
  const {orders,addOrder,updateOrderStatus} = useAdmin();
  // Repeat customer detection — group all orders by phone number
  const repeatCustomers = useMemo(()=>{
    const byPhone = {};
    orders.forEach(o=>{
      const phone=(o.customer_phone||"").trim();
      if(!phone) return;
      if(!byPhone[phone]) byPhone[phone]={phone,name:o.customer_name,count:0,total:0,lastOrder:o.created_at||o.time};
      byPhone[phone].count+=1;
      byPhone[phone].total+=(o.total||0);
      const ts=o.created_at||o.time;
      if(ts && (!byPhone[phone].lastOrder || ts>byPhone[phone].lastOrder)){
        byPhone[phone].lastOrder=ts;
        byPhone[phone].name=o.customer_name;
      }
    });
    return Object.values(byPhone).filter(c=>c.count>=2).sort((a,b)=>b.count-a.count).slice(0,10);
  },[orders]);
  const [show,setShow]=useState(false);
  const [f,setF]=useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  // Orders saved by customers carry created_at (not time) — read either one.
  const td=orders.filter(o=>new Date(o.created_at||o.time).toDateString()===new Date().toDateString());
  const inp={width:"100%",padding:"9px 11px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Leo/All" value={td.length} color={t.gold} icon="📋"/>
        <Chip label="Pending" value={td.filter(o=>o.status==="pending").length} color={t.rd} icon="⏳"/>
        <Chip label="Done" value={td.filter(o=>o.status==="done").length} color={t.gr} icon="✅"/>
      </div>
{repeatCustomers.length>0 && <Card style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><IconBadge emoji="⭐" color={t.gold}/><p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:t.gold,textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Wateja wa Kudumu / Repeat Customers</p></div>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.dim2,margin:"0 0 10px"}}>Wameagiza mara 2+ / Ordered 2+ times</p>
        {repeatCustomers.map(c=>(
          <div key={c.phone} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+t.border+"55"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:t.gold+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:t.gold,flexShrink:0}}>{c.count}×</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text}}>{c.name}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{c.phone}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold}}>{fmt(c.total)}</div>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>jumla/total</div>
            </div>
          </div>
        ))}
      </Card>}
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
          <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{o.customer||o.customer_name}</div>
          <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,marginTop:1}}>{new Date(o.created_at||o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/New_York"})} · {o.service}{(o.phone||o.customer_phone)?" · "+(o.phone||o.customer_phone):""}</div>
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

/* ═══ TAB: BACKUP / EXPORT ═══ */
function BackupTab() {
  const {t} = useT();
  const {exportAll, importAll, allSales, allCosts, customItems} = useAdmin();
  const [status,setStatus]=useState("");
  const [importText,setImportText]=useState("");
  async function doExport(){
    const json = await exportAll();
    const blob = new Blob([json],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jiko-backup-"+today()+".json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("✓ Downloaded / Imepakuliwa");
    setTimeout(()=>setStatus(""),3000);
  }
  function csvEscape(val){
    const s = String(val==null?"":val);
    return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
  }
  function downloadCSV(rows, headers, filename){
    const lines = [headers.join(",")];
    rows.forEach(r=>lines.push(headers.map(h=>csvEscape(r[h])).join(",")));
    const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  function doExportSalesCSV(){
    const cm={};(customItems||[]).forEach(c=>{cm[c.id]=c.sectionName||"";});
    const typeLbl={food:"Chakula/Food",soft:"Bila Pombe/Non-alcoholic",beer:"Bia/Beer",spirits:"Pombe Kali/Spirits"};
    downloadCSV(
      allSales.map(r=>({...r,aina:typeLbl[classifyItem(r.item_id,r.section_id,r.item_name,cm)]})),
      ["sale_date","item_name","aina","quantity","unit_price","total_price","service_type","created_at"],
      "jiko-mauzo-"+today()+".csv"
    );
    setStatus("✓ Mauzo CSV imepakuliwa / Sales CSV downloaded");
    setTimeout(()=>setStatus(""),3000);
  }
  function doExportCostsCSV(){
    downloadCSV(
      allCosts,
      ["cost_date","category","description","amount","spending_type","created_at"],
      "jiko-gharama-"+today()+".csv"
    );
    setStatus("✓ Gharama CSV imepakuliwa / Costs CSV downloaded");
    setTimeout(()=>setStatus(""),3000);
  }
  function onFile(e){
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=async ev=>{setImportText(ev.target.result);};
    r.readAsText(f);
  }
  async function doImport(){
    if(!importText){setStatus("× No file selected");return;}
    const res=await importAll(importText);
    setStatus(res.ok?"✓ "+res.msg:"× "+res.msg);
    setTimeout(()=>setStatus(""),3500);
  }
  return (
    <div style={{padding:"1rem"}}>
      <Card style={{padding:"1.2rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Backup / Hifadhi Akiba</p>
        <p style={{fontFamily:"sans-serif",fontSize:"12px",color:t.dim,marginBottom:14,lineHeight:1.5}}>
          Pakua faili la backup yenye data zote: bei, stoki, gharama, malengo, maagizo. / Download a complete backup with prices, stock, costs, goals, and orders.
        </p>
        <button onClick={doExport} style={{width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <i className="ti ti-download"/> Download Backup / Pakua
        </button>

        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"16px 0 8px"}}>CSV kwa Excel / Accounting</p>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim,marginBottom:10,lineHeight:1.5}}>
          Faili za CSV zinafunguka moja kwa moja kwenye Excel/Sheets. / CSV files open directly in Excel/Sheets for your accountant.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <button onClick={doExportSalesCSV} style={{background:t.gr+"15",color:t.gr,border:"1px solid "+t.gr+"44",borderRadius:10,padding:11,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <i className="ti ti-file-spreadsheet"/> Mauzo CSV
          </button>
          <button onClick={doExportCostsCSV} style={{background:t.rd+"15",color:t.rd,border:"1px solid "+t.rd+"44",borderRadius:10,padding:11,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <i className="ti ti-file-spreadsheet"/> Gharama CSV
          </button>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"16px 0 12px"}}>Restore / Rejesha</p>
        <p style={{fontFamily:"sans-serif",fontSize:"12px",color:t.dim,marginBottom:10,lineHeight:1.5}}>
          Chagua faili la JSON kurejesha data. / Select a JSON backup file to restore data.
        </p>
        <input type="file" accept=".json,application/json" onChange={onFile} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px dashed "+t.gold+"66",background:t.bg4,color:t.text,fontFamily:"sans-serif",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10,cursor:"pointer"}}/>
        <button onClick={doImport} disabled={!importText} style={{width:"100%",background:importText?"linear-gradient(135deg,"+t.gr+",#009940)":t.bg4,color:importText?"#fff":t.dim2,border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:importText?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <i className="ti ti-upload"/> Restore / Rejesha
        </button>

        {status&&<p style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:status.startsWith("✓")?t.gr+"18":t.rd+"18",color:status.startsWith("✓")?t.gr:t.rd,fontFamily:"sans-serif",fontSize:12,fontWeight:700,textAlign:"center"}}>{status}</p>}
      </Card>

      <div style={{background:t.bg4,borderRadius:12,padding:"1rem",marginTop:10,border:"1px solid "+t.border}}>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.gold,marginBottom:6}}>💡 Tip / Kidokezo</p>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim,lineHeight:1.5,margin:0}}>Pakua backup kila wiki na uihifadhi kwenye Google Drive au email. / Download a backup every week and save it to Google Drive or email it to yourself.</p>
      </div>
    </div>
  );
}

/* ═══ TAB: WAFANYAKAZI & WAKANDARASI / STAFF & CONTRACTORS ═══ */
// ── Barua / Staff Notices — discipline & termination messages sent via WhatsApp (wa.me link; the owner taps Send) ──
const NOTICE_TYPES=[
  {k:"verbal",  db:"verbal",  tag:"ONYO LA MDOMO",           sw:"Onyo la Mdomo",           en:"Verbal warning",      c:"gold"},
  {k:"written", db:"written", tag:"ONYO LA MAANDISHI",       sw:"Onyo la Maandishi",       en:"Written warning",     c:"rd"},
  {k:"final",   db:"written", tag:"ONYO LA MWISHO",          sw:"Onyo la Mwisho",          en:"Final warning",       c:"rd"},
  {k:"hearing", db:"written", tag:"WITO WA KUSIKILIZWA",     sw:"Wito wa Kusikilizwa",     en:"Hearing invitation",  c:"bl"},
  {k:"suspend", db:"written", tag:"KUSIMAMISHWA KAZI",       sw:"Kusimamishwa Kazi",       en:"Suspension",          c:"pu"},
  {k:"terminate",db:"written",tag:"KUSITISHWA AJIRA",        sw:"Kusitisha Ajira",         en:"Termination",         c:"rd"},
];
function waPhone(p){
  let d=String(p||"").replace(/[^0-9]/g,"");
  if(!d) return "";
  if(d.startsWith("00")) d=d.slice(2);
  if(d.startsWith("0")) d="255"+d.slice(1);
  else if(d.length===9&&/^[67]/.test(d)) d="255"+d;
  return d.length>=11?d:"";
}
// Which number to message an applicant on: their stated WhatsApp number, else the phone they gave. "no" = no WhatsApp (use SMS).
function appWaNum(r){ const w=String(r.whatsapp||""); if(w==="no") return ""; if(w&&w!=="yes") return waPhone(w)||waPhone(r.phone); return waPhone(r.phone); }
function niceDate(d){ try{ return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }catch{ return d; } }
function buildNotice(k,{name,role,reason,date,when,days,paid,payNote}){
  const who="Kwa / To: *"+name+"*"+(role?" ("+role+")":"")+"\nTarehe / Date: "+niceDate(date);
  const why=reason?reason:"…";
  const B={
    verbal:{t:"KUMBUKUMBU YA ONYO LA MDOMO / VERBAL WARNING RECORD",
      sw:"Hii ni kumbukumbu ya onyo la mdomo lililotolewa kwako kuhusu: "+why+".\nTunatarajia mabadiliko ya haraka.",
      en:"This records the verbal warning given to you about: "+why+".\nWe expect immediate improvement."},
    written:{t:"ONYO LA MAANDISHI / WRITTEN WARNING",
      sw:"Unapewa onyo la maandishi kuhusu: "+why+".\nKurudia kosa hili kunaweza kusababisha hatua kali zaidi, ikiwemo onyo la mwisho au kusitishwa kwa ajira.",
      en:"You are given a written warning about: "+why+".\nRepeating this may lead to stronger action, including a final warning or termination of employment."},
    final:{t:"ONYO LA MWISHO / FINAL WARNING",
      sw:"Hili ni onyo lako la MWISHO kuhusu: "+why+".\nKosa jingine linaweza kusababisha kusitishwa kwa ajira yako.",
      en:"This is your FINAL warning about: "+why+".\nAnother offence may result in termination of your employment."},
    hearing:{t:"WITO WA KUSIKILIZWA / HEARING INVITATION",
      sw:"Unaitwa kusikilizwa kuhusu: "+why+".\nSiku na saa: "+(when||"…")+".\nUna haki ya kujieleza na kuja na mfanyakazi mwenzako wa kukusaidia.",
      en:"You are invited to a hearing about: "+why+".\nDate & time: "+(when||"…")+".\nYou have the right to explain your side and bring a co-worker to support you."},
    suspend:{t:"KUSIMAMISHWA KAZI / SUSPENSION",
      sw:"Umesimamishwa kazi kwa siku "+(days||"…")+" kuanzia "+niceDate(date)+" kwa sababu ya: "+why+".\nMshahara wakati wa kusimamishwa: "+(paid?"UTALIPWA":"HAUTALIPWA")+".\nUtajulishwa uamuzi wa mwisho.",
      en:"You are suspended for "+(days||"…")+" day(s) from "+niceDate(date)+" because of: "+why+".\nPay during suspension: "+(paid?"PAID":"UNPAID")+".\nYou will be told the final decision."},
    terminate:{t:"KUSITISHWA KWA AJIRA / TERMINATION OF EMPLOYMENT",
      sw:"Tunasikitika kukujulisha kuwa ajira yako imesitishwa kuanzia "+niceDate(when||date)+" kutokana na: "+why+"."+(payNote?"\nMalipo ya mwisho: "+payNote+".":"")+"\nTafadhali rudisha mali zote za kazi (funguo, sare, n.k.).",
      en:"We regret to inform you that your employment is terminated effective "+niceDate(when||date)+" due to: "+why+"."+(payNote?"\nFinal pay: "+payNote+".":"")+"\nPlease return all work property (keys, uniform, etc.)."},
  }[k];
  return "📋 *"+B.t+"*\nUnyamwezini Jiko La Bibi JJJ\n\n"+who+"\n\n"+B.sw+"\n\n"+B.en+"\n\nTafadhali jibu *NIMEPOKEA* kuthibitisha umepokea. / Please reply *RECEIVED* to confirm.\n\n— Uongozi / Management";
}
function NoticeComposer({s,onClose,onSaved,onRemove,initial="written"}){
  const {t}=useT();
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:6};
  const [k,setK]=useState(initial);
  const [reason,setReason]=useState("");
  const [date,setDate]=useState(today());
  const [when,setWhen]=useState("");
  const [days,setDays]=useState("");
  const [paid,setPaid]=useState(false);
  const [payNote,setPayNote]=useState("");
  const [phone,setPhone]=useState(s.phone||"");
  const [edit,setEdit]=useState(null);
  const [removeToo,setRemoveToo]=useState(true);
  const [copied,setCopied]=useState(false);
  const nt=NOTICE_TYPES.find(x=>x.k===k);
  const built=buildNotice(k,{name:s.name,role:s.role,reason:reason.trim(),date,when:k==="terminate"?(when||date):when,days,paid,payNote});
  const text=edit!==null?edit:built;
  const num=waPhone(phone);
  const up=fn=>e=>{fn(e.target.value);setEdit(null);};
  const ready=reason.trim().length>0;
  function save(){
    onSaved(s.id,s.name,nt.db,"["+nt.tag+"] "+reason.trim(),date);
    if(k==="terminate"&&removeToo) onRemove(s);
  }
  function send(){
    if(!ready||!num) return;
    save();
    window.open("https://wa.me/"+num+"?text="+encodeURIComponent(text),"_blank");
    onClose();
  }
  function copy(){ try{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{} }
  return (
    <div style={{marginTop:8,padding:10,background:t.bg4,borderRadius:10,border:"1px solid "+t.rd+"33"}}>
      <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.rd,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>📲 Barua kwa {s.name} / Notice via WhatsApp</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
        {NOTICE_TYPES.map(x=>{const col=t[x.c];return <button key={x.k} onClick={()=>{setK(x.k);setEdit(null);}} style={{padding:"7px 4px",borderRadius:8,border:"1.5px solid "+(k===x.k?col:t.border),background:k===x.k?col+"18":"transparent",color:k===x.k?col:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer",lineHeight:1.25}}>{x.sw}<br/><span style={{fontWeight:500}}>{x.en}</span></button>;})}
      </div>
      {k==="terminate"&&<div style={{background:t.gold+"15",border:"1px solid "+t.gold+"55",borderRadius:8,padding:"7px 9px",marginBottom:8,fontFamily:"sans-serif",fontSize:10,color:t.text,lineHeight:1.5}}>⚠️ Kabla ya kusitisha ajira: hakikisha kuna sababu halali na umefuata utaratibu wa haki (onyo, kusikilizwa, notisi, malipo ya mwisho) kulingana na Sheria ya Ajira na Mahusiano Kazini Tanzania. Waulize Afisa Kazi kama huna uhakika. / Before terminating: make sure there is a valid reason and a fair process (warnings, hearing, notice, final pay) under Tanzania's Employment &amp; Labour Relations Act. Ask a labour officer if unsure.</div>}
      <input value={reason} onChange={up(setReason)} placeholder="Sababu / Reason *" style={inp}/>
      <input type="date" value={date} onChange={up(setDate)} style={inp}/>
      {(k==="hearing")&&<input value={when} onChange={up(setWhen)} placeholder="Siku na saa / Date & time (e.g. Ijumaa saa 4 asubuhi)" style={inp}/>}
      {(k==="terminate")&&<><input type="date" value={when||date} onChange={up(setWhen)} style={inp}/><input value={payNote} onChange={up(setPayNote)} placeholder="Malipo ya mwisho / Final pay note (optional)" style={inp}/></>}
      {(k==="suspend")&&<><input type="number" value={days} onChange={up(setDays)} placeholder="Siku / Number of days" style={inp}/><button onClick={()=>{setPaid(p=>!p);setEdit(null);}} style={{width:"100%",marginBottom:6,padding:8,borderRadius:8,border:"1.5px solid "+(paid?t.gr:t.border),background:paid?t.gr+"18":"transparent",color:paid?t.gr:t.dim2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{paid?"✅ Na mshahara / Paid":"❌ Bila mshahara / Unpaid"} (bonyeza kubadili / tap to switch)</button></>}
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Simu ya WhatsApp / WhatsApp number (07xx…)" style={inp}/>
      {!num&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,marginBottom:6}}>Weka namba sahihi (mfano 0712 345 678). / Enter a valid number (e.g. 0712 345 678).</div>}
      <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",margin:"4px 0 4px"}}>Ujumbe / Message (unaweza kuhariri / editable)</p>
      <textarea value={text} onChange={e=>setEdit(e.target.value)} rows={9} style={{...inp,fontSize:11,lineHeight:1.45,resize:"vertical"}}/>
      {k==="terminate"&&<label style={{display:"flex",alignItems:"center",gap:7,fontFamily:"sans-serif",fontSize:11,color:t.text,marginBottom:8}}><input type="checkbox" checked={removeToo} onChange={e=>setRemoveToo(e.target.checked)}/> Mhamishe kwenye Zamani/Former baada ya kutuma / Move to Former Staff after sending</label>}
      <div style={{display:"flex",gap:6}}>
        <button onClick={send} disabled={!ready||!num} style={{flex:2,background:(!ready||!num)?t.bg4:"#25D366",color:(!ready||!num)?t.dim2:"#fff",border:"none",borderRadius:8,padding:10,fontSize:12,fontWeight:800,cursor:(!ready||!num)?"default":"pointer"}}>📲 Tuma WhatsApp / Send</button>
        <button onClick={copy} style={{flex:1,background:t.bg,color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:10,fontSize:11,cursor:"pointer"}}>{copied?"✓":"📋 Nakili"}</button>
        <button onClick={onClose} style={{background:t.bg,color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:"10px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
      </div>
      <p style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,margin:"7px 0 0",lineHeight:1.5}}>Itafungua WhatsApp na ujumbe tayari — bonyeza Send hapo. Rekodi huhifadhiwa kwenye Maonyo. / Opens WhatsApp with the message ready — tap Send there. A record is saved in Warnings history.</p>
    </div>
  );
}
function StaffMemberCard({s, isEditing, form, setForm, onStartEdit, onCancelEdit, onSave, onDelete, onPay, payForm, setPayForm, showPay, setShowPay, myWarnings, onAddWarning, onDeleteWarning, onRemove, onReactivate, isFormer, totalPayroll}) {
  const {t, presenterMode} = useT();
  const isContractor = s.type === "contractor";
  const isSeasonal = s.type === "seasonal";
  const accent = isFormer ? t.dim2 : (isContractor ? t.pu : (isSeasonal ? t.bl : t.gr));
  const inp = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  const setF = k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const setPF = k=>e=>setPayForm(p=>({...p,[k]:e.target.value}));
  const rateLabel = isContractor ? "Kiwango cha Kazi / Job Rate (TZS)" : "Mshahara wa Mwezi / Monthly Salary (TZS)";
  const periodLabel = isContractor ? "Kazi iliyofanyika / Job done" : (isSeasonal ? "Maelezo / Description" : "Kipindi / Period (e.g. Mwezi wa 6)");
  const [showWarnForm,setShowWarnForm]=useState(false);
  const [showWarnList,setShowWarnList]=useState(false);
  const [showNotice,setShowNotice]=useState(false); // false | notice type key
  const [warnType,setWarnType]=useState("verbal");
  const [warnReason,setWarnReason]=useState("");
  const [warnDate,setWarnDate]=useState(today());

  function submitWarning(){
    if(!warnReason.trim()) return;
    onAddWarning(s.id, s.name, warnType, warnReason.trim(), warnDate);
    setWarnReason("");
    setWarnType("verbal");
    setWarnDate(today());
    setShowWarnForm(false);
    setShowWarnList(true);
  }

  if(isEditing) return (
    <Card glow style={{padding:"1rem",borderLeft:"3px solid "+accent}}>
      <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:accent,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Hariri / Editing</p>
      <input value={form.name} onChange={setF("name")} placeholder="Jina / Name *" style={{...inp,marginBottom:8}}/>
      <input value={form.role} onChange={setF("role")} placeholder="Kazi / Role (e.g. Mpishi, Fundi Umeme)" style={{...inp,marginBottom:8}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
        <button onClick={()=>setForm(p=>({...p,type:"long_term"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="long_term"?t.gr:t.border),background:form.type==="long_term"?t.gr+"18":"transparent",color:form.type==="long_term"?t.gr:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Kudumu<br/>Long-term</button>
        <button onClick={()=>setForm(p=>({...p,type:"seasonal"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="seasonal"?t.bl:t.border),background:form.type==="seasonal"?t.bl+"18":"transparent",color:form.type==="seasonal"?t.bl:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Msimu<br/>Seasonal</button>
        <button onClick={()=>setForm(p=>({...p,type:"contractor"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="contractor"?t.pu:t.border),background:form.type==="contractor"?t.pu+"18":"transparent",color:form.type==="contractor"?t.pu:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Mkandarasi<br/>Contractor</button>
      </div>
      <input type="number" value={form.monthly_salary} onChange={setF("monthly_salary")} placeholder={rateLabel} style={{...inp,marginBottom:8}}/>
      <input value={form.phone} onChange={setF("phone")} placeholder="Simu / Phone" style={{...inp,marginBottom:8}}/>
      <input value={form.notes} onChange={setF("notes")} placeholder="Maelezo / Notes (optional)" style={{...inp,marginBottom:10}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onSave} disabled={!form.name.trim()} style={{flex:2,background:!form.name.trim()?t.bg4:"linear-gradient(135deg,"+t.gr+",#009940)",color:!form.name.trim()?t.dim2:"#fff",border:"none",borderRadius:10,padding:11,fontSize:13,fontWeight:700,cursor:!form.name.trim()?"default":"pointer"}}>Hifadhi / Save</button>
        <button onClick={onCancelEdit} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:11,fontSize:13,cursor:"pointer"}}>Funga</button>
      </div>
    </Card>
  );

  return (
    <Card style={{padding:"12px 14px",borderLeft:"3px solid "+accent,opacity:isFormer?0.7:1}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:t.text}}>{s.name}</div>
            {isFormer && <span style={{fontSize:9,background:t.dim2+"20",color:t.dim2,padding:"1px 7px",borderRadius:5,fontWeight:700,textTransform:"uppercase"}}>Zamani</span>}
            {myWarnings.length>0 && <button onClick={()=>setShowWarnList(!showWarnList)} style={{fontSize:9,background:t.rd+"18",color:t.rd,padding:"1px 7px",borderRadius:5,fontWeight:700,border:"1px solid "+t.rd+"40",cursor:"pointer"}}>⚠️ {myWarnings.length}</button>}
          </div>
          <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:2}}>{s.role||"—"}{s.phone?" · "+s.phone:""}</div>
          {s.monthly_salary>0 && !isFormer && <div style={{fontFamily:"sans-serif",fontSize:12,color:accent,marginTop:3,fontWeight:700}}>{presenterMode?(totalPayroll?Math.round(s.monthly_salary/totalPayroll*100):0)+"% ya jumla":fmt(s.monthly_salary)}{!presenterMode&&(!isContractor&&!isSeasonal?"/mwezi":isContractor?" /kazi":"")}</div>}
          {s.notes && <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:3,fontStyle:"italic"}}>{s.notes}</div>}

          {showWarnList && myWarnings.length>0 && <div style={{marginTop:8,padding:10,background:t.rd+"08",borderRadius:8,border:"1px solid "+t.rd+"22"}}>
            <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.rd,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 6px"}}>Maonyo / Warnings History</p>
            {myWarnings.map(w=>(
              <div key={w.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"5px 0",borderBottom:"1px solid "+t.rd+"15"}}>
                {(()=>{const m=String(w.reason||"").match(/^\[([^\]]+)\]\s*/);const lbl=m?m[1]:(w.type==="written"?"MAANDISHI":"MDOMO");return <span style={{fontSize:9,fontWeight:700,color:w.type==="written"?t.rd:t.gold,background:(w.type==="written"?t.rd:t.gold)+"18",padding:"1px 6px",borderRadius:4,flexShrink:0,marginTop:1}}>{lbl}</span>;})()}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"sans-serif",fontSize:11,color:t.text}}>{String(w.reason||"").replace(/^\[[^\]]+\]\s*/,"")}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:1}}>{w.warning_date}</div>
                </div>
                <button onClick={()=>onDeleteWarning(w.id)} style={{background:"none",border:"none",color:t.dim2,fontSize:12,cursor:"pointer",padding:0,flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>}

          {showWarnForm && <div style={{marginTop:8,padding:10,background:t.bg4,borderRadius:8}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <button onClick={()=>setWarnType("verbal")} style={{flex:1,padding:7,borderRadius:8,border:"1.5px solid "+(warnType==="verbal"?t.gold:t.border),background:warnType==="verbal"?t.gold+"18":"transparent",color:warnType==="verbal"?t.gold:t.dim2,fontSize:11,fontWeight:700,cursor:"pointer"}}>Onyo la Mdomo</button>
              <button onClick={()=>setWarnType("written")} style={{flex:1,padding:7,borderRadius:8,border:"1.5px solid "+(warnType==="written"?t.rd:t.border),background:warnType==="written"?t.rd+"18":"transparent",color:warnType==="written"?t.rd:t.dim2,fontSize:11,fontWeight:700,cursor:"pointer"}}>Onyo la Maandishi</button>
            </div>
            <input value={warnReason} onChange={e=>setWarnReason(e.target.value)} placeholder="Sababu / Reason for warning *" style={{...inp,marginBottom:6,fontSize:12}}/>
            <input type="date" value={warnDate} onChange={e=>setWarnDate(e.target.value)} style={{...inp,marginBottom:8,fontSize:12}}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={submitWarning} disabled={!warnReason.trim()} style={{flex:1,background:!warnReason.trim()?t.bg4:t.rd,color:!warnReason.trim()?t.dim2:"#fff",border:"none",borderRadius:8,padding:9,fontSize:12,fontWeight:700,cursor:!warnReason.trim()?"default":"pointer"}}>Hifadhi Onyo</button>
              <button onClick={()=>setShowWarnForm(false)} style={{background:t.bg4,color:t.dim,border:"none",borderRadius:8,padding:"9px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
            </div>
          </div>}

          {showNotice && !isFormer && <NoticeComposer key={showNotice} initial={showNotice} s={s} onClose={()=>setShowNotice(false)} onSaved={(...a)=>{onAddWarning(...a);setShowWarnList(true);}} onRemove={onRemove}/>}

          {showPay===s.id && <div style={{marginTop:8,padding:10,background:t.bg4,borderRadius:8}}>
            <input type="number" value={payForm.amount} onChange={setPF("amount")} placeholder="Kiasi / Amount (TZS)" style={{...inp,marginBottom:6,fontSize:12}}/>
            <input value={payForm.period} onChange={setPF("period")} placeholder={periodLabel} style={{...inp,marginBottom:6,fontSize:12}}/>
            <input type="date" value={payForm.date} onChange={setPF("date")} style={{...inp,marginBottom:8,fontSize:12}}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>onPay(s)} disabled={!payForm.amount} style={{flex:1,background:!payForm.amount?t.bg4:t.gr,color:!payForm.amount?t.dim2:"#fff",border:"none",borderRadius:8,padding:9,fontSize:12,fontWeight:700,cursor:!payForm.amount?"default":"pointer"}}>Lipa / Pay</button>
              <button onClick={()=>setShowPay(null)} style={{background:t.bg4,color:t.dim,border:"none",borderRadius:8,padding:"9px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
            </div>
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
          {!isFormer && <>
            <button onClick={()=>{setPayForm({amount:String(s.monthly_salary||""),date:today(),period:""});setShowPay(showPay===s.id?null:s.id);}} style={{background:t.gold+"20",color:t.gold,border:"1px solid "+t.gold+"55",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>💰 Lipa</button>
            <button onClick={()=>onStartEdit(s)} style={{background:t.bl+"15",color:t.bl,border:"1px solid "+t.bl+"40",borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>✏️ Hariri</button>
            <button onClick={()=>setShowWarnForm(!showWarnForm)} style={{background:t.rd+"15",color:t.rd,border:"1px solid "+t.rd+"40",borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>⚠️ Onyo</button>
            <button onClick={()=>setShowNotice(v=>v?false:"written")} style={{background:"#25D36622",color:"#128C7E",border:"1px solid #25D36688",borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>📲 Barua</button>
            <button onClick={()=>setShowNotice("terminate")} style={{background:t.rd,color:"#fff",border:"none",borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>🛑 Kusitisha<br/><span style={{fontWeight:500,fontSize:8}}>Terminate</span></button>
            <button onClick={()=>onDelete(s)} style={{background:t.dim2+"15",color:t.dim2,border:"1px solid "+t.dim2+"40",borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>🚪 Toa</button>
          </>}
          {isFormer && <button onClick={()=>onReactivate(s)} style={{background:t.gr+"15",color:t.gr,border:"1px solid "+t.gr+"40",borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>↩️ Rejesha</button>}
        </div>
      </div>
    </Card>
  );
}

// Jiko La Bibi JJJ shield — marks every management screen
function ShieldBanner({sw,en}){
  const {t}=useT();
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"8px 12px",background:t.bg2||"transparent",border:"1px solid "+t.border,borderRadius:12}}>
      <img src="/shield-sm.webp" alt="" width={36} height={40} style={{objectFit:"contain",flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
      <div style={{minWidth:0}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:t.gold,lineHeight:1.2}}>{sw}</div>
        <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,letterSpacing:"0.5px"}}>{en} · Jiko La Bibi JJJ</div>
      </div>
    </div>
  );
}

function WafanyakaziTab() {
  const {t, presenterMode} = useT();
  const {staff, addStaff, updateStaff, deleteStaff, payStaff, reactivateStaff, warnings, addWarning, deleteWarning, allCosts} = useAdmin();
  const [showAdd,setShowAdd]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [showPay,setShowPay]=useState(null);
  const [showFormer,setShowFormer]=useState(false);
  const [form,setForm]=useState({name:"",role:"",type:"long_term",monthly_salary:"",phone:"",notes:""});
  const [payForm,setPayForm]=useState({amount:"",date:today(),period:""});
  const setF=k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const longTerm = staff.filter(s => s.type === "long_term" && s.active !== false);
  const seasonal = staff.filter(s => s.type === "seasonal" && s.active !== false);
  const contractors = staff.filter(s => s.type === "contractor" && s.active !== false);
  const formerStaff = staff.filter(s => s.active === false);
  const totalPayroll = longTerm.reduce((s,m)=>s+(m.monthly_salary||0), 0);
  const m = new Date();
  const monthStart = dateStrET(new Date(m.getFullYear(), m.getMonth(), 1));
  const paidThisMonth = allCosts.filter(c => c.category==="staff" && c.cost_date>=monthStart).reduce((s,c)=>s+c.amount,0);
  const totalWarnings = warnings.length;
  const writtenWarnings = warnings.filter(w=>w.type==="written").length;

  function warningsFor(staffId){ return warnings.filter(w=>w.staff_id===staffId); }

  function startAdd(){
    setForm({name:"",role:"",type:"long_term",monthly_salary:"",phone:"",notes:""});
    setEditingId(null);
    setShowAdd(true);
  }
  function startEdit(s){
    setForm({name:s.name||"",role:s.role||"",type:s.type||"long_term",monthly_salary:String(s.monthly_salary||""),phone:s.phone||"",notes:s.notes||""});
    setEditingId(s.id);
    setShowAdd(false);
  }
  function cancelEdit(){setEditingId(null);}
  async function saveStaff(){
    if(!form.name.trim()) return;
    const payload = {...form, monthly_salary: parseInt(form.monthly_salary)||0};
    if(editingId){
      await updateStaff(editingId, payload);
      setEditingId(null);
    } else {
      await addStaff(payload);
      setShowAdd(false);
    }
  }
  async function doPay(member){
    if(!payForm.amount) return;
    await payStaff(member, payForm.amount, payForm.date, payForm.period);
    setPayForm({amount:"",date:today(),period:""});
    setShowPay(null);
  }
  function delMember(s){
    if(confirm("Toa "+s.name+" — atahamishwa kwenye Zamani/Former. Historia yote (maonyo, malipo) itabaki. / Remove "+s.name+"? They'll move to Former Staff — all history (warnings, payments) stays."))
      deleteStaff(s.id);
  }
  function doReactivate(s){
    if(confirm("Rejesha "+s.name+" kama mfanyakazi hai? / Restore "+s.name+" as active staff?"))
      reactivateStaff(s.id);
  }
  const inp = {width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"};
  const cardProps = {form,setForm,onStartEdit:startEdit,onCancelEdit:cancelEdit,onSave:saveStaff,onDelete:delMember,onPay:doPay,payForm,setPayForm,showPay,setShowPay,onAddWarning:addWarning,onDeleteWarning:deleteWarning,onRemove:m=>deleteStaff(m.id),totalPayroll};

  return (
    <div style={{padding:"1rem"}}>
      <ShieldBanner sw="Usimamizi wa Waajiriwa" en="Staff management"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Chip label="Mshahara Wote / Total Payroll" value={presenterMode?"100%":fmt(totalPayroll)} color={t.gold} icon="💼"/>
        <Chip label="Lipwa Mwezi Huu / Paid This Month" value={presenterMode?(totalPayroll?Math.round(paidThisMonth/totalPayroll*100):0)+"%":fmt(paidThisMonth)} color={t.gr} icon="✅"/>
      </div>
      {totalWarnings>0 && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Maonyo Yote / Total Warnings" value={totalWarnings} color={t.gold} icon="⚠️"/>
        <Chip label="Maandishi / Written" value={writtenWarnings} color={t.rd} icon="📝"/>
      </div>}

      <button onClick={startAdd} style={{width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,boxShadow:"0 4px 16px "+t.gold+"44"}}>
        + Ongeza Mfanyakazi au Mkandarasi / Add Staff or Contractor
      </button>

      <a href="/ajira.html" target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:t.bl+"12",color:t.bl,border:"1.5px solid "+t.bl+"44",borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,textDecoration:"none",boxSizing:"border-box"}}>
        📋 Ajira Digital — Mikataba na Sera / Contracts &amp; Policies
      </a>

      {showAdd && <Card glow style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.gold,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>New / Mpya</p>
        <input value={form.name} onChange={setF("name")} placeholder="Jina / Name *" style={{...inp,marginBottom:8}}/>
        <input value={form.role} onChange={setF("role")} placeholder="Kazi / Role (e.g. Mpishi, Fundi Umeme, Maji)" style={{...inp,marginBottom:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:8}}>
          <button onClick={()=>setForm(p=>({...p,type:"long_term"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="long_term"?t.gr:t.border),background:form.type==="long_term"?t.gr+"18":"transparent",color:form.type==="long_term"?t.gr:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Kudumu<br/>Long-term</button>
          <button onClick={()=>setForm(p=>({...p,type:"seasonal"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="seasonal"?t.bl:t.border),background:form.type==="seasonal"?t.bl+"18":"transparent",color:form.type==="seasonal"?t.bl:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Msimu<br/>Seasonal</button>
          <button onClick={()=>setForm(p=>({...p,type:"contractor"}))} style={{padding:8,borderRadius:8,border:"1.5px solid "+(form.type==="contractor"?t.pu:t.border),background:form.type==="contractor"?t.pu+"18":"transparent",color:form.type==="contractor"?t.pu:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Mkandarasi<br/>Contractor</button>
        </div>
        <input type="number" value={form.monthly_salary} onChange={setF("monthly_salary")} placeholder={form.type==="contractor"?"Kiwango cha Kazi / Job Rate (TZS)":"Mshahara wa Mwezi / Monthly Salary (TZS)"} style={{...inp,marginBottom:8}}/>
        <input value={form.phone} onChange={setF("phone")} placeholder="Simu / Phone" style={{...inp,marginBottom:8}}/>
        <input value={form.notes} onChange={setF("notes")} placeholder="Maelezo / Notes (e.g. specialty, payment terms)" style={{...inp,marginBottom:10}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={saveStaff} disabled={!form.name.trim()} style={{flex:2,background:!form.name.trim()?t.bg4:"linear-gradient(135deg,"+t.gr+",#009940)",color:!form.name.trim()?t.dim2:"#fff",border:"none",borderRadius:10,padding:11,fontSize:13,fontWeight:700,cursor:!form.name.trim()?"default":"pointer"}}>Hifadhi / Save</button>
          <button onClick={()=>{setShowAdd(false);}} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:11,fontSize:13,cursor:"pointer"}}>Funga</button>
        </div>
      </Card>}

      {longTerm.length > 0 && <>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.gr,textTransform:"uppercase",letterSpacing:"1.5px",margin:"14px 0 8px"}}>🟢 Wa Kudumu / Long-term ({longTerm.length})</p>
        {longTerm.map(s => <StaffMemberCard key={s.id} s={s} isEditing={editingId===s.id} myWarnings={warningsFor(s.id)} {...cardProps}/>)}
      </>}

      {seasonal.length > 0 && <>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.bl,textTransform:"uppercase",letterSpacing:"1.5px",margin:"14px 0 8px"}}>🔵 Wa Msimu / Seasonal ({seasonal.length})</p>
        {seasonal.map(s => <StaffMemberCard key={s.id} s={s} isEditing={editingId===s.id} myWarnings={warningsFor(s.id)} {...cardProps}/>)}
      </>}

      {contractors.length > 0 && <>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.pu,textTransform:"uppercase",letterSpacing:"1.5px",margin:"14px 0 8px"}}>🟣 Wakandarasi / Contractors ({contractors.length})</p>
        {contractors.map(s => <StaffMemberCard key={s.id} s={s} isEditing={editingId===s.id} myWarnings={warningsFor(s.id)} {...cardProps}/>)}
      </>}

      {staff.length===0 && !showAdd && <p style={{textAlign:"center",color:t.dim2,fontFamily:"sans-serif",fontSize:13,padding:"2rem 0"}}>Hakuna mfanyakazi bado. / No staff yet. Tap + above to add.</p>}

      {formerStaff.length > 0 && <div style={{marginTop:18}}>
        <button onClick={()=>setShowFormer(!showFormer)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:t.bg4,border:"1px solid "+t.border,borderRadius:12,padding:"11px 14px",cursor:"pointer"}}>
          <span style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.dim,textTransform:"uppercase",letterSpacing:"1px"}}>⚪ Zamani / Former Staff ({formerStaff.length})</span>
          <i className={"ti ti-chevron-"+(showFormer?"up":"down")} style={{color:t.dim2}}/>
        </button>
        {showFormer && <div style={{marginTop:8}}>
          {formerStaff.map(s => <StaffMemberCard key={s.id} s={s} isEditing={false} isFormer myWarnings={warningsFor(s.id)} onReactivate={doReactivate} {...cardProps}/>)}
        </div>}
      </div>}
    </div>
  );
}

function welcomeMsg(name,role){
  const first=(name||"").trim().split(/\s+/)[0]||name; const r=(role||"mfanyakazi").split("/")[0].trim();
  return "Hongera *"+first+"*! 🎉\n\nUmechaguliwa kufanya kazi Unyamwezini Jiko La Bibi JJJ kama *"+r+"*. Tafadhali wasiliana nasi kuthibitisha siku ya kuanza.\n\n— — —\nCongratulations *"+first+"*! You have been selected to work at Unyamwezini Jiko La Bibi JJJ as *"+r+"*. Please contact us to confirm your start date.\n\n— Uongozi / Management";
}
function findStaffMatch(staff,name,phone){
  const n=String(name||"").trim().toLowerCase(), p=waPhone(phone);
  return (staff||[]).find(x=>(p&&waPhone(x.phone)===p)||(n&&String(x.name||"").trim().toLowerCase()===n));
}
// Add a person (from a signed contract or an applicant) to the Waajiriwa/Staff list, optionally with a WhatsApp welcome
function HirePanel({person,onSave,onClose}){
  const {t}=useT();
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:6};
  const [name,setName]=useState(person.name||"");
  const [role,setRole]=useState(person.role||"");
  const [salary,setSalary]=useState(String(person.salary||"").replace(/[^0-9]/g,""));
  const [type,setType]=useState(person.type||"seasonal");
  const [phone,setPhone]=useState(person.phone||"");
  const [welcome,setWelcome]=useState(false);
  const TY=[["long_term","Kudumu","Long-term",t.gr],["seasonal","Msimu","Seasonal",t.bl],["contractor","Mkandarasi","Contractor",t.pu]];
  const num=waPhone(phone);
  function save(){
    if(!name.trim()) return;
    onSave({name:name.trim(),role:role.trim(),type,monthly_salary:salary,phone:phone.trim(),notes:person.notes||""}, welcome&&num?{num,text:welcomeMsg(name,role)}:null);
  }
  return (
    <div style={{marginTop:8,padding:10,background:t.bg4,borderRadius:10,border:"1px solid "+t.gr+"55"}}>
      <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.gr,textTransform:"uppercase",margin:"0 0 8px"}}>➕ Weka kwa Waajiriwa / Add to Staff</p>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jina / Name *" style={inp}/>
      <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Kazi / Role (e.g. Mpishi, Mhudumu)" style={inp}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:6}}>
        {TY.map(([k,sw,en,col])=><button key={k} onClick={()=>setType(k)} style={{padding:7,borderRadius:8,border:"1.5px solid "+(type===k?col:t.border),background:type===k?col+"18":"transparent",color:type===k?col:t.dim2,fontSize:10,fontWeight:700,cursor:"pointer"}}>{sw}<br/>{en}</button>)}
      </div>
      <input type="number" value={salary} onChange={e=>setSalary(e.target.value)} placeholder={type==="contractor"?"Kiwango cha Kazi / Job rate (TZS)":"Mshahara / Salary (TZS)"} style={inp}/>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Simu / Phone" style={inp}/>
      <label style={{display:"flex",alignItems:"center",gap:7,fontFamily:"sans-serif",fontSize:11,color:t.text,marginBottom:8}}><input type="checkbox" checked={welcome} onChange={e=>setWelcome(e.target.checked)} disabled={!num}/> Tuma ujumbe wa "Karibu kazini" WhatsApp / Send a WhatsApp welcome {!num&&<span style={{color:t.rd}}>(weka simu)</span>}</label>
      <div style={{display:"flex",gap:6}}>
        <button onClick={save} disabled={!name.trim()} style={{flex:1,background:!name.trim()?t.bg:t.gr,color:!name.trim()?t.dim2:"#fff",border:"none",borderRadius:8,padding:10,fontSize:12,fontWeight:800,cursor:"pointer"}}>Hifadhi / Save</button>
        <button onClick={onClose} style={{background:t.bg,color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:"10px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
      </div>
    </div>
  );
}
// Save a "not now" reply to the Waombaji list so it syncs and is not lost
async function logNotNow(name,phone,roleLabel,note){
  try{
    const {supabase}=await import("../lib/supabase"); if(!supabase) return;
    const now=new Date().toISOString(); const p=waPhone(phone)||phone;
    const {data}=await supabase.from("job_applicants").select("id").eq("phone",phone).limit(1);
    if(data&&data.length) await supabase.from("job_applicants").update({status:"not_now",contacted_at:now}).eq("id",data[0].id);
    else await supabase.from("job_applicants").insert({name,phone:phone||p,role_wanted:roleLabel||"",status:"not_now",contacted_at:now,staff_note:note||""});
  }catch(e){ console.warn("logNotNow failed",e); }
}
/* ═══ TAB: WAOMBAJI / JOB APPLICANTS — short intros from the Ajira page; reply via WhatsApp ═══ */
const APP_STATUS={
  new:      {sw:"Mpya",          en:"New",        c:"gold", icon:"🆕"},
  interview:{sw:"Mahojiano",     en:"Interview",  c:"gr",   icon:"✅"},
  not_now:  {sw:"Si Sasa",       en:"Not now",    c:"dim2", icon:"⏳"},
  hired:    {sw:"Ameajiriwa",    en:"Hired",      c:"bl",   icon:"🎉"},
};
function applicantMsg(kind,a,when,place){
  const first=(a.name||"").trim().split(/\s+/)[0]||a.name;
  const role=(a.role_wanted||"kazi").split("/")[0].trim();
  if(kind==="interview") return "Habari *"+first+"*,\n\nAsante kwa kuomba kazi ya *"+role+"* Unyamwezini Jiko La Bibi JJJ. Tungependa kukuona kwa mahojiano:\n📅 "+(when||"…")+"\n📍 "+(place||"Goba Njia Nne")+"\n\nTafadhali jibu *NDIYO* kuthibitisha, au tuambie wakati mwingine unaofaa.\n\n— — —\nHello *"+first+"*,\n\nThank you for applying for the *"+role+"* position at Unyamwezini Jiko La Bibi JJJ. We would like to meet you for an interview:\n📅 "+(when||"…")+"\n📍 "+(place||"Goba Njia Nne")+"\n\nPlease reply *YES* to confirm, or tell us another time that suits you.\n\n— Uongozi / Management";
  return "Habari *"+first+"*,\n\nAsante kwa kuomba kazi ya *"+role+"* Unyamwezini Jiko La Bibi JJJ. Kwa sasa hatuna nafasi inayokufaa, lakini tumehifadhi taarifa zako na tutakutafuta nafasi ikipatikana. Tunakutakia kila la heri.\n\n— — —\nHello *"+first+"*,\n\nThank you for applying for the *"+role+"* position at Unyamwezini Jiko La Bibi JJJ. We have no suitable opening right now, but we have saved your details and will contact you if one comes up. We wish you all the best.\n\n— Uongozi / Management";
}
function etStamp(ts){ try{ return new Date(ts).toLocaleString("en-US",{timeZone:"America/New_York",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" ET"; }catch{ return ts||""; } }
function ApplicantsTab({onCount}) {
  const {t} = useT();
  const {staff,addStaff}=useAdmin();
  const [hire,setHire]=useState(null);
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  const [filter,setFilter]=useState("new");
  const [fitOnly,setFitOnly]=useState(false);  // show only "good fit" applicants
  const [eduMin,setEduMin]=useState(0);        // minimum education level (0 = any)
  const [salMax,setSalMax]=useState(0);        // maximum desired monthly salary in TZS (0 = any)
  const [roleF,setRoleF]=useState("");         // job wanted ("" = any)
  const [open,setOpen]=useState(null);       // {id,kind}
  const [when,setWhen]=useState("");
  const [place,setPlace]=useState("Goba Njia Nne");
  const [edit,setEdit]=useState(null);
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:6};

  async function load(){
    try{
      const {supabase}=await import("../lib/supabase");
      if(!supabase){setLoading(false);return;}
      const {data,error}=await supabase.from("job_applicants").select("*").order("created_at",{ascending:false}).limit(300);
      if(error){ setErr(error.message||"error"); } else { setErr(""); setRows(data||[]); }
    }catch(e){ setErr(String(e.message||e)); }
    setLoading(false);
  }
  useEffect(()=>{load();},[]);
  useEffect(()=>{ if(onCount) onCount(rows.filter(r=>r.status==="new").length); },[rows]);

  // Hiring ON/OFF switch (site_flags.hiring_open) — controls the footer link + the Omba Kazi form
  const [hiring,setHiring]=useState(null);   // null = unknown/not set up
  const [hiringBusy,setHiringBusy]=useState(false);
  const [hiringErr,setHiringErr]=useState("");
  useEffect(()=>{ (async()=>{ try{
    const {supabase}=await import("../lib/supabase"); if(!supabase) return;
    const {data,error}=await supabase.from("site_flags").select("hiring_open").eq("id","main").maybeSingle();
    if(!error && data) setHiring(!!data.hiring_open); else if(error) setHiringErr(error.message||"error");
  }catch(e){ setHiringErr(String(e.message||e)); } })(); },[]);
  async function toggleHiring(){
    if(hiring===null||hiringBusy) return;
    const next=!hiring; setHiringBusy(true); setHiringErr("");
    try{
      const {supabase}=await import("../lib/supabase");
      const {error}=await supabase.from("site_flags").upsert({id:"main",hiring_open:next,updated_at:new Date().toISOString()});
      if(error) setHiringErr(error.message||"error"); else setHiring(next);
    }catch(e){ setHiringErr(String(e.message||e)); }
    setHiringBusy(false);
  }

  async function patch(id,fields){
    setRows(prev=>prev.map(r=>r.id===id?{...r,...fields}:r));
    try{ const {supabase}=await import("../lib/supabase"); if(supabase) await supabase.from("job_applicants").update(fields).eq("id",id); }catch(e){ console.warn("Applicant update failed",e); }
  }
  async function remove(r){
    if(!confirm("Futa ombi la "+r.name+"? / Delete "+r.name+"'s application?")) return;
    setRows(prev=>prev.filter(x=>x.id!==r.id));
    try{ const {supabase}=await import("../lib/supabase"); if(supabase) await supabase.from("job_applicants").delete().eq("id",r.id); }catch(e){}
  }
  function startCompose(r,kind){ setOpen({id:r.id,kind}); setWhen(""); setEdit(null); }
  function send(r){
    const sms=r.whatsapp==="no"; const num=sms?waPhone(r.phone):appWaNum(r); if(!num) return;
    const kind=open.kind; const text=edit!==null?edit:applicantMsg(kind,r,when,place);
    if(kind==="interview") patch(r.id,{status:"interview",interview_at:when,contacted_at:new Date().toISOString()});
    else patch(r.id,{status:"not_now",contacted_at:new Date().toISOString()});
    window.open(sms?("sms:+"+num+"?body="+encodeURIComponent(text)):("https://wa.me/"+num+"?text="+encodeURIComponent(text)),"_blank");
    setOpen(null);
  }

  const counts={}; Object.keys(APP_STATUS).forEach(k=>{counts[k]=rows.filter(r=>r.status===k).length;});
  // Good fit = knows Goba Njia Nne and can reach it daily (and is 18+ when age is given)
  const fitRank=r=>{ const k=String(r.knows_location||""); const a=parseInt(r.age,10); if(a&&a<18) return 0; return k.startsWith("Ndiyo")?2:k.startsWith("Nafahamu")?1:0; };
  const fitCount=rows.filter(r=>(filter==="all"||r.status===filter)&&fitRank(r)===2).length;
  // Education level as a number so "Form 4 and above" works; salary as a plain number of TZS
  const eduRank=r=>{ const e=String(r.education||"").toLowerCase(); if(!e) return -1; return e.startsWith("shahada")?5:e.startsWith("stashahada")?4:(e.startsWith("cheti")||e.startsWith("kidato cha sita"))?3:e.startsWith("kidato cha nne")?2:e.startsWith("elimu ya msingi")?1:0; };
  const salNum=r=>{ const n=parseInt(String(r.salary_wanted||"").replace(/[^\d]/g,""),10); return n>0?n:null; };
  const roleOf=r=>String(r.role_wanted||"");
  const passes=r=>(filter==="all"||r.status===filter)&&(!fitOnly||fitRank(r)===2)
    &&(!eduMin||eduRank(r)>=eduMin)&&(!salMax||(salNum(r)!==null&&salNum(r)<=salMax))&&(!roleF||roleOf(r).startsWith(roleF));
  const shown=rows.filter(passes)
    .map((r,i)=>({r,i})).sort((a,b)=>salMax?((salNum(a.r)-salNum(b.r))||(a.i-b.i)):((fitRank(b.r)-fitRank(a.r))||(a.i-b.i))).map(x=>x.r);   // cheapest first when a salary limit is set; otherwise best fits first, newest first as before

  return (
    <div style={{padding:"1rem"}}>
      <ShieldBanner sw="Usimamizi wa Waombaji" en="Applicant management"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Wapya / New" value={counts.new} color={t.gold} icon="🆕"/>
        <Chip label="Mahojiano" value={counts.interview} color={t.gr} icon="✅"/>
        <Chip label="Wote / All" value={rows.length} color={t.bl} icon="🙋"/>
      </div>
      <Card style={{padding:"12px 14px",marginBottom:10,borderLeft:"3px solid "+(hiring===false?t.rd:t.gr)}}>
        {hiring===null?(
          <p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,margin:0,lineHeight:1.6}}>⚙️ Swichi ya kupokea maombi bado haijaundwa. Endesha <b>migration_hiring_switch.sql</b> kwenye Supabase mara moja. / The hiring switch is not set up yet — run <b>migration_hiring_switch.sql</b> once in Supabase.{hiringErr&&<><br/><span style={{fontSize:10}}>{hiringErr}</span></>}</p>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:hiring?t.gr:t.rd}}>{hiring?"🟢 Tunapokea maombi / Hiring is ON":"🔴 Hatupokei maombi / Hiring is OFF"}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim,marginTop:3,lineHeight:1.5}}>{hiring?"Kiungo cha \"Tunaajiri\" kinaonekana kwenye tovuti, na fomu ya Omba Kazi iko wazi. / The footer link shows and the form is open.":"Kiungo kimefichwa, na fomu inasema hatupokei maombi. / Link hidden; the form says we are not hiring."}</div>
              {hiringErr&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,marginTop:3}}>{hiringErr}</div>}
            </div>
            <button onClick={toggleHiring} disabled={hiringBusy} style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,padding:"9px 12px",borderRadius:10,cursor:"pointer",border:"1px solid "+(hiring?t.rd:t.gr),background:(hiring?t.rd:t.gr)+"22",color:hiring?t.rd:t.gr,flexShrink:0,opacity:hiringBusy?0.5:1}}>{hiring?"Zima / Turn OFF":"Washa / Turn ON"}</button>
          </div>
        )}
      </Card>
      <a href="/ajira" target="_blank" rel="noopener" style={{display:"block",textAlign:"center",fontFamily:"sans-serif",fontSize:11,color:t.dim,marginBottom:10,textDecoration:"underline"}}>Kiungo cha waombaji: jikolabibijjj.com/ajira (kichupo cha 🙋 Omba Kazi) / Applicant link</a>
      {(()=>{ const sc={}; rows.forEach(r=>{ const k=(r.source||"").split(":")[0].split(" / ")[0].trim()||"Haijulikani"; sc[k]=(sc[k]||0)+1; }); const ent=Object.entries(sc).sort((a,b)=>b[1]-a[1]); if(rows.length===0) return null; const mx=ent[0][1];
        return <Card style={{padding:"12px 14px",marginBottom:10}}>
          <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold,marginBottom:8}}>📣 WANATOKA WAPI? / WHERE THEY FIND US</div>
          {ent.map(([k,n])=>(<div key={k} style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"sans-serif",fontSize:11,color:t.text}}><span style={{overflowWrap:"anywhere"}}>{k}</span><b>{n}</b></div>
            <div style={{height:5,borderRadius:3,background:t.bg4,marginTop:3}}><div style={{height:5,borderRadius:3,background:t.gold,width:Math.round(n/mx*100)+"%"}}/></div>
          </div>))}
        </Card>; })()}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {[["new","🆕 Wapya"],["interview","✅ Mahojiano"],["not_now","⏳ Si Sasa"],["hired","🎉 Ameajiriwa"],["all","Wote"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,padding:"6px 11px",borderRadius:99,cursor:"pointer",border:"1px solid "+(filter===k?t.gold:t.border),background:filter===k?t.gold+"22":"transparent",color:filter===k?t.gold:t.dim2}}>{l}{k!=="all"&&counts[k]?" ("+counts[k]+")":""}</button>
        ))}
        <button onClick={()=>setFitOnly(v=>!v)} style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,padding:"6px 11px",borderRadius:99,cursor:"pointer",border:"1px solid "+(fitOnly?t.gr:t.border),background:fitOnly?t.gr+"22":"transparent",color:fitOnly?t.gr:t.dim2}}>✅ Wanafaa / Good fit ({fitCount})</button>
      </div>
      <Card style={{padding:"10px 12px",marginBottom:12}}>
        <div style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:t.gold,marginBottom:8}}>🔎 CHUJA / FILTER</div>
        {(()=>{ const sel={width:"100%",fontFamily:"sans-serif",fontSize:12,padding:"8px 6px",borderRadius:8,border:"1px solid "+t.border,background:t.bg4,color:t.text,boxSizing:"border-box"}; const lab={fontFamily:"sans-serif",fontSize:10,color:t.dim2,fontWeight:700,margin:"0 0 3px"};
          return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{gridColumn:"1 / -1"}}><div style={lab}>Kazi / Job</div>
              <select value={roleF} onChange={e=>setRoleF(e.target.value)} style={sel}>
                <option value="">Zote / Any</option><option value="Mpishi">Mpishi / Cook</option><option value="Mhudumu">Mhudumu / Waitress</option><option value="Usafi">Usafi wa Jumla / Housekeeping</option><option value="Mpokea">Mpokea Oda na Mpelekaji / Order taker &amp; delivery</option>
              </select></div>
            <div><div style={lab}>Elimu / Education</div>
              <select value={eduMin} onChange={e=>setEduMin(+e.target.value)} style={sel}>
                <option value={0}>Yoyote / Any</option><option value={2}>Kidato cha 4+ / Form 4+</option><option value={3}>Kidato cha 6 / Cheti+</option><option value={4}>Stashahada+ / Diploma+</option><option value={5}>Shahada / Degree</option>
              </select></div>
            <div><div style={lab}>Mshahara hadi / Max salary</div>
              <select value={salMax} onChange={e=>setSalMax(+e.target.value)} style={sel}>
                <option value={0}>Yoyote / Any</option><option value={150000}>TZS 150,000</option><option value={200000}>TZS 200,000</option><option value={250000}>TZS 250,000</option><option value={300000}>TZS 300,000</option><option value={400000}>TZS 400,000</option><option value={500000}>TZS 500,000</option>
              </select></div>
          </div>; })()}
        {(eduMin>0||salMax>0||roleF)&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,gap:8}}>
          <span style={{fontFamily:"sans-serif",fontSize:10.5,color:t.dim2}}>{shown.length} wanaofaa / match{(eduMin>0||salMax>0)?" · bila taarifa hawaonekani / those who left it blank are hidden":""}</span>
          <button onClick={()=>{setEduMin(0);setSalMax(0);setRoleF("");}} style={{fontFamily:"sans-serif",fontSize:10,fontWeight:700,padding:"5px 10px",borderRadius:99,cursor:"pointer",border:"1px solid "+t.border,background:"transparent",color:t.dim2}}>✕ Futa / Clear</button>
        </div>}
      </Card>
      {loading&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,textAlign:"center"}}>Inapakia… / Loading…</p>}
      {err&&<Card style={{padding:"1rem",marginBottom:10}}><p style={{fontFamily:"sans-serif",fontSize:12,color:t.rd,margin:0,lineHeight:1.6}}>⚠️ Jedwali la waombaji bado halijaundwa. Endesha <b>migration_job_applicants.sql</b> kwenye Supabase SQL editor mara moja. / The applicants table is not set up yet — run <b>migration_job_applicants.sql</b> once in the Supabase SQL editor.<br/><span style={{color:t.dim2,fontSize:10}}>{err}</span></p></Card>}
      {!loading&&!err&&shown.length===0&&<p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim2,textAlign:"center",padding:"1.5rem 0"}}>Hakuna waombaji hapa bado. / No applicants here yet.</p>}
      {shown.map(r=>{
        const st=APP_STATUS[r.status]||APP_STATUS.new; const col=t[st.c]; const noWa=r.whatsapp==="no"; const num=noWa?waPhone(r.phone):appWaNum(r); const isOpen=open&&open.id===r.id;
        const msg=isOpen?(edit!==null?edit:applicantMsg(open.kind,r,when,place)):"";
        return (
        <Card key={r.id} style={{padding:"12px 14px",marginBottom:10,borderLeft:"3px solid "+col}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.text,overflowWrap:"anywhere"}}>{r.name}</div>
              <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:2}}>{r.role_wanted||"—"}</div>
              <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,marginTop:1}}>📞 {r.phone||"—"}{r.area?" · 📍 Anaishi: "+r.area:""}</div>
              {(r.age||r.gender||r.knows_location)&&(()=>{const k=r.knows_location||""; const kc=k.startsWith("Ndiyo")?t.gr:k.startsWith("Nafahamu")?t.gold:k?t.rd:t.dim; const kt=k.startsWith("Ndiyo")?"✅ Anajua Goba, anaweza kufika / Knows Goba, can reach daily":k.startsWith("Nafahamu")?"⚠️ Anajua Goba lakini ni mbali / Knows Goba but far":k?"❌ Hajui Goba Njia Nne / Doesn't know our location":"";
                return <div style={{fontFamily:"sans-serif",fontSize:11,marginTop:4,lineHeight:1.5}}>
                  <span style={{color:t.text,fontWeight:700}}>👤 {r.age?r.age+" yrs":"—"}{r.gender?" · "+r.gender.split(" / ")[0]:""}</span>
                  {kt&&<div style={{color:kc,fontWeight:700,fontSize:10,marginTop:2}}>{kt}</div>}
                </div>;})()}
              {(r.education||salNum(r))&&<div style={{fontFamily:"sans-serif",fontSize:11,color:t.text,fontWeight:700,marginTop:3,lineHeight:1.5}}>{r.education?"🎓 "+r.education:""}{r.education&&salNum(r)?" · ":""}{salNum(r)?"💰 TZS "+salNum(r).toLocaleString("en-US")+"/mwezi":""}</div>}
              {noWa&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,marginTop:2,fontWeight:700}}>📵 Hana WhatsApp — tumia SMS / No WhatsApp — use SMS</div>}
              {r.whatsapp&&r.whatsapp!=="yes"&&r.whatsapp!=="no"&&<div style={{fontFamily:"sans-serif",fontSize:10,color:"#128C7E",marginTop:2,fontWeight:700}}>💬 WhatsApp ni namba nyingine: {r.whatsapp}</div>}
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <span style={{fontSize:9,fontWeight:800,color:col,background:col+"18",padding:"2px 8px",borderRadius:5,textTransform:"uppercase"}}>{st.icon} {st.sw}</span>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,marginTop:4}}>{etStamp(r.created_at)}</div>
            </div>
          </div>
          {r.source&&<div style={{fontFamily:"sans-serif",fontSize:11,color:t.gold,fontWeight:700,marginTop:6}}>📣 Alitupata / Found us: <span style={{color:t.text,fontWeight:600}}>{r.source}</span></div>}
          {(r.experience||r.available_from||r.message)&&<div style={{marginTop:8,padding:"8px 10px",background:t.bg4,borderRadius:8,fontFamily:"sans-serif",fontSize:11,color:t.text,lineHeight:1.55}}>
            {r.experience&&<div><b>Uzoefu / Experience:</b> {r.experience}</div>}
            {r.available_from&&<div><b>Kuanza / Start:</b> {r.available_from}</div>}
            {r.message&&<div><b>Ujumbe / Why:</b> {r.message}</div>}
          </div>}
          {r.status==="interview"&&r.interview_at&&<div style={{fontFamily:"sans-serif",fontSize:11,color:t.gr,marginTop:6,fontWeight:700}}>📅 {r.interview_at}{r.contacted_at?" · alitumiwa / sent "+etStamp(r.contacted_at):""}</div>}
          {r.status==="not_now"&&r.contacted_at&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2,marginTop:6}}>Alijibiwa / Replied {etStamp(r.contacted_at)}</div>}

          {isOpen&&<div style={{marginTop:8,padding:10,background:t.bg4,borderRadius:10,border:"1px solid "+(open.kind==="interview"?t.gr:t.dim2)+"55"}}>
            <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",margin:"0 0 6px"}}>{open.kind==="interview"?"📅 Ujumbe wa Mahojiano / Interview invite":"⏳ Ujumbe wa Si Sasa / Not-now reply"}</p>
            {open.kind==="interview"&&<><input value={when} onChange={e=>{setWhen(e.target.value);setEdit(null);}} placeholder="Siku na saa / Day & time (e.g. Ijumaa 21 Nov saa 5 asubuhi) *" style={inp}/><input value={place} onChange={e=>{setPlace(e.target.value);setEdit(null);}} placeholder="Mahali / Place" style={inp}/></>}
            <textarea value={msg} onChange={e=>setEdit(e.target.value)} rows={8} style={{...inp,fontSize:11,lineHeight:1.45,resize:"vertical"}}/>
            {!num&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,marginBottom:6}}>Namba ya simu si sahihi — hariri au piga simu. / Phone number looks invalid.</div>}
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>send(r)} disabled={!num||(open.kind==="interview"&&!when.trim())} style={{flex:1,background:(!num||(open.kind==="interview"&&!when.trim()))?t.bg:"#25D366",color:(!num||(open.kind==="interview"&&!when.trim()))?t.dim2:"#fff",border:"none",borderRadius:8,padding:10,fontSize:12,fontWeight:800,cursor:"pointer"}}>{noWa?"📲 Tuma SMS / Send SMS":"📲 Tuma WhatsApp / Send"}</button>
              <button onClick={()=>setOpen(null)} style={{background:t.bg,color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:"10px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
            </div>
          </div>}

          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
            <button onClick={()=>startCompose(r,"interview")} style={{flex:"1 1 120px",background:t.gr+"18",color:t.gr,border:"1px solid "+t.gr+"55",borderRadius:8,padding:"8px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>✅ Mahojiano<br/><span style={{fontWeight:500,fontSize:9}}>Yes, interview</span></button>
            <button onClick={()=>startCompose(r,"not_now")} style={{flex:"1 1 120px",background:t.dim2+"18",color:t.dim,border:"1px solid "+t.dim2+"55",borderRadius:8,padding:"8px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>⏳ Si Sasa<br/><span style={{fontWeight:500,fontSize:9}}>No, not now</span></button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6,alignItems:"center"}}>
            {r.phone&&<a href={"tel:"+r.phone.replace(/[^0-9+]/g,"")} style={{fontFamily:"sans-serif",fontSize:10,color:t.bl,border:"1px solid "+t.bl+"40",borderRadius:7,padding:"5px 10px",textDecoration:"none",fontWeight:700}}>📞 Piga / Call</a>}
            {num&&!noWa&&<a href={"https://wa.me/"+num} target="_blank" rel="noopener" style={{fontFamily:"sans-serif",fontSize:10,color:"#128C7E",border:"1px solid #25D36688",borderRadius:7,padding:"5px 10px",textDecoration:"none",fontWeight:700}}>💬 Chat</a>}
            {num&&noWa&&<a href={"sms:+"+num} style={{fontFamily:"sans-serif",fontSize:10,color:t.bl,border:"1px solid "+t.bl+"40",borderRadius:7,padding:"5px 10px",textDecoration:"none",fontWeight:700}}>✉️ SMS</a>}
            {r.phone&&<button onClick={()=>patch(r.id,{whatsapp:noWa?"yes":"no"})} style={{fontFamily:"sans-serif",fontSize:10,color:t.dim,border:"1px solid "+t.border,borderRadius:7,padding:"5px 10px",background:"transparent",cursor:"pointer",fontWeight:700}}>{noWa?"✅ Ina WhatsApp":"📵 Hana WhatsApp"}</button>}
            <select value={r.status} onChange={e=>patch(r.id,{status:e.target.value})} style={{fontFamily:"sans-serif",fontSize:10,padding:"5px 6px",borderRadius:7,border:"1px solid "+t.border,background:t.inputBg,color:t.inputColor}}>
              {Object.entries(APP_STATUS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.sw}</option>)}
            </select>
            <button onClick={()=>remove(r)} style={{marginLeft:"auto",background:"none",border:"none",color:t.dim2,fontSize:11,cursor:"pointer"}}>🗑</button>
          </div>
          {(r.status==="hired"||r.status==="interview")&&(()=>{const ex=findStaffMatch(staff,r.name,r.phone);return ex?<div style={{fontFamily:"sans-serif",fontSize:10,color:t.gr,marginTop:6,fontWeight:700}}>✓ Yupo kwenye Waajiriwa / Already in Staff{ex.active===false?" (Zamani/Former)":""}</div>:<button onClick={()=>setHire(hire===r.id?null:r.id)} style={{marginTop:8,width:"100%",background:t.gr+"18",color:t.gr,border:"1px solid "+t.gr+"55",borderRadius:8,padding:"8px",fontSize:11,fontWeight:700,cursor:"pointer"}}>🎉 Ameajiriwa → ➕ Weka kwa Waajiriwa / Add to Staff</button>;})()}
          {hire===r.id&&<HirePanel person={{name:r.name,phone:r.phone,role:(r.role_wanted||"").split("/")[0].trim(),type:"long_term"}} onClose={()=>setHire(null)} onSave={(m,w)=>{addStaff(m);patch(r.id,{status:"hired"});setHire(null);if(w) window.open("https://wa.me/"+w.num+"?text="+encodeURIComponent(w.text),"_blank");}}/>}
        </Card>);
      })}
    </div>
  );
}

/* ═══ TAB: AJIRA RECORDS (owner oversight of signed contracts) ═══ */
function AjiraTab() {
  const {t} = useT();
  const {staff,addStaff}=useAdmin();
  const [panel,setPanel]=useState(null);   // {id,kind:'hire'|'notnow'}
  const [nnText,setNnText]=useState(null);
  const [nnPhone,setNnPhone]=useState("");
  const [replied,setReplied]=useState({}); // phone -> true (not-now already sent)
  const [archived,setArchived]=useState({}); // contract id -> true (hidden from the main list)
  const [archReady,setArchReady]=useState(false); // true once the 'archived' column exists in Supabase
  const [showArch,setShowArch]=useState(false);
  const [archMsg,setArchMsg]=useState("");
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const typeLabels = { muda_mfupi:"📄 Muda Mfupi", kudumu:"📜 Kudumu", sera:"📕 Sera", ubia:"🤝 Ushirikiano", wadau:"📋 Wadau Waanzilishi" };

  useEffect(()=>{
    async function loadContracts(){
      try {
        const {supabase} = await import("../lib/supabase");
        if(!supabase){setLoading(false);return;}
        const {data} = await supabase.from("signed_contracts")
          .select("id,doc_type,employee_name,employee_phone,signed_at,form_data")
          .order("signed_at",{ascending:false}).limit(200);
        setRecords(data||[]);
        try{ const {data:ar,error:ae}=await supabase.from("signed_contracts").select("id").eq("archived",true); if(!ae){ const m={}; (ar||[]).forEach(a=>{m[a.id]=true;}); setArchived(m); setArchReady(true);} }catch{}
        try{ const {data:ap}=await supabase.from("job_applicants").select("phone,status").eq("status","not_now"); const m={}; (ap||[]).forEach(a=>{const k=waPhone(a.phone)||a.phone; m[k]=true;}); setReplied(m); }catch{}
      } catch(e){ console.warn("Contracts load failed:",e); }
      setLoading(false);
    }
    loadContracts();
  },[]);

  async function viewRecord(id){
    try {
      const {supabase} = await import("../lib/supabase");
      const {data} = await supabase.from("signed_contracts").select("*").eq("id",id).single();
      if(!data) return;
      const r = data;
      const w = window.open("","_blank");
      const fields = Object.entries(r.form_data||{}).map(([k,v])=>"<tr><td style='font-weight:bold;padding:5px 12px 5px 0;color:#555;font-size:12px;text-transform:uppercase'>"+k+"</td><td style='padding:5px 0'>"+(v||"—")+"</td></tr>").join("");
      w.document.write("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>"+r.employee_name+"</title><style>body{font-family:Arial;max-width:700px;margin:0 auto;padding:30px;color:#0B1F45;position:relative}body::before{content:'UNYAMWEZINI JIKO LA BIBI JJJ';position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:46px;font-weight:900;font-family:Georgia,serif;color:rgba(184,134,11,0.10);white-space:nowrap;pointer-events:none;z-index:0;letter-spacing:2px}h1,h2,table,img,p{position:relative;z-index:1}h1{font-family:Georgia;font-size:18px;text-align:center}h2{font-size:14px;color:#B8860B;border-bottom:2px solid #B8860B;padding-bottom:4px;margin-top:24px}table{width:100%;border-collapse:collapse}img.sig{max-width:280px;border:1px solid #ddd;border-radius:8px;display:block;margin-top:6px}.confid{margin-top:24px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#888;font-style:italic;text-align:center}@media print{button{display:none}}</style></head><body><h1>UNYAMWEZINI JIKO LA BIBI JJJ</h1><p style='text-align:center;font-size:11px;color:#777'>Mkataba uliosainiwa / Signed contract</p><h2>Aina: "+(r.doc_type)+"</h2><h2>Taarifa</h2><table>"+fields+"</table><h2>Sahihi ya Mfanyakazi</h2>"+(r.employee_signature?"<img class='sig' src='"+r.employee_signature+"'>":"<p>—</p>")+"<h2>Sahihi ya Mwajiri</h2>"+(r.employer_signature?"<img class='sig' src='"+r.employer_signature+"'>":"<p>—</p>")+"<p style='margin-top:18px;font-size:12px;color:#777'>Ilisainiwa: "+new Date(r.signed_at).toLocaleString("en-US",{timeZone:"America/New_York",hour12:false})+" (ET)</p><p class='confid'>Hati ya Siri ya Unyamwezini Jiko La Bibi JJJ \u2014 Hairuhusiwi kunakili au kutumia bila idhini.</p><button onclick='window.print()' style='margin-top:20px;padding:12px 24px;background:#B8860B;color:#fff;border:none;border-radius:10px;font-weight:bold;cursor:pointer'>🖨️ Print / PDF</button></body></html>");
      w.document.close();
    } catch(e){ alert("Error: "+e.message); }
  }

  async function setArch(ids,val){
    if(!archReady){ setArchMsg("Endesha migration_archive_contracts.sql kwenye Supabase mara moja ili kuhifadhi kumbukumbu. / Run migration_archive_contracts.sql in Supabase once to enable Archive."); return; }
    setArchMsg("");
    setArchived(prev=>{const n={...prev}; ids.forEach(i=>{ if(val) n[i]=true; else delete n[i]; }); return n;});
    try{ const {supabase}=await import("../lib/supabase"); await supabase.from("signed_contracts").update({archived:val}).in("id",ids); }catch(e){ console.warn("archive failed",e); }
  }
  async function delContract(r){
    if(!confirm("FUTA KABISA mkataba wa "+r.employee_name+"? Hili haliwezi kurudishwa. (Kama unataka kuuficha tu, tumia Hifadhi/Archive.) / PERMANENTLY delete "+r.employee_name+"'s contract? This cannot be undone. (To just hide it, use Archive.)")) return;
    setRecords(prev=>prev.filter(x=>x.id!==r.id));
    try{ const {supabase}=await import("../lib/supabase"); await supabase.from("signed_contracts").delete().eq("id",r.id); }catch(e){ console.warn("delete failed",e); }
  }
  const archCount=records.filter(r=>archived[r.id]).length;
  const visibleRecords=records.filter(r=>showArch?!!archived[r.id]:!archived[r.id]);
  const repliedIds=visibleRecords.filter(r=>!!replied[waPhone(r.employee_phone)||r.employee_phone]&&!findStaffMatch(staff,r.employee_name,r.employee_phone)).map(r=>r.id);
  const counts = {
    total: records.length,
    kudumu: records.filter(r=>r.doc_type==="kudumu").length,
    ubia: records.filter(r=>r.doc_type==="ubia").length,
  };

  return (
    <div style={{padding:"1rem"}}>
      <ShieldBanner sw="Mikataba ya Ajira" en="Employment contracts"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Mikataba Yote" value={counts.total} color={t.gold} icon="📋"/>
        <Chip label="Ya Kudumu" value={counts.kudumu} color={t.gr} icon="📜"/>
        <Chip label="Ushirikiano" value={counts.ubia} color={t.pu} icon="🤝"/>
      </div>

      <a href="/ajira" target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12,textDecoration:"none",boxSizing:"border-box",boxShadow:"0 4px 16px "+t.gold+"44"}}>
        ✍️ Fungua Ajira Digital / Open Signing App
      </a>

      <Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Mikataba Iliyosainiwa / Signed Contracts{showArch?" — 📥 Zilizohifadhiwa / Archived":""}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {!showArch&&repliedIds.length>0&&<button onClick={()=>setArch(repliedIds,true)} style={{background:t.dim2+"18",color:t.dim,border:"1px solid "+t.dim2+"55",borderRadius:8,padding:"7px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>📥 Hifadhi zote za ⏳ Si Sasa ({repliedIds.length}) / Archive all replied</button>}
          <button onClick={()=>setShowArch(v=>!v)} style={{background:"none",color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:"7px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{showArch?"← Rudi kwenye orodha / Back to list":"📥 Zilizohifadhiwa / Archived ("+archCount+")"}</button>
        </div>
        {archMsg&&<p style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,lineHeight:1.5,margin:"0 0 10px"}}>⚠️ {archMsg}</p>}
        {!loading&&showArch&&visibleRecords.length===0&&<p style={{textAlign:"center",color:t.dim2,fontSize:12,padding:"1rem 0"}}>Hakuna zilizohifadhiwa. / Nothing archived.</p>}
        {loading && <p style={{textAlign:"center",color:t.dim2,fontSize:12,padding:"1rem 0"}}>Inapakia... / Loading...</p>}
        {!loading && records.length===0 && <p style={{textAlign:"center",color:t.dim2,fontSize:12,padding:"1rem 0"}}>Hakuna mikataba bado / No signed contracts yet</p>}
        {visibleRecords.map((r,i)=>{
          const fd=r.form_data||{}; const canHire=r.doc_type==="muda_mfupi"||r.doc_type==="kudumu";
          const ex=canHire?findStaffMatch(staff,r.employee_name,r.employee_phone):null;
          const roleTxt=fd.wadhifa||fd.kazi||"";
          const isRep=!!replied[waPhone(r.employee_phone)||r.employee_phone];
          const open=panel&&panel.id===r.id?panel.kind:null;
          const nnBuilt=applicantMsg("not_now",{name:r.employee_name,role_wanted:roleTxt||"kazi"});
          const nnMsg=nnText!==null?nnText:nnBuilt; const nnNum=waPhone(nnPhone||r.employee_phone);
          return (
          <div key={r.id} style={{padding:"10px 12px",background:i%2===0?t.bg4:"transparent",borderRadius:8,marginBottom:3}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{(typeLabels[r.doc_type]||"📄").split(" ")[0]}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text,overflowWrap:"anywhere"}}>{r.employee_name}{ex&&<span style={{marginLeft:6,fontSize:9,fontWeight:800,color:t.gr,background:t.gr+"18",padding:"1px 6px",borderRadius:4}}>✓ WAAJIRIWA{ex.active===false?" (Zamani)":""}</span>}{isRep&&!ex&&<span style={{marginLeft:6,fontSize:9,fontWeight:800,color:t.dim,background:t.dim2+"20",padding:"1px 6px",borderRadius:4}}>⏳ SI SASA</span>}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{typeLabels[r.doc_type]||r.doc_type} · {new Date(r.signed_at).toLocaleDateString("en-US",{timeZone:"America/New_York"})}{r.employee_phone?" · "+r.employee_phone:""}</div>
              </div>
              <button onClick={()=>viewRecord(r.id)} style={{background:t.bl+"15",border:"1px solid "+t.bl+"40",color:t.bl,borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Angalia</button>
            </div>
            {canHire&&<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {!ex&&<button onClick={()=>setPanel(open==="hire"?null:{id:r.id,kind:"hire"})} style={{flex:"1 1 130px",background:t.gr+"18",color:t.gr,border:"1px solid "+t.gr+"55",borderRadius:8,padding:"7px 6px",fontSize:10,fontWeight:700,cursor:"pointer"}}>➕ Waajiriwa<br/><span style={{fontWeight:500,fontSize:8}}>Add to staff</span></button>}
              {!ex&&<button onClick={()=>{setNnText(null);setNnPhone(r.employee_phone||"");setPanel(open==="notnow"?null:{id:r.id,kind:"notnow"});}} style={{flex:"1 1 130px",background:t.dim2+"18",color:t.dim,border:"1px solid "+t.dim2+"55",borderRadius:8,padding:"7px 6px",fontSize:10,fontWeight:700,cursor:"pointer"}}>⏳ Si Sasa<br/><span style={{fontWeight:500,fontSize:8}}>Not needed now</span></button>}
              {ex&&<button onClick={()=>{setPanel(null);}} disabled style={{flex:1,background:"none",border:"none",color:t.dim2,fontSize:10,textAlign:"left",cursor:"default"}}>Tayari yupo kwenye tabu ya Waajiriwa. / Already in the Staff tab.</button>}
            </div>}
            <div style={{display:"flex",gap:8,marginTop:8,justifyContent:"flex-end",alignItems:"center"}}>
              <button onClick={()=>setArch([r.id],!archived[r.id])} style={{background:"none",border:"1px solid "+t.border,color:t.dim,borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{archived[r.id]?"↩️ Rejesha / Restore":"📥 Hifadhi / Archive"}</button>
              <button onClick={()=>delContract(r)} style={{background:"none",border:"1px solid "+t.rd+"44",color:t.rd,borderRadius:7,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>🗑 Futa / Delete</button>
            </div>
            {open==="hire"&&<HirePanel person={{name:r.employee_name,phone:r.employee_phone,role:roleTxt,salary:fd.mshahara||fd.malipo,type:r.doc_type==="kudumu"?"long_term":"seasonal",notes:"Alisaini mkataba "+new Date(r.signed_at).toLocaleDateString("en-US",{timeZone:"America/New_York"})}} onClose={()=>setPanel(null)} onSave={(m,w)=>{addStaff(m);setPanel(null);if(w) window.open("https://wa.me/"+w.num+"?text="+encodeURIComponent(w.text),"_blank");}}/>}
            {open==="notnow"&&<div style={{marginTop:8,padding:10,background:t.bg,borderRadius:10,border:"1px solid "+t.dim2+"55"}}>
              <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:700,color:t.dim2,textTransform:"uppercase",margin:"0 0 6px"}}>⏳ Ujumbe wa Si Sasa / Not-now message (WhatsApp)</p>
              <input value={nnPhone} onChange={e=>setNnPhone(e.target.value)} placeholder="Simu / Phone" style={{width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
              <textarea value={nnMsg} onChange={e=>setNnText(e.target.value)} rows={8} style={{width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:11,lineHeight:1.45,color:t.inputColor,outline:"none",boxSizing:"border-box",resize:"vertical",marginBottom:6}}/>
              {!nnNum&&<div style={{fontFamily:"sans-serif",fontSize:10,color:t.rd,marginBottom:6}}>Namba si sahihi. / Phone number looks invalid.</div>}
              <div style={{display:"flex",gap:6}}>
                <button disabled={!nnNum} onClick={()=>{ window.open("https://wa.me/"+nnNum+"?text="+encodeURIComponent(nnMsg),"_blank"); logNotNow(r.employee_name,r.employee_phone||nnPhone,typeLabels[r.doc_type]||"","Alisaini mkataba "+(typeLabels[r.doc_type]||"")); setReplied(p=>({...p,[nnNum]:true})); setPanel(null); }} style={{flex:1,background:nnNum?"#25D366":t.bg4,color:nnNum?"#fff":t.dim2,border:"none",borderRadius:8,padding:10,fontSize:12,fontWeight:800,cursor:"pointer"}}>📲 Tuma WhatsApp / Send</button>
                <button onClick={()=>setPanel(null)} style={{background:t.bg4,color:t.dim,border:"1px solid "+t.border,borderRadius:8,padding:"10px 12px",fontSize:12,cursor:"pointer"}}>✕</button>
              </div>
            </div>}
          </div>);
        })}
      </Card>

      <div style={{background:t.bg4,borderRadius:12,padding:"1rem",marginTop:10,border:"1px solid "+t.border}}>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.gold,marginBottom:6}}>💡 Jinsi inavyofanya kazi / How it works</p>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:t.dim,lineHeight:1.6,margin:0}}>
          Mpe msimamizi wa wafanyakazi link: <b>jikolabibijjj.com/ajira</b> na PIN yake (si ya Msimamizi). Yeye anaweza kusajili mikataba TU. Wewe unaona kila kitu hapa. / Give your staff manager the /ajira link with its own PIN. They can only sign contracts. You see everything here.
        </p>
      </div>
    </div>
  );
}

/* ═══ TAB: CHUO / UNIVERSITY — bilingual training guide for every tab & button ═══ */
function ChuoSection({icon, color, titleSw, titleEn, isOpen, onToggle, children}) {
  const {t} = useT();
  return (
    <Card style={{padding:0,overflow:"hidden"}}>
      <button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <IconBadge emoji={icon} color={color}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:t.text}}>{titleSw}</div>
          <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{titleEn}</div>
        </div>
        <i className={"ti ti-chevron-"+(isOpen?"up":"down")} style={{color:t.dim2,fontSize:16,flexShrink:0}}/>
      </button>
      {isOpen && <div style={{padding:"0 14px 16px",borderTop:"1px solid "+t.border}}>{children}</div>}
    </Card>
  );
}
function ChuoBullet({title, body}) {
  const {t} = useT();
  return (
    <div style={{marginBottom:10,paddingTop:10}}>
      <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.gold,marginBottom:2}}>{title}</div>
      <div style={{fontFamily:"sans-serif",fontSize:12,color:t.dim,lineHeight:1.6}}>{body}</div>
    </div>
  );
}
function ChuoTab() {
  const {t} = useT();
  const [open,setOpen]=useState("leo");
  const toggle = k => setOpen(open===k?null:k);

  return (
    <div style={{padding:"1rem"}}>
      <Card glow style={{padding:"1.2rem",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <IconBadge emoji="🎓" color={t.gold}/>
          <p style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:t.gold,margin:0}}>Chuo cha Msimamizi / Msimamizi University</p>
        </div>
        <p style={{fontFamily:"sans-serif",fontSize:12,color:t.dim,lineHeight:1.6,margin:0}}>
          Mwongozo huu unaeleza kila tabu na kila kitufe cha Msimamizi kwa Kiswahili na Kiingereza. Bonyeza sehemu yoyote hapa chini kujifunza. Lengo ni mtu yeyote aweze kuendesha biashara hii ndani ya dakika chache bila mmiliki. / This guide explains every tab and button in Msimamizi, in Swahili and English. Tap any section below to learn. The goal: anyone should be able to run this business within minutes, even without the owner present.
        </p>
      </Card>

      <ChuoSection icon="🏠" color={t.gold} titleSw="Leo / Today" titleEn="Daily dashboard & quick actions" isOpen={open==="leo"} onToggle={()=>toggle("leo")}>
        <ChuoBullet title="Kadi Kubwa ya Mapato / Big Revenue Card" body="Inaonyesha mapato, gharama, faida, na idadi ya mauzo ya LEO pekee, ikisasishwa moja kwa moja. / Shows today's revenue, costs, profit, and sale count — updates live as you record sales." />
        <ChuoBullet title="Record Sale / Mauzo (kitufe cha kijani)" body="Kinapeleka kwenye tabu ya Ingiza kuandika mauzo mapya. / Green button — jumps to Ingiza tab to record a new sale." />
        <ChuoBullet title="Record Expense / Gharama (kitufe chekundu)" body="Kinapeleka kwenye tabu ya Ingiza kuandika gharama. / Red button — jumps to Ingiza tab to record an expense." />
        <ChuoBullet title="Tuma Ripoti / Send Report" body="Chagua Leo/Jana/Wiki Hii/Mwezi Huu/Chagua Tarehe, kisha bonyeza kitufe cha kijani cha WhatsApp. Utaona 'Preview' kabla ya kutuma — bonyeza 'Tuma Sasa' kutuma kwenye WhatsApp. / Pick a period, tap the green WhatsApp button, review the preview, then tap 'Send Now' to open WhatsApp with the report pre-written." />
        <ChuoBullet title="Today's Sales List" body="Orodha ya mauzo yote ya leo. Bonyeza ✏️ kwenye mauzo yoyote kuhariri kiasi, bei, au huduma. / List of today's sales. Tap ✏️ on any sale to edit quantity, price, or service type." />
      </ChuoSection>

      <ChuoSection icon="➕" color={t.gr} titleSw="Ingiza / Input" titleEn="Recording sales & expenses" isOpen={open==="ingiza"} onToggle={()=>toggle("ingiza")}>
        <ChuoBullet title="Chagua Tarehe / Date Picker" body="Tarehe inaanza LEO, lakini unaweza kuchagua tarehe iliyopita kuingiza mauzo/gharama za nyuma. / Defaults to today, but you can pick any past date to backfill records." />
        <ChuoBullet title="Sales / Mauzo (kitufe cha kijani)" body="Chagua sehemu ya menyu (mfano Vitafunwa, Pilau), kisha bonyeza bidhaa, weka idadi (+/-), chagua huduma (Kuchukua/Delivery/Kula Hapa), kisha SAVE. / Pick a menu section, tap the item, adjust quantity with +/-, choose service type, then SAVE." />
        <ChuoBullet title="Expense / Gharama (kitufe chekundu)" body="Chagua Daily (ya kila siku) au Bulk (ya jumla), chagua aina (gesi, wafanyakazi, malighafi n.k), andika maelezo KAMILI (muhimu sana kwa ripoti), kisha kiasi, kisha SAVE. / Choose Daily or Bulk, pick a category, write a FULL description (important for reports), enter the amount, then SAVE." />
        <ChuoBullet title="Kwa nini maelezo ni muhimu? / Why description matters" body="Maelezo kamili (mfano 'Mkaa 10kg' badala ya 'other') yanaonekana kwenye chati za Akili kama sehemu yake — hivyo ripoti zinaeleweka. / A full description (e.g. 'Charcoal 10kg' instead of 'other') shows up as its own labeled slice in Akili's charts — this is what makes reports actually readable." />
      </ChuoSection>

      <ChuoSection icon="📊" color={t.bl} titleSw="Ripoti / Reports" titleEn="Custom date-range reports" isOpen={open==="ripoti"} onToggle={()=>toggle("ripoti")}>
        <ChuoBullet title="Period Pills / Vitufe vya Kipindi" body="Leo, Jana, Wiki 7, Mwezi, au Chagua (tarehe zako mwenyewe). Bonyeza 'Get Report' baada ya kuchagua. / Today, Yesterday, Last 7 days, Month, or Custom dates. Tap 'Get Report' after choosing." />
        <ChuoBullet title="Search Box / Sanduku la Kutafuta" body="Andika jina la bidhaa au gharama kutafuta ndani ya mauzo/gharama za kipindi hicho. / Type an item name or expense description to filter within that period's sales/costs." />
        <ChuoBullet title="Tap ✏️ kwenye Mauzo/Gharama" body="Hariri au futa rekodi yoyote moja kwa moja hapa. / Edit or delete any sale/cost record directly from this list." />
        <ChuoBullet title="Send Report / Tuma Ripoti (kijani)" body="Inatuma muhtasari mfupi wa kipindi kupitia WhatsApp. / Sends a short WhatsApp summary of the selected period." />
        <ChuoBullet title="Z-Report (dhahabu)" body="Inafungua ukurasa kamili wa PDF unaoonyesha mauzo yote na gharama zote kwa jedwali — chapisha au hifadhi kama PDF kwa kumbukumbu/kodi. / Opens a full printable page listing every sale and expense in table form — print or save as PDF for records/taxes." />
      </ChuoSection>

      <ChuoSection icon="🎯" color={t.gold} titleSw="Malengo / Goals" titleEn="Data-driven target setting" isOpen={open==="malengo"} onToggle={()=>toggle("malengo")}>
        <ChuoBullet title="Pendekezo la Malengo / Suggested Goals" body="Inahesabu wastani wa mauzo yako YOTE tangu biashara ilipoanza, na kupendekeza malengo kulingana na ukuaji unaotaka (+5% hadi +25%). Lengo la mwezi limejengwa kupita mwezi uliopita halisi. / Calculates your ALL-TIME sales average and suggests goals based on a growth % you pick. The monthly goal is specifically built to beat last month's real total." />
        <ChuoBullet title="Tumia Pendekezo / Apply Suggestion" body="Kinajaza namba zilizopendekezwa kwenye masanduku ya chini — bado unahitaji bonyeza 'Save Goals' kuyahifadhi. / Fills the suggested numbers into the boxes below — you still need to tap 'Save Goals' to confirm." />
        <ChuoBullet title="Malengo Yanayotumika Sasa / Currently Active Goals" body="Haya ndiyo malengo halisi yanayotumika — yanayoonyeshwa kwenye pete za Maendeleo hapo juu na Leo/Ripoti. Unaweza kuandika mwenyewe, au bonyeza 'Sasa/Now' chini ya Pendekezo kubadilisha. / These are the real active goals — shown on the Progress rings above and on Leo/Ripoti. Type your own, or use the suggestion above to change them." />
        <ChuoBullet title="Tuma Ripoti ya Malengo / Send Goals Report" body="Kinatuma maendeleo ya sasa (Leo/Wiki/Mwezi dhidi ya malengo) kupitia WhatsApp. / Sends current progress (today/week/month vs goals) via WhatsApp." />
      </ChuoSection>

      <ChuoSection icon="🧠" color={t.pu} titleSw="Akili / Analytics" titleEn="Business intelligence dashboard" isOpen={open==="akili"} onToggle={()=>toggle("akili")}>
        <ChuoBullet title="🧭 Dira ya Biashara / Business Compass" body="Uwiano wa mapato dhidi ya gharama, umeandikwa kama '1:X'. X chini ya 1 = unapoteza pesa. X karibu 1 = unavunja sawa. X zaidi ya lengo lako = umefikia lengo. Kadi ya 'Jumla' inajumuisha mishahara; 'Bila Wafanyakazi' haijumuishi. Bonyeza 'Lengo Lako' chini ya kadi kuweka lengo lako mwenyewe (mfano 1:3) — utaonekana umefikia lengo pale uwiano utakapopanda zaidi ya namba hiyo. Hii HAIFICHWI kwenye Presenter Mode kwa sababu ni uwiano tu, si namba halisi. / The revenue-to-cost ratio, shown as '1:X'. X below 1 = losing money. X near 1 = breaking even. X above your target = target reached. The 'Full' card includes payroll; 'Excluding Staff' doesn't. Tap 'Your Target' under the card to set your own goal (e.g. 1:3) — you'll be marked as having reached target once the ratio climbs past that number. This is NEVER hidden by Presenter Mode since it's just a ratio, not a real figure." />
        <ChuoBullet title="Afya ya Biashara / Business Health" body="Alama ya 0-100 inayoonyesha jinsi biashara inavyofanya vizuri kwa ujumla (mauzo, faida, aina mbalimbali za bidhaa). / A 0-100 score showing overall business performance (sales, profit, item variety)." />
        <ChuoBullet title="Mwenendo wa Mauzo / Revenue Trend" body="Chati inafuata kipindi ulichochagua juu (Siku 30/Mwezi Huu/Muda Wote/Chagua Tarehe) — kama kipindi ni kirefu (zaidi ya siku 60), inaonyesha kwa wiki badala ya siku ili ibaki rahisi kusoma. GUSA NA BURUTA kidole chako juu ya chati kuona tarehe na kiasi halisi. / The chart follows whichever period you selected above (30 Days/This Month/All-Time/Custom) — if the period is long (over 60 days), it shows weekly points instead of daily so it stays readable. TOUCH AND DRAG your finger across the chart to see the exact date and revenue for any point." />
        <ChuoBullet title="Wiki 7 / Siku 6 za Kazi Toggle" body="Bonyeza kitufe cha 'Wiki 7 / Siku 6' juu ya Mwenendo wa Mauzo. Ikiwa una siku ya kufungwa (mfano Jumapili), chagua 'Siku 6 za Kazi' ili siku hiyo isionekane 'mbaya' isivyo kweli — inaondolewa kabisa kwenye wastani na chati. / Tap the 'Full Week / 6 Operating Days' button above Revenue Trend. If you have a closed day (e.g. Sunday), choose '6 Operating Days' so that day doesn't falsely show as 'bad' — it's fully excluded from the average and chart." />
        <ChuoBullet title="Utabiri wa Stoki / Stock Forecast" body="Kinaonyesha siku ngapi zimebaki kabla stoki haijaisha, kulingana na kasi ya mauzo. Nyekundu = dharura, Dhahabu = tahadhari, Kijani = salama. / Shows days remaining before stock runs out, based on sales pace. Red = urgent, Gold = caution, Green = safe." />
        <ChuoBullet title="Chagua Idadi / Choose How Many" body="Kwenye Bidhaa Bora, Bidhaa Zisizouzwa, Utabiri wa Stoki, na Kishauri cha Faida, unaweza kuchagua uonyeshe ngapi (5, 10, 20, au Zote) kwa kubonyeza vitufe hivyo juu ya kila sehemu. / On Top Items, Slow-Moving Items, Stock Forecast, and Margin Advisor, you can choose how many to show (5, 10, 20, or All) by tapping the buttons above each section." />
        <ChuoBullet title="Kishauri cha Faida / Margin Advisor" body="Kinaonyesha gharama zinazokula mauzo yako zaidi (mfano: malighafi, umeme, kodi) na hatua halisi za kuchukua kwa kila moja — si maelezo tu, bali ushauri wa kufanya nini. Pia kinaonyesha ni asilimia ngapi ya gharama kubwa zaidi unahitaji kupunguza ili kufikia lengo lako la Dira ya Biashara. / Shows which cost categories are eating your revenue most (e.g. ingredients, electricity, rent) and concrete steps for each — not just facts, but what to actually do. Also shows exactly what % cut to your biggest cost category would hit your Business Compass target." />
        <ChuoBullet title="Siku na Saa Bora / Best Day & Hour" body="Inaonyesha siku ya wiki na saa inayouza zaidi — msaada wa kupanga zamu za wafanyakazi. / Shows your best-selling weekday and hour — useful for staff scheduling." />
        <ChuoBullet title="Bidhaa Zisizouzwa / Slow-Moving Items" body="Bidhaa ambazo hazijauzwa kwa siku 14+ zinaonekana hapa na alama nyekundu ⚠️. / Items unsold for 14+ days appear here flagged with a red ⚠️." />
        <ChuoBullet title="Top Items — 🔥❄️🌤️" body="🔥 = bidhaa inayouzwa sana, ❄️ = polepole, 🌤️ = wastani. Inategemea mauzo ya siku 30 ukilinganisha na bidhaa bora. / 🔥 = hot seller, ❄️ = slow, 🌤️ = average — based on 30-day sales relative to your top item." />
        <ChuoBullet title="Wateja wa Kudumu / Repeat Customers (kwenye Maagizo)" body="Wateja walioagiza mara 2+ wanaonekana kwenye tabu ya Maagizo, wamepangwa kwa idadi ya maagizo. / Customers who've ordered 2+ times appear in the Maagizo tab, ranked by order count." />
        <ChuoBullet title="Tuma Ripoti ya Akili / Send Analytics Report" body="Kinatuma muhtasari wa afya ya biashara, bidhaa bora, siku bora, na maonyo ya stoki/bidhaa polepole kupitia WhatsApp. / Sends a summary of business health, top items, best day, and stock/slow-item warnings via WhatsApp." />
      </ChuoSection>

      <ChuoSection icon="🍽️" color={t.gold} titleSw="Menyu / Menu" titleEn="Prices, stock, and custom items" isOpen={open==="menyu"} onToggle={()=>toggle("menyu")}>
        <ChuoBullet title="Bei / Price (bonyeza namba)" body="Bonyeza bei ya bidhaa yoyote kuibadilisha — mabadiliko yanaonekana MARA MOJA kwenye tovuti ya wateja. / Tap any item's price to change it — updates appear INSTANTLY on the customer-facing website." />
        <ChuoBullet title="IPO / IMEISHA (stock toggle)" body="Bonyeza kubadilisha kama bidhaa ipo au imeisha. Ikiisha, wateja wataona 'IMEISHA' na hawawezi kuagiza. / Tap to toggle in-stock/out-of-stock. When out, customers see 'IMEISHA' and can't order it." />
        <ChuoBullet title="Cost/unit — Gharama ya Kila Kimoja" body="Weka gharama ya kutengeneza bidhaa moja — hii inasaidia Akili kuhesabu faida halisi (margin). / Set the cost to make one unit — this helps Akili calculate true profit margins." />
        <ChuoBullet title="Stoki/Stock (kiasi)" body="Weka idadi ya vitu ulivyonavyo sasa — Akili itakuonyesha siku ngapi zimebaki kabla havijaisha. / Enter how many units you currently have — Akili will show you days remaining before it runs out." />
        <ChuoBullet title="Bidhaa Mpya / Custom Items" body="Ongeza bidhaa mpya bila kuandika code — jaza jina, bei, picha (hiari), na sehemu — inaonekana kwenye tovuti mara moja. / Add new menu items without writing code — fill in name, price, photo (optional), and section — appears on the live website instantly." />
      </ChuoSection>

      <ChuoSection icon="📋" color={t.gold} titleSw="Maagizo / Orders" titleEn="Customer order queue" isOpen={open==="maagizo"} onToggle={()=>toggle("maagizo")}>
        <ChuoBullet title="Maagizo ya Kiotomatiki / Auto Orders" body="Wateja wanapoagiza kwenye tovuti, agizo linaingia hapa MOJA KWA MOJA — hakuna kazi ya ziada. / When customers order on the website, it lands here AUTOMATICALLY — no extra work needed." />
        <ChuoBullet title="+ New Order / Agizo Jipya" body="Kwa maagizo yaliyofika kwa simu au ana kwa ana — jaza jina, simu, chakula, na jumla. / For orders received by phone or in-person — fill in name, phone, items, and total." />
        <ChuoBullet title="Done / Maliza (kitufe)" body="Bonyeza baada ya kukamilisha agizo — linahamia kwenye 'Done' na kutoka kwenye foleni ya 'Pending'. / Tap once an order is fulfilled — moves it to 'Done' and out of the 'Pending' queue." />
        <ChuoBullet title="Wateja wa Kudumu / Repeat Customers" body="Kadi ya dhahabu inayoonyesha wateja walioagiza mara 2+ — fikiria zawadi ndogo kwa wateja hawa waaminifu. / Gold card showing customers who've ordered 2+ times — consider a small thank-you gesture for these loyal customers." />
      </ChuoSection>

      <ChuoSection icon="👥" color={t.gr} titleSw="Waajiriwa / Staff" titleEn="Payroll, contractors & discipline" isOpen={open==="wafanya"} onToggle={()=>toggle("wafanya")}>
        <ChuoBullet title="+ Ongeza Mfanyakazi / Add Staff" body="Chagua aina: Kudumu (mshahara wa mwezi), Msimu (malipo yanayobadilika), au Mkandarasi (kwa kazi moja). / Choose type: Long-term (monthly salary), Seasonal (variable pay), or Contractor (per-job)." />
        <ChuoBullet title="💰 Lipa / Pay" body="Bonyeza kumlipa mfanyakazi — kiasi kinaingia MOJA KWA MOJA kwenye gharama za biashara (Ripoti/Akili). / Tap to pay a staff member — the amount automatically flows into business expenses (visible in Ripoti/Akili)." />
        <ChuoBullet title="✏️ Hariri / Edit" body="Badilisha jina, kazi, mshahara, au maelezo ya mfanyakazi wakati wowote. / Change name, role, salary, or notes for any staff member anytime." />
        <ChuoBullet title="🙋 Waombaji / Applicants" body="Watu wanaoomba kazi wanajaza utangulizi mfupi kwenye jikolabibijjj.com/ajira (kichupo cha Omba Kazi) — si mkataba. Hapa (Zaidi → Waombaji) unawaona, unabonyeza ✅ Mahojiano (unaandika siku/saa) au ⏳ Si Sasa, kisha unatuma WhatsApp. / People apply with a short intro at jikolabibijjj.com/ajira (Omba Kazi tab) — not a contract. Here (More → Waombaji) you see them, tap ✅ Interview (enter day/time) or ⏳ Not now, then send on WhatsApp."/>
        <ChuoBullet title="📲 Barua / Notice (WhatsApp)" body="Bonyeza 📲 Barua kwenye kadi ya mfanyakazi → chagua aina (Onyo la Mdomo, Maandishi, Mwisho, Wito wa Kusikilizwa, Kusimamishwa, Kusitisha Ajira) → andika sababu → Tuma WhatsApp. Ujumbe wa Kiswahili + Kiingereza unafunguka kwenye WhatsApp tayari; wewe bonyeza Send. Rekodi inahifadhiwa kwenye Maonyo. / Tap 📲 Barua on a staff card → pick a type → enter the reason → Send. A Swahili + English message opens in WhatsApp ready to send; you tap Send. A record is saved in Warnings history."/>
        <ChuoBullet title="⚠️ Onyo / Warning" body="Rekodi onyo la mdomo au la maandishi kwa ukiukaji wa sera — andika sababu na tarehe. Onyo zote zinahifadhiwa kwa kudumu. / Record a verbal or written warning for policy violations — write the reason and date. All warnings are saved permanently." />
        <ChuoBullet title="🚪 Toa / Remove" body="Mfanyakazi anahamishwa kwenye sehemu ya 'Zamani/Former' — HAIFUTWI kabisa. Historia yote (malipo, maonyo) inabaki. / Staff member moves to the 'Former' section — NOT deleted entirely. All history (payments, warnings) stays intact." />
        <ChuoBullet title="↩️ Rejesha / Restore (kwenye Zamani)" body="Ukimrudisha mfanyakazi wa zamani, bonyeza hii kumfanya awe hai tena. / To bring back a former employee, tap this to reactivate them." />
        <ChuoBullet title="📋 Ajira Digital" body="Kiungo cha kufungua ukurasa wa kusaini mikataba (bila PIN — kwa waajiriwa wapya). / Link to open the contract-signing page (no PIN — for new hires)." />
      </ChuoSection>

      <ChuoSection icon="✍️" color={t.pu} titleSw="Ajira / Contracts" titleEn="Signed contracts oversight" isOpen={open==="ajira"} onToggle={()=>toggle("ajira")}>
        <ChuoBullet title="Fungua Ajira Digital / Open Signing App" body="Kinafungua ukurasa wa jikolabibijjj.com/ajira ambapo watu wanaweza kusaini mikataba (waajiriwa, wadau, washirika). / Opens jikolabibijjj.com/ajira where people can sign contracts (employees, partners, business associates)." />
        <ChuoBullet title="Mikataba Iliyosainiwa / Signed Contracts List" body="Orodha ya kila mtu aliyesaini — jina, aina ya mkataba, tarehe. Bonyeza 'Angalia' kuona mkataba kamili na sahihi. / List of everyone who's signed — name, contract type, date. Tap 'Angalia' to see the full contract with signatures." />
        <ChuoBullet title="Kwa nini hii ni tofauti na Msimamizi? / Why this is separate from Msimamizi" body="Ukurasa wa /ajira HAUNA PIN kwa makusudi — ni kwa umma kusaini maombi ya kazi au ushirikiano. Msimamizi (hapa) ndiyo pekee inayoona rekodi zote. / The /ajira page intentionally has NO PIN — it's public for job/partnership applications. Only Msimamizi (here) can see all the records." />
      </ChuoSection>

      <ChuoSection icon="☁️" color={t.bl} titleSw="Hifadhi / Backup" titleEn="Data backup & export" isOpen={open==="hifadhi"} onToggle={()=>toggle("hifadhi")}>
        <ChuoBullet title="Download Backup / Pakua" body="Inapakua faili moja (.json) yenye kila kitu — bei, stoki, gharama, malengo, maagizo. Hifadhi mahali salama kila wiki. / Downloads one file (.json) with everything — prices, stock, costs, goals, orders. Save it somewhere safe weekly." />
        <ChuoBullet title="Mauzo CSV / Gharama CSV" body="Faili zinazofungua moja kwa moja kwenye Excel — nzuri kwa mhasibu wako. / Files that open directly in Excel — great for handing to your accountant." />
        <ChuoBullet title="Restore / Rejesha" body="Ukipoteza data, chagua faili la backup ulilopakua hapo awali kurejesha kila kitu. / If you lose data, select a previously downloaded backup file to restore everything." />
      </ChuoSection>

      <ChuoSection icon="🔑" color={t.gold} titleSw="Mambo ya Jumla / General Navigation" titleEn="PIN, theme, and the More menu" isOpen={open==="jumla"} onToggle={()=>toggle("jumla")}>
        <ChuoBullet title="PIN ya Kuingia / Login PIN" body="Msimamizi anahitaji PIN kuingia — usimpe mtu yeyote asiyeaminika. / Msimamizi requires a PIN to enter — never share it with anyone untrusted." />
        <ChuoBullet title="☀️/🌙 Theme Toggle" body="Ipo juu kulia — inabadilisha kati ya mandhari nyeupe (mchana) na nyeusi (usiku). Chaguo lako linahifadhiwa. / Top-right — switches between light (day) and dark (night) themes. Your choice is remembered." />
        <ChuoBullet title="Zaidi / More (nukta tatu)" body="Tabu za Malengo, Waajiriwa, Waombaji, Ajira, na Hifadhi ziko hapa ili menyu isijae. Bonyeza kufungua orodha kamili. / The Malengo, Waajiriwa (Staff), Waombaji, Ajira, and Hifadhi tabs live here to keep the main menu uncluttered. Tap to open the full list." />
        <ChuoBullet title="Back / Rudi" body="Juu kushoto — kinarudisha kwenye tovuti kuu ya wateja bila kutoka Msimamizi kabisa. / Top-left — returns to the main customer-facing website without fully exiting Msimamizi." />
        <ChuoBullet title="Exit / Toka" body="Kinafunga kikao cha Msimamizi kabisa — utahitaji PIN tena kuingia. / Fully closes the Msimamizi session — you'll need the PIN again to re-enter." />
      </ChuoSection>

      <div style={{background:t.gold+"10",border:"1px solid "+t.gold+"33",borderRadius:12,padding:"1rem",marginTop:14}}>
        <p style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold,marginBottom:6}}>💡 Ushauri wa Mwisho / Final Tip</p>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,lineHeight:1.6,margin:0}}>
          Mtu mpya anapaswa kuanza na tabu ya Leo (kuandika mauzo), kisha Ingiza (kuandika gharama), kisha Maagizo (kutimiza maagizo ya wateja). Vitu vingine (Malengo, Akili, Waajiriwa) vinaweza kujifunza baadaye. / A new person should start with Leo (recording sales), then Ingiza (recording costs), then Maagizo (fulfilling customer orders). Everything else (Malengo, Akili, Waajiriwa) can be learned later.
        </p>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function AdminPage({onExit}) {
  const {synced,lastSyncedAt,session,authReady,authEnabled,signOut,signIn,allSales:rootSales,customItems:rootCustom,fetchRange:rootFetch,saveNote} = useAdmin();
  // Glowing Chakula-vs-Vinywaji alerts: load the last ~16 days once signed in, then compute flags
  const uid=session?.user?.id||"";
  useEffect(()=>{ if(!uid) return; const d=new Date(today()+"T12:00:00"); d.setDate(d.getDate()-16); rootFetch(dateStrET(d),today()); },[uid]);
  const mixFlags=useMemo(()=>[...spiritsTodayFlag(rootSales||[],rootCustom||[]),...buildMixFlags(computeWeekCmp(rootSales||[],rootCustom||[]))],[rootSales,rootCustom]);
  const [newApps,setNewApps]=useState(0);
  // Publish Akili's top dishes to the public site (once per sign-in, after the recent sales have loaded)
  const favSynced=useRef(false);
  useEffect(()=>{ if(!uid||favSynced.current||!rootSales||rootSales.length<1) return; favSynced.current=true; syncFavorites(rootSales,rootCustom); },[uid,rootSales]);
  const [emailMode,setEmailMode]=useState(false);
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
  // new job applicants (Waombaji) — pulse the More button so you notice them
  useEffect(()=>{ if(!uid||tab==="waombaji") return; let off=false; (async()=>{ try{ const {supabase}=await import("../lib/supabase"); if(!supabase) return; const {count,error}=await supabase.from("job_applicants").select("id",{count:"exact",head:true}).eq("status","new"); if(!off&&!error&&typeof count==="number") setNewApps(count); }catch{} })(); return ()=>{off=true;}; },[uid,tab]);
  const [dark,setDark]=useState(()=>localStorage.getItem("jiko-theme")==="dark");
  function toggle(){const nd=!dark;setDark(nd);localStorage.setItem("jiko-theme",nd?"dark":"light");}
  const [presenterMode,setPresenterMode]=useState(false);
  function togglePresenter(){setPresenterMode(p=>!p);}
  const t = dark ? DARK : LIGHT;
  const PRIMARY_TABS=[
    {key:"leo",    icon:"ti-home",            label:"Leo",     sub:"Today"},
    {key:"ingiza", icon:"ti-plus",            label:"Ingiza",  sub:"Input"},
    {key:"ripoti", icon:"ti-chart-bar",       label:"Ripoti",  sub:"Reports"},
    {key:"akili",  icon:"ti-brain",           label:"Akili",   sub:"Analytics"},
    {key:"menu",   icon:"ti-tools-kitchen-2", label:"Menyu",   sub:"Menu"},
    {key:"maagizo",icon:"ti-clipboard-list",  label:"Maagizo", sub:"Orders"},
  ];
  const MORE_TABS=[
    {key:"malengo",icon:"ti-target",          label:"Malengo", sub:"Goals"},
    {key:"wafanyakazi", icon:"ti-users", label:"Waajiriwa", sub:"Staff"},
    {key:"waombaji", icon:"ti-user-search", label:"Waombaji", sub:"Applicants"},
    {key:"ajira", icon:"ti-signature", label:"Ajira", sub:"Contracts"},
    {key:"mihuri", icon:"ti-star", label:"Mihuri", sub:"Stamps"},
    {key:"tovuti", icon:"ti-world", label:"Tovuti", sub:"Website"},
    {key:"backup", icon:"ti-cloud-download",  label:"Hifadhi", sub:"Backup"},
    {key:"chuo", icon:"ti-school", label:"Chuo", sub:"Training"},
  ];
  const ALL_TABS=[...PRIMARY_TABS,...MORE_TABS];
  const [showMore,setShowMore]=useState(false);
  const activeIsMore = MORE_TABS.some(tb=>tb.key===tab);
  // With Supabase connected: staff sign in with email + password (the session is remembered on the device).
  // Without it (local/dev): fall back to the old PIN screen.
  const locked = authEnabled ? !session : !authed;
  if(authEnabled && !authReady) return (
    <ThemeCtx.Provider value={{t,dark,toggle,presenterMode,togglePresenter}}>
      <div style={{minHeight:"100vh",background:t.pinBg,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.6)",fontFamily:"sans-serif",fontSize:13}}>Inapakia… / Loading…</div>
    </ThemeCtx.Provider>
  );
  if(locked) return (
    <ThemeCtx.Provider value={{t,dark,toggle,presenterMode,togglePresenter}}>
      {authEnabled ? (emailMode ? <LoginGate onPin={()=>setEmailMode(false)}/> : <PinGate check={async(pin)=>{const {error}=await signIn(OWNER_LOGIN_EMAIL,OWNER_PW_PREFIX+pin);return !error;}} onEmail={()=>setEmailMode(true)}/>) : <PinGate onAuth={()=>setAuthed(true)}/>}
    </ThemeCtx.Provider>
  );
  return (
    <ThemeCtx.Provider value={{t,dark,toggle,presenterMode,togglePresenter}}>
      <div style={{minHeight:"100vh",background:t.bg,paddingBottom:80,maxWidth:"100vw",overflowX:"clip"}}>
        <style>{`@keyframes jikoGlow{0%,100%{box-shadow:0 0 6px 1px var(--glow,#ffb300)}50%{box-shadow:0 0 20px 5px var(--glow,#ffb300)}}@keyframes jikoPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.55}}.jiko-glow{animation:jikoGlow 1.6s ease-in-out infinite}.jiko-pulse{animation:jikoPulse 1.2s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.jiko-glow,.jiko-pulse{animation:none}.jiko-glow{box-shadow:0 0 12px 3px var(--glow,#ffb300)}}`}</style>
        <div style={{background:t.header,borderBottom:"1px solid "+t.border,padding:"0 12px",height:48,boxSizing:"border-box",gap:8,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,backdropFilter:"blur(12px)"}}>
          <button onClick={onExit} style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,display:"flex",alignItems:"center",gap:5,flexShrink:0,padding:"4px 2px"}}><i className="ti ti-arrow-left"/> Back</button>
          <div style={{display:"flex",flexDirection:"column",alignItems:"stretch",flex:1,minWidth:0,textAlign:"center",whiteSpace:"nowrap",overflow:"hidden"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6}}><img src="/shield-sm.webp" alt="" width={18} height={20} style={{objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>Msimamizi 🔐</span>
            <span style={{fontFamily:"sans-serif",fontSize:8,color:t.dim2,letterSpacing:"0.3px",overflow:"hidden",textOverflow:"ellipsis"}}>{APP_VERSION}</span>
            <span style={{fontFamily:"sans-serif",fontSize:8,letterSpacing:"0.3px",display:"block",marginTop:1,color:synced?t.gr:t.gold,overflow:"hidden",textOverflow:"ellipsis"}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:synced?t.gr:t.gold,display:"inline-block",marginRight:4,verticalAlign:"middle"}}/>
              {synced?"Imesawazishwa":"Inasawazisha..."}
              {synced && lastSyncedAt && (
                <span style={{color:t.dim2}}>
                  · {lastSyncedAt.toLocaleString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"})} ET
                </span>
              )}
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <button onClick={togglePresenter} title={presenterMode?"Presenter Mode: ON — tap to show real numbers":"Presenter Mode: OFF — tap to hide real numbers for demos"} style={{background:presenterMode?t.gold+"20":"none",border:presenterMode?"1px solid "+t.gold+"55":"1px solid transparent",borderRadius:8,color:presenterMode?t.gold:t.dim,cursor:"pointer",fontFamily:"sans-serif",fontSize:10,padding:"4px 7px",display:"flex",alignItems:"center",gap:4,fontWeight:presenterMode?700:400}}>
              <i className={"ti "+(presenterMode?"ti-eye-off":"ti-eye")} style={{fontSize:14}}/>{presenterMode?"Presenter":""}
            </button>
            <ThemeToggle/>
            <button onClick={()=>setTab("backup")} style={{background:"none",border:"none",color:t.dim,cursor:"pointer",fontFamily:"sans-serif",fontSize:11,padding:"4px 6px",display:"flex",alignItems:"center",gap:3}} title="Backup"><i className="ti ti-cloud-download" style={{fontSize:14}}/></button>
            <button onClick={()=>{ if(authEnabled) signOut(); else setAuthed(false); }} title="Toka / Sign out" style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>Exit</button>
          </div>
        </div>
        {saveNote&&<div role="status" style={{position:"fixed",top:58,left:12,right:12,maxWidth:520,margin:"0 auto",zIndex:300,padding:"10px 14px",borderRadius:12,background:saveNote.ok?"#0F766E":"#B42318",color:"#fff",fontFamily:"sans-serif",fontSize:12.5,fontWeight:700,lineHeight:1.4,boxShadow:"0 6px 22px rgba(0,0,0,0.35)",textAlign:"center"}}>{saveNote.msg}</div>}
        <div style={{background:t.tabBar,borderBottom:"1px solid "+t.border,display:"flex",overflowX:"auto",scrollbarWidth:"none",position:"sticky",top:48,zIndex:39}}>
          {PRIMARY_TABS.map(tb=><button key={tb.key} onClick={()=>setTab(tb.key)} style={{position:"relative",flex:"0 0 auto",padding:"8px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:tab===tb.key?"2px solid "+t.gold:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
            {tb.key==="akili"&&mixFlags.length>0&&tab!=="akili"&&<span className="jiko-pulse" aria-label="alert" style={{position:"absolute",top:4,right:8,width:10,height:10,borderRadius:"50%",background:mixFlags.some(f=>f.c==="warn")?"#ffb300":"#2ecc71",boxShadow:"0 0 8px 2px "+(mixFlags.some(f=>f.c==="warn")?"#ffb300":"#2ecc71")}}/>}
            <i className={"ti "+tb.icon} style={{fontSize:17,color:tab===tb.key?t.gold:t.dim2}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:tab===tb.key?t.gold:t.text,whiteSpace:"nowrap"}}>{tb.label}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:600,color:tab===tb.key?t.gold:t.dim,whiteSpace:"nowrap"}}>{tb.sub}</span>
          </button>)}
          <button onClick={()=>setShowMore(true)} style={{position:"relative",flex:"0 0 auto",padding:"8px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:activeIsMore?"2px solid "+t.gold:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
            {newApps>0&&!activeIsMore&&<span className="jiko-pulse" aria-label="new applicants" style={{position:"absolute",top:4,right:8,width:10,height:10,borderRadius:"50%",background:"#ffb300",boxShadow:"0 0 8px 2px #ffb300"}}/>}
            <i className="ti ti-dots" style={{fontSize:17,color:activeIsMore?t.gold:t.dim2}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:activeIsMore?t.gold:t.text,whiteSpace:"nowrap"}}>{activeIsMore ? (MORE_TABS.find(tb=>tb.key===tab)||{}).label : "Zaidi"}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:600,color:activeIsMore?t.gold:t.dim,whiteSpace:"nowrap"}}>More</span>
          </button>
        </div>
        {showMore && (
          <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.7)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowMore(false);}}>
            <div style={{background:t.bg2,borderRadius:"20px 20px 0 0",padding:"18px 14px 24px",width:"100%",maxWidth:520,boxShadow:"0 -10px 40px rgba(0,0,0,0.4)"}}>
              <div style={{width:36,height:4,background:t.border,borderRadius:99,margin:"0 auto 16px"}}/>
              <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px",paddingLeft:6}}>Zaidi / More Options</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {MORE_TABS.map(tb=>(
                  <button key={tb.key} onClick={()=>{setTab(tb.key);setShowMore(false);}} style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 8px",borderRadius:14,border:"1.5px solid "+(tab===tb.key?t.gold:t.border),background:tab===tb.key?t.gold+"12":t.bg4,cursor:"pointer"}}>
                    {tb.key==="waombaji"&&newApps>0&&<span className="jiko-glow" style={{"--glow":"#ffb300",position:"absolute",top:6,right:8,minWidth:20,height:20,borderRadius:10,background:"#ffb300",color:"#3a2a00",fontFamily:"sans-serif",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{newApps}</span>}
                    <i className={"ti "+tb.icon} style={{fontSize:24,color:tab===tb.key?t.gold:t.dim}}/>
                    <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:tab===tb.key?t.gold:t.text}}>{tb.label}</span>
                    <span style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{tb.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab==="leo"    &&<LeoTab onGoTo={setTab} flags={mixFlags}/>}
        {tab==="ingiza" &&<IngizaTab/>}
        {tab==="ripoti" &&<RipodiTab/>}
        {tab==="malengo"&&<MalengoTab/>}
        {tab==="akili"  &&<AkiliTab/>}
        {tab==="menu"   &&<MenuTab/>}
        {tab==="maagizo"&&<MaagizoTab/>}
        {tab==="wafanyakazi" &&<WafanyakaziTab/>}
        {tab==="waombaji" &&<ApplicantsTab onCount={setNewApps}/>}
        {tab==="mihuri" &&<StampsTab/>}
        {tab==="tovuti" &&<StorefrontTab/>}
        {tab==="ajira" &&<AjiraTab/>}
        {tab==="backup" &&<BackupTab/>}
        {tab==="chuo" &&<ChuoTab/>}
      </div>
    </ThemeCtx.Provider>
  );
}
