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
const APP_VERSION = "V2.7-4 · 12 Jul 2026, sync-timestamp";

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
      {!presenterMode && <div style={{fontFamily:"sans-serif",fontSize:"9px",color:over?t.gr:t.dim2,marginTop:1}}>{fmt(current)}</div>}
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

/* ═══ DAILY WHATSAPP SUMMARY ═══ */
function buildDailyReportText(daySales, gross, overhead, net, dateLabel, dayCosts) {
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
        <div style={{background:t.bg4,borderRadius:12,padding:14,overflowY:"auto",flex:1,marginBottom:14}}>
          <pre style={{fontFamily:"sans-serif",fontSize:13,color:t.text,whiteSpace:"pre-wrap",margin:0,lineHeight:1.6}}>{text}</pre>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>Hariri / Edit</button>
          <button onClick={()=>{sendTextToWhatsApp(text);onClose();}} style={{flex:2,background:"rgba(37,211,102,0.15)",color:"#25d366",border:"1px solid rgba(37,211,102,0.4)",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <i className="ti ti-brand-whatsapp"/>Tuma Sasa / Send Now
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══ TAB 1: LEO ═══ */
function LeoTab({onGoTo}) {
  const {t, presenterMode} = useT();
  const {todaySales,todayGross,todayNet,todayOverhead,goals,updateSale,deleteSale,allSales,allCosts,fetchRange} = useAdmin();
  const [editRec,setEditRec]=useState(null);
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
      // Wiki inaanza Jumatatu (Monday), inaisha Jumamosi (Saturday) — Jumapili (Sunday) haifanyi kazi
      const day = now.getDay(); // 0=Sunday..6=Saturday
      const mondayOffset = day===0 ? -6 : 1-day;
      const monday = new Date(now); monday.setDate(now.getDate()+mondayOffset);
      const saturday = new Date(monday); saturday.setDate(monday.getDate()+5);
      const todayD = new Date(fmtD(now));
      const end = todayD < saturday ? fmtD(todayD) : fmtD(saturday);
      return {start:fmtD(monday),end,label:"Wiki Hii, Jumatatu-Jumamosi ("+fmtD(monday)+" hadi "+end+")"};
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
        text = buildDailyReportText(todaySales,todayGross,todayOverhead,todayNet,label,todayCosts);
      } else {
        await fetchRange(start,end);
        const rangeSales=allSales.filter(s=>s.sale_date>=start&&s.sale_date<=end);
        const rangeCosts=allCosts.filter(c=>c.cost_date>=start&&c.cost_date<=end);
        const gross=rangeSales.reduce((s,r)=>s+r.total_price,0);
        const overhead=rangeCosts.reduce((s,c)=>s+c.amount,0);
        const net=gross-overhead;
        text = buildDailyReportText(rangeSales,gross,overhead,net,label,rangeCosts);
      }
      setPreviewText(text);
    } finally { setWaSending(false); }
  }
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
          {todaySales.slice(0,15).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={setEditRec} i={i}/>)}
        </Card>
      )}
      {editRec&&<EditModal type="sale" record={editRec} onSave={updateSale} onDelete={deleteSale} onClose={()=>setEditRec(null)}/>}
      {previewText && (
        <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.85)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 16px"}} onClick={e=>{if(e.target===e.currentTarget)setPreviewText(null);}}>
          <div style={{background:t.bg2,border:"1px solid "+t.border,borderRadius:"20px 20px 12px 12px",padding:18,width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>Ona Ripoti Kabla ya Kutuma / Preview</span>
              <button onClick={()=>setPreviewText(null)} style={{background:t.bg4,border:"none",color:t.dim,borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <div style={{background:t.bg4,borderRadius:12,padding:14,overflowY:"auto",flex:1,marginBottom:14}}>
              <pre style={{fontFamily:"sans-serif",fontSize:13,color:t.text,whiteSpace:"pre-wrap",margin:0,lineHeight:1.6}}>{previewText}</pre>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setPreviewText(null)} style={{flex:1,background:t.bg4,color:t.dim,border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>Hariri / Edit</button>
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
  const {prices,recordSale,recordCost,allCosts,deleteCost,updateCost,customItems} = useAdmin();
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
    customItems.forEach(ci => names.add(ci.sectionName || "Bidhaa Mpya"));
    return Array.from(names).map((name, i) => ({
      id: "custom_sec_" + i,
      sectionName: name,
      name: { sw: name.split("/")[0].trim(), en: (name.split("/")[1] || name).trim() }
    }));
  }, [customItems]);
  const allSections = [...sections, ...customSections];
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
    secItems = menu.filter(m => m.section === sec);
  } else {
    const customSec = customSections.find(s => s.id === sec);
    secItems = customSec
      ? customItems.filter(ci => (ci.sectionName || "Bidhaa Mpya") === customSec.sectionName).map(ci => customAsMenuItem(ci, sec))
      : [];
  }
  const isToday=date===today();
  const recentCosts=allCosts.filter(c=>c.cost_date===date).slice(0,10);
  const DCATS=[{k:"gas",l:"Gas/Gesi"},{k:"staff",l:"Staff/Wafanyakazi"},{k:"ingredients",l:"Ingredients/Malighafi"},{k:"rent",l:"Rent/Pango"},{k:"matengenezo",l:"Matengenezo/Maintenance"},{k:"vifaa",l:"Vifaa/Materials"},{k:"contractor",l:"Mkandarasi/Contractor"},{k:"other",l:"Other/Nyingine"}];
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
            {costType==="daily"?"Daily costs: gas, staff wages, small ingredients, rent.":"One-time bulk: large ingredient orders, equipment, marketing."}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {(costType==="daily"?DCATS:BCATS).map(c=><button key={c.k} onClick={()=>setCat(c.k)} style={{padding:"7px 8px",borderRadius:8,border:"1px solid "+(cat===c.k?t.gold:t.border),background:cat===c.k?t.gold+"18":"transparent",color:cat===c.k?t.gold:t.dim2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:cat===c.k?700:400,cursor:"pointer"}}>{c.l}</button>)}
          </div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Maelezo Kamili / Full description (e.g. Mkaa 10kg, Fundi Umeme - Switch)" style={{...inp,marginBottom:8,borderColor:!desc?t.gold+"55":t.border}}/>{!desc&&<p style={{fontFamily:"sans-serif",fontSize:"10px",color:t.gold,margin:"-3px 0 7px",fontStyle:"italic"}}>💡 Andika maelezo kamili kwa ripoti bora / Write full description for clearer reports</p>}
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
function RipodiTab() {
  const {t, presenterMode} = useT();
  const {allSales,allCosts,itemCosts,fetchRange,loading,goals,updateSale,deleteSale,updateCost,deleteCost,includeStaffCosts,toggleIncludeStaffCosts} = useAdmin();
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
  const wkGoal=range==="last7"&&goals.weekly?goals.weekly:null;
  const moGoal=range==="month"&&goals.monthly?goals.monthly:null;
  const inp={flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.border,background:t.inputBg,fontFamily:"sans-serif",fontSize:12,color:t.inputColor,outline:"none"};
  async function doFetch(){await fetchRange(start,end);setFetched(true);}
  function sendWA(){
    const lines=["RIPOTI — "+start+(start!==end?" hadi "+end:""),"Mapato Ghafi: "+fmt(gross),"Daily Costs: "+fmt(dailyCosts.reduce((s,c)=>s+c.amount,0)),"Bulk Purchases: "+fmt(bulkCosts.reduce((s,c)=>s+c.amount,0)),"Faida Halisi: "+fmt(net),"Mauzo: "+sales.length,"","Unyamwezini Jiko La Bibi JJJ"].join("\n");
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
      <h2>Mauzo / Sales (${sales.length})</h2>
      <table><tr><th>Tarehe</th><th>Bidhaa</th><th>Idadi</th><th>Bei</th><th>Jumla</th></tr>${salesRows||"<tr><td colspan=5 style='text-align:center;color:#999'>Hakuna mauzo</td></tr>"}</table>
      <h2>Gharama / Expenses (${costs.length})</h2>
      <table><tr><th>Tarehe</th><th>Maelezo</th><th>Aina</th><th>Kiasi</th></tr>${costRows||"<tr><td colspan=4 style='text-align:center;color:#999'>Hakuna gharama</td></tr>"}</table>
      <p style="margin-top:24px;font-size:10px;color:#999;text-align:center">Unyamwezini Jiko La Bibi JJJ &middot; Mbezi Luis, Goba Road, Dar es Salaam</p>
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
  const {goals,setGoal,todayGross,allSales,fetchRange} = useAdmin();
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
  const ws=new Date();ws.setDate(ws.getDate()-ws.getDay());
  const ms=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkG=allSales.filter(s=>s.sale_date>=dateStrET(ws)).reduce((s,r)=>s+r.total_price,0);
  const moG=allSales.filter(s=>s.sale_date>=dateStrET(ms)).reduce((s,r)=>s+r.total_price,0);

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
    const sWeekly = sDaily*6;   // Jumatatu–Jumamosi, biashara imefungwa Jumapili
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
          {goals.daily>0&&<Ring label="Leo/Today" current={todayGross} goal={goals.daily} color={goalColor(todayGross,goals.daily,t)} size={82}/>}
          {goals.weekly>0&&<Ring label="Wiki/Week" current={wkG} goal={goals.weekly} color={goalColor(wkG,goals.weekly,t)} size={82}/>}
          {goals.monthly>0&&<Ring label="Mwezi/Month" current={moG} goal={goals.monthly} color={goalColor(moG,goals.monthly,t)} size={82}/>}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gr,display:"inline-block"}}/>90%+</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.gold,display:"inline-block"}}/>50-89%</span>
          <span style={{fontSize:9,color:t.dim2,fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:t.rd,display:"inline-block"}}/>&lt;50%</span>
        </div>
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
            </div>
            <div style={{background:t.bl+"12",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textTransform:"uppercase"}}>Kila Wiki</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.bl,marginTop:2}}>{presenterMode?"+"+growthPct+"%":fmt(suggestion.sWeekly)}</div>
            </div>
            <div style={{background:t.gr+"12",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2,textTransform:"uppercase"}}>Kila Mwezi{suggestion.lastMonthTotal>0?" 🏆":""}</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:t.gr,marginTop:2}}>{presenterMode?"+"+growthPct+"%":fmt(suggestion.sMonthly)}</div>
            </div>
          </div>
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
  const {allSales,allCosts,itemCosts,fetchRange,stockQty,customItems,goals,setCompassTarget,includeStaffCosts,toggleIncludeStaffCosts,staff,showFullWeek,toggleShowFullWeek,closedWeekday} = useAdmin();
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
  const svcMap=useMemo(()=>{const m={pickup:0,delivery:0,dinein:0};s30.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});return m;},[s30]);
  const costMap=useMemo(()=>{
    const m={};
    c30.forEach(c=>{
      // Use description if provided (more meaningful than just "other")
      const label = (c.description && c.description.trim().length > 0)
        ? c.description.trim().charAt(0).toUpperCase() + c.description.trim().slice(1)
        : (c.category || "Nyingine");
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
  },[c30]);
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
    const dayChartFull = dayNames.map((name,i)=>({name,rev:byDay[i]||0}));
    const dayChart = showFullWeek ? dayChartFull : dayChartFull.filter((d,i)=>i!==closedWeekday);
    return { bestDay, bestHour, dayChart };
  },[s30,showFullWeek,closedWeekday]);

  // Slow-moving items — menu items with no sales in the last 30-day window
  const slowMoving = useMemo(()=>{
    const lastSaleMap = {}; // itemId -> latest sale_date string
    allSales.forEach(s=>{
      if(!lastSaleMap[s.item_id] || s.sale_date > lastSaleMap[s.item_id]) lastSaleMap[s.item_id] = s.sale_date;
    });
    const allMenuItems = [...menu, ...customItems.map(ci=>({id:ci.id, name:{sw:ci.sw}}))];
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
  },[allSales,customItems]);

  // Shared Stock Forecast list — hoisted here so both the live UI and the Picha Kamili
  // export use the exact same filtered list (was previously computed separately in each).
  const stockList = useMemo(()=>stockPredictions.filter(p=>stockQty[p.id]>0),[stockPredictions,stockQty]);

  // Resolved "how many to show" counts for each ranked list, driven by the CountSelector controls.
  const topItemsShown = topItemsN==="All" ? itemStats.length : Math.min(topItemsN,itemStats.length);
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
      let H = 530; // header + health + compass + stats + trend chart baseline
      H += rowsForItems>0 ? (60+rowsForItems*46) : 0;
      H += rowsForStock>0 ? (50+rowsForStock*40) : 0; // stock forecast block
      H += dayHourAnalysis.bestDay ? (90+dayHourAnalysis.dayChart.length*26+30) : 0; // best day/hour block + weekday revenue bars + legend
      H += (hasSvc||hasCost) ? (60 + 190) : 0; // donuts row
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

      // Stat boxes: Gross, Net, Margin (presenter-safe percentages)
      const stats = [
        {label:"Mapato Ghafi", val: presenterMode?(weekOverWeek.pct>=0?"+":"")+weekOverWeek.pct+"%":fmt(gross), color:"#B8860B"},
        {label:"Faida Halisi", val: presenterMode?margin+"%":fmt(net), color: net>=0?"#1B7A20":"#C62828"},
        {label:"Margin", val: margin+"%", color: margin>25?"#1B7A20":margin>0?"#B8860B":"#C62828"},
      ];
      const boxW = (W-PAD*2-20)/3;
      stats.forEach((s,i)=>{
        const bx = PAD + i*(boxW+10);
        ctx.fillStyle = s.color+"15";
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx,y,boxW,74,10) : ctx.rect(bx,y,boxW,74); ctx.fill();
        ctx.fillStyle = "rgba(11,31,69,0.5)"; ctx.font="11px Arial"; ctx.textAlign="center";
        ctx.fillText(s.label.toUpperCase(), bx+boxW/2, y+26);
        ctx.fillStyle = s.color; ctx.font="bold 17px Georgia, serif";
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
      if(itemStats.length>0){
        ctx.fillStyle = "#0B1F45"; ctx.font="bold 15px Arial"; ctx.textAlign="left";
        ctx.fillText("Bidhaa Bora / Top Items", PAD, y);
        y += 16;
        const maxItemRev = itemStats[0].rev || 1;
        itemStats.slice(0,topItemsShown).forEach((it,i)=>{
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
          1:1 = Kuvunja Sawa / Breaking Even &nbsp;\u00b7&nbsp; Chini ya 1:1 = Hasara / Losing &nbsp;\u00b7&nbsp; 1:{compassTarget}+ = Lengo Limefikiwa / Target Reached
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"10px 0"}}>
        <Chip label="Mapato Ghafi" value={presenterMode?"100%":fmt(gross)} color={t.gold} icon="💰"/>
        <Chip label="Faida Halisi" value={presenterMode?(gross?Math.round(net/gross*100):0)+"%":fmt(net)} color={net>=0?t.gr:t.rd} icon="📊"/>
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
          {itemStats.length>5 && <CountSelector value={topItemsN} onChange={setTopItemsN} total={itemStats.length}/>}
        </div>
        {itemStats.slice(0,topItemsShown).map((item,i)=>{
          const maxRev = itemStats[0].rev;
          const ratio = maxRev>0 ? item.rev/maxRev : 0;
          const tempEmoji = ratio>=0.66 ? "🔥" : ratio<=0.33 ? "❄️" : "🌤️";
          const tempColor = ratio>=0.66 ? t.rd : ratio<=0.33 ? t.bl : t.gold;
          return (
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:i===0?t.gold:t.dim2,width:16,flexShrink:0}}>{i+1}</span>
            <IconBadge emoji={tempEmoji} color={tempColor}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:t.text,marginBottom:3}}>{item.name}</div>
              <Bar value={item.rev} max={itemStats[0].rev} color={i===0?t.gold:t.bl} h={5}/>
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
        {insights.map((ins,i)=><div key={i} style={{background:ins.c==="good"?t.gr+"12":ins.c==="danger"?t.rd+"12":ins.c==="warn"?t.gold+"12":t.bl+"12",borderLeft:"3px solid "+(ins.c==="good"?t.gr:ins.c==="danger"?t.rd:ins.c==="warn"?t.gold:t.bl),borderRadius:"0 10px 10px 0",padding:"9px 13px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:t.text,lineHeight:1.5}}>{ins.msg}</div>)}
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
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost,customItems,addCustomItem,deleteCustomItem,stockQty,setStockQty} = useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [ced,setCed]=useState(null);const [cv,setCv]=useState("");const [qed,setQed]=useState(null);const [qv,setQv]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [newItem,setNewItem]=useState({sw:"",en:"",pr:"",ph:"",em:"🍽️",sectionName:"Bidhaa Mpya / Specials"});
  const setNI=k=>e=>setNewItem(p=>({...p,[k]:e.target.value}));
  function saveNew(){
    if(!newItem.sw.trim()||!newItem.pr.trim())return;
    addCustomItem(newItem);
    setNewItem({sw:"",en:"",pr:"",ph:"",em:"🍽️",sectionName:"Bidhaa Mpya / Specials"});
    setShowAdd(false);
  }
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
              <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26,marginTop:3}}>
                <span style={{fontFamily:"sans-serif",fontSize:9,color:t.dim2}}>Stoki/Stock:</span>
                {qed===item.id?<div style={{display:"flex",gap:4}}>
                  <input type="number" value={qv} onChange={e=>setQv(e.target.value)} autoFocus placeholder="0" style={{width:62,padding:"2px 6px",borderRadius:4,border:"1px solid "+t.bl,background:t.inputBg,fontFamily:"sans-serif",fontSize:11,color:t.inputColor,outline:"none"}}/>
                  <button onClick={()=>{setStockQty(item.id,qv);setQed(null);}} style={{background:t.bl,color:"#fff",border:"none",borderRadius:4,padding:"2px 7px",fontSize:11,cursor:"pointer",fontWeight:700}}>OK</button>
                </div>:<button onClick={()=>{setQed(item.id);setQv(String(stockQty[item.id]||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:10,color:stockQty[item.id]?t.bl:t.dim2,cursor:"pointer",padding:0}}>{stockQty[item.id]?stockQty[item.id]+" units":"Weka kiasi"}</button>}
              </div>
            </div>;
          })}
        </div>
      </div>)}

      {/* ═══ CUSTOM ITEMS / BIDHAA MPYA ═══ */}
      <div style={{marginTop:18}}>
        <div style={{background:t.gold,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#fff",color:t.gold,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:900}}>✨</div>
            <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:"#fff"}}>Bidhaa Mpya / Custom Items ({customItems.length})</span>
          </div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{background:"#fff",color:t.gold,border:"none",borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{showAdd?"✕ Funga":"+ Ongeza"}</button>
        </div>
        <div style={{border:"1px solid "+t.border,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:t.bg2,padding:"12px"}}>
          {showAdd && <div style={{background:t.bg4,borderRadius:10,padding:12,marginBottom:10}}>
            <p style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:1}}>New Item / Bidhaa Mpya</p>
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:8,marginBottom:8}}>
              <input value={newItem.em} onChange={setNI("em")} placeholder="🍽️" style={{padding:"9px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:18,textAlign:"center",color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
              <input value={newItem.sw} onChange={setNI("sw")} placeholder="Jina la Kiswahili *" style={{padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <input value={newItem.en} onChange={setNI("en")} placeholder="English name (optional)" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            <input value={newItem.pr} onChange={setNI("pr")} placeholder="Bei (e.g. 2,500) *" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:13,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            <input value={newItem.ph} onChange={setNI("ph")} placeholder="Photo URL (optional)" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
            <input value={newItem.sectionName} onChange={setNI("sectionName")} placeholder="Section name" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.border,background:t.inputBg,fontSize:12,color:t.inputColor,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
            <button onClick={saveNew} disabled={!newItem.sw||!newItem.pr} style={{width:"100%",background:(!newItem.sw||!newItem.pr)?t.bg4:"linear-gradient(135deg,"+t.gr+",#009940)",color:(!newItem.sw||!newItem.pr)?t.dim2:"#fff",border:"none",borderRadius:10,padding:11,fontSize:13,fontWeight:700,cursor:(!newItem.sw||!newItem.pr)?"default":"pointer"}}>Save & Show on Website / Hifadhi</button>
          </div>}
          {customItems.length===0 && !showAdd && <p style={{textAlign:"center",color:t.dim2,fontFamily:"sans-serif",fontSize:12,padding:"14px 0",margin:0}}>No custom items yet. Tap "+ Ongeza" to add one.</p>}
          {customItems.map((it,i)=>(
            <div key={it.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:i%2===0?t.bg4:"transparent",borderRadius:8,marginBottom:3}}>
              <span style={{fontSize:20}}>{it.em||"🍽️"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text}}>{it.sw}</div>
                <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{it.sectionName} · TZS {it.pr}</div>
              </div>
              <button onClick={()=>{if(confirm("Delete this custom item?"))deleteCustomItem(it.id);}} style={{background:t.rd+"18",border:"1px solid "+t.rd+"44",color:t.rd,borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Futa</button>
            </div>
          ))}
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
  const td=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
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
          <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{o.customer}</div>
          <div style={{fontFamily:"sans-serif",fontSize:11,color:t.dim2,marginTop:1}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/New_York"})} · {o.service}{o.phone?" · "+o.phone:""}</div>
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
  const {exportAll, importAll, allSales, allCosts} = useAdmin();
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
    downloadCSV(
      allSales,
      ["sale_date","item_name","quantity","unit_price","total_price","service_type","created_at"],
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
function StaffMemberCard({s, isEditing, form, setForm, onStartEdit, onCancelEdit, onSave, onDelete, onPay, payForm, setPayForm, showPay, setShowPay, myWarnings, onAddWarning, onDeleteWarning, onReactivate, isFormer, totalPayroll}) {
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
                <span style={{fontSize:9,fontWeight:700,color:w.type==="written"?t.rd:t.gold,background:(w.type==="written"?t.rd:t.gold)+"18",padding:"1px 6px",borderRadius:4,flexShrink:0,marginTop:1}}>{w.type==="written"?"MAANDISHI":"MDOMO"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"sans-serif",fontSize:11,color:t.text}}>{w.reason}</div>
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
            <button onClick={()=>onDelete(s)} style={{background:t.dim2+"15",color:t.dim2,border:"1px solid "+t.dim2+"40",borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>🚪 Toa</button>
          </>}
          {isFormer && <button onClick={()=>onReactivate(s)} style={{background:t.gr+"15",color:t.gr,border:"1px solid "+t.gr+"40",borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>↩️ Rejesha</button>}
        </div>
      </div>
    </Card>
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
  const cardProps = {form,setForm,onStartEdit:startEdit,onCancelEdit:cancelEdit,onSave:saveStaff,onDelete:delMember,onPay:doPay,payForm,setPayForm,showPay,setShowPay,onAddWarning:addWarning,onDeleteWarning:deleteWarning,totalPayroll};

  return (
    <div style={{padding:"1rem"}}>
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

/* ═══ TAB: AJIRA RECORDS (owner oversight of signed contracts) ═══ */
function AjiraTab() {
  const {t} = useT();
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const typeLabels = { muda_mfupi:"📄 Muda Mfupi", kudumu:"📜 Kudumu", sera:"📕 Sera", ubia:"🤝 Ushirikiano", wadau:"📋 Wadau Waanzilishi" };

  useEffect(()=>{
    async function loadContracts(){
      try {
        const {supabase} = await import("../lib/supabase");
        if(!supabase){setLoading(false);return;}
        const {data} = await supabase.from("signed_contracts")
          .select("id,doc_type,employee_name,employee_phone,signed_at")
          .order("signed_at",{ascending:false}).limit(200);
        setRecords(data||[]);
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

  const counts = {
    total: records.length,
    kudumu: records.filter(r=>r.doc_type==="kudumu").length,
    ubia: records.filter(r=>r.doc_type==="ubia").length,
  };

  return (
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Chip label="Mikataba Yote" value={counts.total} color={t.gold} icon="📋"/>
        <Chip label="Ya Kudumu" value={counts.kudumu} color={t.gr} icon="📜"/>
        <Chip label="Ushirikiano" value={counts.ubia} color={t.pu} icon="🤝"/>
      </div>

      <a href="/ajira" target="_blank" rel="noopener" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:"linear-gradient(135deg,"+t.gold+",#8a6008)",color:"#fff",border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12,textDecoration:"none",boxSizing:"border-box",boxShadow:"0 4px 16px "+t.gold+"44"}}>
        ✍️ Fungua Ajira Digital / Open Signing App
      </a>

      <Card style={{padding:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:t.dim2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Mikataba Iliyosainiwa / Signed Contracts</p>
        {loading && <p style={{textAlign:"center",color:t.dim2,fontSize:12,padding:"1rem 0"}}>Inapakia... / Loading...</p>}
        {!loading && records.length===0 && <p style={{textAlign:"center",color:t.dim2,fontSize:12,padding:"1rem 0"}}>Hakuna mikataba bado / No signed contracts yet</p>}
        {records.map((r,i)=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:i%2===0?t.bg4:"transparent",borderRadius:8,marginBottom:3}}>
            <span style={{fontSize:18}}>{(typeLabels[r.doc_type]||"📄").split(" ")[0]}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"sans-serif",fontSize:12,fontWeight:700,color:t.text}}>{r.employee_name}</div>
              <div style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{typeLabels[r.doc_type]||r.doc_type} · {new Date(r.signed_at).toLocaleDateString("en-US",{timeZone:"America/New_York"})}{r.employee_phone?" · "+r.employee_phone:""}</div>
            </div>
            <button onClick={()=>viewRecord(r.id)} style={{background:t.bl+"15",border:"1px solid "+t.bl+"40",color:t.bl,borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Angalia</button>
          </div>
        ))}
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
        <ChuoBullet title="Set Goals / Weka Malengo (mikono)" body="Unaweza pia kuandika malengo yako mwenyewe moja kwa moja, bila kutumia pendekezo. / You can also type your own goals manually without using the suggestion." />
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

      <ChuoSection icon="👥" color={t.gr} titleSw="Wafanya / Staff" titleEn="Payroll, contractors & discipline" isOpen={open==="wafanya"} onToggle={()=>toggle("wafanya")}>
        <ChuoBullet title="+ Ongeza Mfanyakazi / Add Staff" body="Chagua aina: Kudumu (mshahara wa mwezi), Msimu (malipo yanayobadilika), au Mkandarasi (kwa kazi moja). / Choose type: Long-term (monthly salary), Seasonal (variable pay), or Contractor (per-job)." />
        <ChuoBullet title="💰 Lipa / Pay" body="Bonyeza kumlipa mfanyakazi — kiasi kinaingia MOJA KWA MOJA kwenye gharama za biashara (Ripoti/Akili). / Tap to pay a staff member — the amount automatically flows into business expenses (visible in Ripoti/Akili)." />
        <ChuoBullet title="✏️ Hariri / Edit" body="Badilisha jina, kazi, mshahara, au maelezo ya mfanyakazi wakati wowote. / Change name, role, salary, or notes for any staff member anytime." />
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
        <ChuoBullet title="Zaidi / More (nukta tatu)" body="Tabu za Malengo, Wafanya, Ajira, na Hifadhi ziko hapa ili menyu isijae. Bonyeza kufungua orodha kamili. / The Malengo, Wafanya, Ajira, and Hifadhi tabs live here to keep the main menu uncluttered. Tap to open the full list." />
        <ChuoBullet title="Back / Rudi" body="Juu kushoto — kinarudisha kwenye tovuti kuu ya wateja bila kutoka Msimamizi kabisa. / Top-left — returns to the main customer-facing website without fully exiting Msimamizi." />
        <ChuoBullet title="Exit / Toka" body="Kinafunga kikao cha Msimamizi kabisa — utahitaji PIN tena kuingia. / Fully closes the Msimamizi session — you'll need the PIN again to re-enter." />
      </ChuoSection>

      <div style={{background:t.gold+"10",border:"1px solid "+t.gold+"33",borderRadius:12,padding:"1rem",marginTop:14}}>
        <p style={{fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:t.gold,marginBottom:6}}>💡 Ushauri wa Mwisho / Final Tip</p>
        <p style={{fontFamily:"sans-serif",fontSize:11,color:t.dim,lineHeight:1.6,margin:0}}>
          Mtu mpya anapaswa kuanza na tabu ya Leo (kuandika mauzo), kisha Ingiza (kuandika gharama), kisha Maagizo (kutimiza maagizo ya wateja). Vitu vingine (Malengo, Akili, Wafanya) vinaweza kujifunza baadaye. / A new person should start with Leo (recording sales), then Ingiza (recording costs), then Maagizo (fulfilling customer orders). Everything else (Malengo, Akili, Wafanya) can be learned later.
        </p>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function AdminPage({onExit}) {
  const {synced,lastSyncedAt} = useAdmin();
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
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
    {key:"wafanyakazi", icon:"ti-users", label:"Wafanya", sub:"Staff"},
    {key:"ajira", icon:"ti-signature", label:"Ajira", sub:"Contracts"},
    {key:"backup", icon:"ti-cloud-download",  label:"Hifadhi", sub:"Backup"},
    {key:"chuo", icon:"ti-school", label:"Chuo", sub:"Training"},
  ];
  const ALL_TABS=[...PRIMARY_TABS,...MORE_TABS];
  const [showMore,setShowMore]=useState(false);
  const activeIsMore = MORE_TABS.some(tb=>tb.key===tab);
  if(!authed) return (
    <ThemeCtx.Provider value={{t,dark,toggle,presenterMode,togglePresenter}}>
      <PinGate onAuth={()=>setAuthed(true)}/>
    </ThemeCtx.Provider>
  );
  return (
    <ThemeCtx.Provider value={{t,dark,toggle,presenterMode,togglePresenter}}>
      <div style={{minHeight:"100vh",background:t.bg,paddingBottom:80}}>
        <div style={{background:t.header,borderBottom:"1px solid "+t.border,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,backdropFilter:"blur(12px)"}}>
          <button onClick={onExit} style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,display:"flex",alignItems:"center",gap:5}}><i className="ti ti-arrow-left"/> Back</button>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,color:t.gold}}>Msimamizi 🔐</span>
            <span style={{fontFamily:"sans-serif",fontSize:8,color:t.dim2,letterSpacing:"0.3px"}}>{APP_VERSION}</span>
            <span style={{fontFamily:"sans-serif",fontSize:8,letterSpacing:"0.3px",display:"flex",alignItems:"center",gap:3,marginTop:1,color:synced?t.gr:t.gold}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:synced?t.gr:t.gold,display:"inline-block"}}/>
              {synced?"Imesawazishwa / Synced":"Inasawazisha... / Syncing..."}
              {synced && lastSyncedAt && (
                <span style={{color:t.dim2}}>
                  · {lastSyncedAt.toLocaleString("en-US",{timeZone:"America/New_York",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})} ET
                </span>
              )}
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={togglePresenter} title={presenterMode?"Presenter Mode: ON — tap to show real numbers":"Presenter Mode: OFF — tap to hide real numbers for demos"} style={{background:presenterMode?t.gold+"20":"none",border:presenterMode?"1px solid "+t.gold+"55":"1px solid transparent",borderRadius:8,color:presenterMode?t.gold:t.dim,cursor:"pointer",fontFamily:"sans-serif",fontSize:10,padding:"4px 7px",display:"flex",alignItems:"center",gap:4,fontWeight:presenterMode?700:400}}>
              <i className={"ti "+(presenterMode?"ti-eye-off":"ti-eye")} style={{fontSize:14}}/>{presenterMode?"Presenter":""}
            </button>
            <ThemeToggle/>
            <button onClick={()=>setTab("backup")} style={{background:"none",border:"none",color:t.dim,cursor:"pointer",fontFamily:"sans-serif",fontSize:11,padding:"4px 6px",display:"flex",alignItems:"center",gap:3}} title="Backup"><i className="ti ti-cloud-download" style={{fontSize:14}}/></button>
            <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:t.dim2,cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>Exit</button>
          </div>
        </div>
        <div style={{background:t.tabBar,borderBottom:"1px solid "+t.border,display:"flex",overflowX:"auto",scrollbarWidth:"none",position:"sticky",top:48,zIndex:39}}>
          {PRIMARY_TABS.map(tb=><button key={tb.key} onClick={()=>setTab(tb.key)} style={{flex:"0 0 auto",padding:"8px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:tab===tb.key?"2px solid "+t.gold:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
            <i className={"ti "+tb.icon} style={{fontSize:17,color:tab===tb.key?t.gold:t.dim2}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:tab===tb.key?t.gold:t.text,whiteSpace:"nowrap"}}>{tb.label}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:600,color:tab===tb.key?t.gold:t.dim,whiteSpace:"nowrap"}}>{tb.sub}</span>
          </button>)}
          <button onClick={()=>setShowMore(true)} style={{flex:"0 0 auto",padding:"8px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:activeIsMore?"2px solid "+t.gold:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
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
                  <button key={tb.key} onClick={()=>{setTab(tb.key);setShowMore(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 8px",borderRadius:14,border:"1.5px solid "+(tab===tb.key?t.gold:t.border),background:tab===tb.key?t.gold+"12":t.bg4,cursor:"pointer"}}>
                    <i className={"ti "+tb.icon} style={{fontSize:24,color:tab===tb.key?t.gold:t.dim}}/>
                    <span style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:tab===tb.key?t.gold:t.text}}>{tb.label}</span>
                    <span style={{fontFamily:"sans-serif",fontSize:10,color:t.dim2}}>{tb.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab==="leo"    &&<LeoTab onGoTo={setTab}/>}
        {tab==="ingiza" &&<IngizaTab/>}
        {tab==="ripoti" &&<RipodiTab/>}
        {tab==="malengo"&&<MalengoTab/>}
        {tab==="akili"  &&<AkiliTab/>}
        {tab==="menu"   &&<MenuTab/>}
        {tab==="maagizo"&&<MaagizoTab/>}
        {tab==="wafanyakazi" &&<WafanyakaziTab/>}
        {tab==="ajira" &&<AjiraTab/>}
        {tab==="backup" &&<BackupTab/>}
        {tab==="chuo" &&<ChuoTab/>}
      </div>
    </ThemeCtx.Provider>
  );
}
