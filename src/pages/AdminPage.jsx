import { useState, useMemo, useEffect, useCallback } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

/* ═══ DESIGN TOKENS ═══ */
const BG   = "#030B18";
const BG2  = "#071428";
const BG3  = "#0B1E3A";
const GOLD = "#D4AF37";
const GOLD2= "#FFD700";
const GR   = "#00C851";
const RD   = "#FF3D57";
const BL   = "#2979FF";
const PU   = "#9C27B0";
const WHITE= "#FFFFFF";
const DIM  = "rgba(255,255,255,0.55)";
const DIM2 = "rgba(255,255,255,0.25)";
const CARD = "rgba(255,255,255,0.04)";
const BORDER= "rgba(212,175,55,0.2)";

const fmt = n => "TZS " + Number(n||0).toLocaleString();
const pct = (a,b) => b ? Math.min(100,Math.round(a/b*100)) : 0;
const today = () => new Date().toISOString().split("T")[0];

/* ═══ SHARED UI ═══ */
function GlassCard({children, style={}, glow=false}) {
  return (
    <div style={{
      background: CARD,
      backdropFilter:"blur(20px)",
      border:`1px solid ${glow?"rgba(212,175,55,0.4)":BORDER}`,
      borderRadius:16,
      boxShadow: glow?`0 0 30px rgba(212,175,55,0.12), 0 8px 32px rgba(0,0,0,0.4)`:"0 8px 32px rgba(0,0,0,0.3)",
      ...style
    }}>{children}</div>
  );
}

function StatChip({label,value,color=GOLD,icon,trend}) {
  return (
    <div style={{background:`linear-gradient(135deg,${color}15,${color}08)`,border:`1px solid ${color}33`,borderRadius:12,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:8,right:10,fontSize:18,opacity:0.15}}>{icon}</div>
      <div style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:`${color}99`,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color,lineHeight:1}}>{value}</div>
      {trend&&<div style={{fontFamily:"sans-serif",fontSize:"9px",color:trend>0?GR:RD,marginTop:3}}>{trend>0?"▲":"▼"} {Math.abs(trend)}%</div>}
    </div>
  );
}

function NeonBar({value,max,color=GOLD,height=6}) {
  const w = pct(value,max);
  return (
    <div style={{height,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:w+"%",background:`linear-gradient(90deg,${color},${color}cc)`,borderRadius:99,boxShadow:`0 0 8px ${color}66`,transition:"width 0.8s cubic-bezier(.4,0,.2,1)"}}/>
    </div>
  );
}

function GoalRing({label,current,goal,color=GOLD,size=70}) {
  const p = goal ? Math.min(100,pct(current,goal)) : 0;
  const r = size/2 - 7;
  const circ = 2*Math.PI*r;
  const over = goal && current >= goal;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{position:"relative",width:size,height:size,margin:"0 auto 6px"}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={over?8:6}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?GR:color} strokeWidth={over?8:6}
            strokeDasharray={`${p/100*circ} ${circ}`} strokeLinecap="round"
            style={{filter:`drop-shadow(0 0 6px ${over?GR:color}88)`,transition:"stroke-dasharray 0.8s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:size>70?16:13,fontWeight:900,color:over?GR:color,lineHeight:1}}>{p}%</span>
        </div>
      </div>
      <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</div>
      <div style={{fontFamily:"sans-serif",fontSize:"9px",color:over?GR:DIM2,marginTop:2}}>{fmt(current)}</div>
    </div>
  );
}

/* ═══ EDIT MODAL ═══ */
function EditModal({type,record,onSave,onDelete,onClose,prices}) {
  const isSale = type==="sale";
  const [qty,setQty]   = useState(String(record.quantity||1));
  const [price,setPrice]= useState(String(record.unit_price||record.total_price||0));
  const [svc,setSvc]   = useState(record.service_type||"pickup");
  const [date,setDate] = useState(record.sale_date||record.cost_date||today());
  const [desc,setDesc] = useState(record.description||"");
  const [amount,setAmount]=useState(String(record.amount||0));
  const [cat,setCat]   = useState(record.category||"gas");
  const [spType,setSpType]=useState(record.spending_type||"daily");
  const [confirm,setConfirm]=useState(false);

  function doSave(){
    if(isSale){
      const q=parseInt(qty)||1; const up=parseInt(price)||0;
      onSave(record.id,{quantity:q,unit_price:up,total_price:up*q,service_type:svc,sale_date:date});
    } else {
      onSave(record.id,{description:desc,amount:parseInt(amount)||0,category:cat,cost_date:date,spending_type:spType});
    }
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(3,11,24,0.92)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 20px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:BG2,border:`1px solid ${BORDER}`,borderRadius:"20px 20px 12px 12px",padding:"20px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:`0 -20px 60px rgba(0,0,0,0.8)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:GOLD}}>{isSale?"Hariri Mauzo / Edit Sale":"Hariri Gharama / Edit Expense"}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:DIM,borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {isSale?(
          <>
            <Label>Bidhaa / Item</Label>
            <div style={{background:"rgba(212,175,55,0.08)",border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",marginBottom:10,color:GOLD,fontFamily:"sans-serif",fontSize:13,fontWeight:700}}>{record.item_name}</div>
            <Label>Idadi / Quantity</Label>
            <Row>
              <Btn onClick={()=>setQty(q=>String(Math.max(1,parseInt(q)-1)))}>−</Btn>
              <NumIn value={qty} onChange={setQty} style={{textAlign:"center",width:60}}/>
              <Btn onClick={()=>setQty(q=>String(parseInt(q)+1))}>+</Btn>
            </Row>
            <Label>Bei ya Kiuzo / Unit Price (TZS)</Label>
            <NumIn value={price} onChange={setPrice} placeholder="0"/>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:GOLD,marginBottom:10}}>= {fmt(parseInt(price||0)*parseInt(qty||1))}</div>
            <Label>Aina ya Huduma / Service</Label>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${svc===k?GOLD:BORDER}`,background:svc===k?"rgba(212,175,55,0.15)":"transparent",color:svc===k?GOLD:DIM2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </>
        ):(
          <>
            <Label>Maelezo / Description</Label>
            <TextIn value={desc} onChange={setDesc} placeholder="e.g. Mkaa 10kg"/>
            <Label>Kiasi / Amount (TZS)</Label>
            <NumIn value={amount} onChange={setAmount} placeholder="0"/>
            <Label>Aina / Category</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
              {[["gas","Gesi/Gas"],["staff","Wafanyakazi/Staff"],["ingredients","Malighafi/Ingredients"],["rent","Pango/Rent"],["bulk_ingredients","Jumla/Bulk"],["equipment","Vifaa/Equipment"],["marketing","Matangazo/Marketing"],["other","Nyingine/Other"]].map(([k,l])=>(
                <button key={k} onClick={()=>setCat(k)} style={{padding:"6px 8px",borderRadius:8,border:`1px solid ${cat===k?GOLD:BORDER}`,background:cat===k?"rgba(212,175,55,0.12)":"transparent",color:cat===k?GOLD:DIM2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:cat===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <Label>Aina ya Matumizi / Spending Type</Label>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["daily","Kila Siku/Daily"],["bulk","Jumla/Bulk"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSpType(k)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${spType===k?BL:BORDER}`,background:spType===k?"rgba(41,121,255,0.15)":"transparent",color:spType===k?BL:DIM2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:spType===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </>
        )}

        <Label>Tarehe / Date</Label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box",marginBottom:14}}/>

        <button onClick={doSave} style={{width:"100%",background:`linear-gradient(135deg,${GOLD},#a07010)`,color:BG,border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8,boxShadow:`0 4px 20px ${GOLD}44`}}>
          Hifadhi Mabadiliko / Save Changes
        </button>

        {!confirm?(
          <button onClick={()=>setConfirm(true)} style={{width:"100%",background:"rgba(255,61,87,0.1)",color:RD,border:`1px solid ${RD}44`,borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            Futa / Delete
          </button>
        ):(
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onDelete(record.id);onClose();}} style={{flex:1,background:RD,color:WHITE,border:"none",borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Futa Sasa / Confirm Delete</button>
            <button onClick={()=>setConfirm(false)} style={{flex:1,background:"rgba(255,255,255,0.08)",color:DIM,border:"none",borderRadius:10,padding:10,fontFamily:"sans-serif",fontSize:12,cursor:"pointer"}}>Rudi / Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* mini helpers */
function Label({children}){return <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:5}}>{children}</div>;}
function Row({children}){return <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>{children}</div>;}
function Btn({children,onClick}){return <button onClick={onClick} style={{width:36,height:36,borderRadius:"50%",border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.06)",color:WHITE,fontWeight:900,fontSize:18,cursor:"pointer",flexShrink:0}}>{children}</button>;}
function NumIn({value,onChange,placeholder="",style={}}){return <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{flex:1,padding:"8px 10px",borderRadius:10,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box",marginBottom:10,...style}}/>;}
function TextIn({value,onChange,placeholder=""}){return <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"8px 10px",borderRadius:10,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box",marginBottom:10}}/>;}

/* ═══ RECORD ROW — with edit button ═══ */
function SaleRow({sale,onEdit,i}) {
  return (
    <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:i%2===0?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.015)",borderRadius:8,marginBottom:3,gap:8}}>
      <div style={{flex:1}}>
        <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:WHITE}}>{sale.item_name}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"10px",color:DIM2,marginLeft:5}}>x{sale.quantity} · {sale.service_type||""}</span>
        {sale.sale_date!==today()&&<span style={{fontFamily:"sans-serif",fontSize:"9px",color:GOLD,marginLeft:5}}>{sale.sale_date}</span>}
      </div>
      <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:GOLD}}>{fmt(sale.total_price)}</span>
      <button onClick={()=>onEdit(sale)} style={{background:"rgba(212,175,55,0.12)",border:`1px solid ${GOLD}44`,color:GOLD,borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"10px",cursor:"pointer",flexShrink:0}}>✏️</button>
    </div>
  );
}
function CostRow({cost,onEdit,i}) {
  const isBulk=cost.spending_type==="bulk";
  return (
    <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:i%2===0?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.015)",borderRadius:8,marginBottom:3,gap:8}}>
      <div style={{flex:1}}>
        <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:WHITE}}>{cost.description}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"9px",color:DIM2,marginLeft:5}}>{cost.cost_date} · {cost.category}</span>
        {isBulk&&<span style={{fontFamily:"sans-serif",fontSize:"8px",fontWeight:700,color:BL,background:"rgba(41,121,255,0.15)",borderRadius:4,padding:"1px 5px",marginLeft:5}}>BULK</span>}
      </div>
      <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:RD}}>{fmt(cost.amount)}</span>
      <button onClick={()=>onEdit(cost)} style={{background:"rgba(255,61,87,0.12)",border:`1px solid ${RD}44`,color:RD,borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"10px",cursor:"pointer",flexShrink:0}}>✏️</button>
    </div>
  );
}

/* ═══ PIN GATE ═══ */
function PinGate({onAuth}) {
  const [pin,setPin]=useState(""), [err,setErr]=useState(false);
  const PAD=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  function tap(k){
    if(k==="")return; if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}
    const next=pin+k; setPin(next);
    if(next.length===4){if(next===(business.adminPin||"5566"))onAuth();else{setErr(true);setPin("");setTimeout(()=>setErr(false),1400);}}
  }
  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 30% 20%,#1a0a00 0%,${BG} 60%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle at 20% 80%,rgba(212,175,55,0.05) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(41,121,255,0.05) 0%,transparent 50%)`,pointerEvents:"none"}}/>
      <img src="/logo.png" alt="" width={90} height={90} style={{borderRadius:"50%",border:`3px solid ${GOLD}`,objectFit:"cover",marginBottom:"1rem",boxShadow:`0 0 30px ${GOLD}44`}} onError={e=>e.target.style.display="none"}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:WHITE,margin:"0 0 3px",textShadow:`0 0 20px ${GOLD}66`}}>Jiko La Bibi JJJ</h1>
      <p style={{color:DIM2,fontSize:"11px",fontFamily:"sans-serif",margin:"0 0 2rem",letterSpacing:"0.1em"}}>COMMAND CENTER · MSIMAMIZI</p>
      <div style={{display:"flex",gap:14,marginBottom:"1.4rem"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?GOLD:"rgba(255,255,255,0.1)",border:`2px solid ${pin.length>i?GOLD:"rgba(255,255,255,0.2)"}`,boxShadow:pin.length>i?`0 0 10px ${GOLD}`:""  ,transition:"all 0.15s"}}/>)}
      </div>
      {err&&<p style={{color:RD,fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem",animation:"shake 0.3s"}}>PIN si sahihi / Incorrect PIN</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:10}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:14,fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":k==="⌫"?"rgba(255,61,87,0.12)":"rgba(255,255,255,0.06)",color:k==="⌫"?RD:WHITE,border:k===""?"none":`1px solid ${k==="⌫"?RD+"44":BORDER}`,cursor:k===""?"default":"pointer",boxShadow:k&&k!=="⌫"&&k!==".."?`0 2px 10px rgba(0,0,0,0.3)`:""}}>{k}</button>)}
      </div>
    </div>
  );
}

/* ═══ TAB 1: LEO ═══ */
function LeoTab({onGoTo}) {
  const {todaySales,todayGross,todayNet,todayOverhead,goals,updateSale,deleteSale}=useAdmin();
  const [editRec,setEditRec]=useState(null);
  const h=new Date().getHours();
  const margin=todayGross?Math.round((todayNet||0)/todayGross*100):0;
  const alerts=[];
  if(todayGross===0&&h>9)alerts.push({c:RD,msg:"No sales yet today — is the menu ready?"});
  if(goals.daily&&todayGross>=goals.daily)alerts.push({c:GR,msg:"Daily goal reached! Great work!"});
  if(todayOverhead>todayGross*0.5&&todayGross>0)alerts.push({c:RD,msg:"Expenses are >50% of revenue today."});

  return (
    <div style={{padding:"1rem"}}>
      {/* Revenue hero */}
      <GlassCard glow style={{padding:"1.4rem",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${GOLD},${GR},${GOLD})`}}/>
        <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${GOLD}11,transparent 70%)`,pointerEvents:"none"}}/>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:GOLD+"99",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"2px"}}>Mapato ya Leo / Today's Revenue</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"42px",fontWeight:900,color:GOLD,margin:"0",lineHeight:1,textShadow:`0 0 30px ${GOLD}55`}}>{fmt(todayGross)}</p>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          {[[fmt(todayOverhead),RD,"Gharama/Costs"],[todayNet===null?"--":fmt(todayNet),todayNet>=0?GR:RD,"Faida/Profit"],[todaySales.length,WHITE,"Mauzo/Sales"],[margin+"%",margin>20?GR:margin>0?GOLD:RD,"Margin"]].map(([v,col,l])=>(
            <div key={l}>
              <div style={{fontFamily:"sans-serif",fontSize:"9px",color:DIM2,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
              <div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:col}}>{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Goal ring */}
      {goals.daily>0&&(
        <GlassCard style={{padding:"1rem",marginBottom:12,display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <GoalRing label="Leo/Today" current={todayGross} goal={goals.daily} color={GOLD}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:900,color:GOLD}}>{fmt(goals.daily)}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"9px",color:DIM2,textTransform:"uppercase",letterSpacing:"1px",marginTop:3}}>Daily Goal</div>
          </div>
        </GlassCard>
      )}

      {/* Alerts */}
      {alerts.map((a,i)=>(
        <div key={i} style={{borderLeft:`3px solid ${a.c}`,background:`${a.c}11`,borderRadius:"0 10px 10px 0",padding:"8px 12px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:a.c}}>{a.msg}</div>
      ))}

      {/* Quick actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <button onClick={()=>onGoTo("ingiza")} style={{background:`linear-gradient(135deg,${GR},#009940)`,color:WHITE,border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${GR}44`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-plus"/>Ingiza Mauzo / Record Sale
        </button>
        <button onClick={()=>onGoTo("ingiza")} style={{background:`linear-gradient(135deg,${RD},#cc0022)`,color:WHITE,border:"none",borderRadius:12,padding:"13px 8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${RD}44`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-minus"/>Ingiza Gharama / Record Expense
        </button>
      </div>

      {/* Today's sales — editable */}
      {todaySales.length>0&&(
        <GlassCard style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Mauzo ya Leo / Today's Sales ({todaySales.length}) — Tap ✏️ to edit</p>
          {todaySales.slice(0,15).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={setEditRec} i={i}/>)}
        </GlassCard>
      )}

      {editRec&&(
        <EditModal type="sale" record={editRec} prices={{}} onSave={updateSale} onDelete={deleteSale} onClose={()=>setEditRec(null)}/>
      )}
    </div>
  );
}

/* ═══ TAB 2: INGIZA ═══ */
function IngizaTab() {
  const {prices,recordSale,recordCost,allCosts,deleteCost,updateCost}=useAdmin();
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

  const DAILY_CATS=[{k:"gas",l:"Gesi/Gas",ic:"ti-flame"},{k:"staff",l:"Wafanyakazi/Staff",ic:"ti-users"},{k:"ingredients",l:"Malighafi/Ingredients",ic:"ti-shopping-cart"},{k:"rent",l:"Pango/Rent",ic:"ti-building"},{k:"other",l:"Nyingine/Other",ic:"ti-dots"}];
  const BULK_CATS=[{k:"bulk_ingredients",l:"Jumla/Bulk Ingredients",ic:"ti-packages"},{k:"equipment",l:"Vifaa/Equipment",ic:"ti-tools"},{k:"marketing",l:"Matangazo/Marketing",ic:"ti-speakerphone"},{k:"bulk_other",l:"Nyingine Jumla/Other Bulk",ic:"ti-dots"}];

  const secItems=menu.filter(m=>m.section===sec);
  const isToday=date===today();
  const recentCosts=allCosts.filter(c=>c.cost_date===date).slice(0,10);

  async function doSale(){
    if(!item||saleBusy)return; setSaleBusy(true);
    await recordSale(item,qty,svc,date);
    setItem(null);setQty(1);setSaleBusy(false);setSaleOk(true);
    setTimeout(()=>setSaleOk(false),2000);
  }
  async function doCost(){
    if(!amount||costBusy)return; setCostBusy(true);
    await recordCost(cat,desc,amount,date,costType);
    setAmount("");setDesc("");setCostBusy(false);setCostOk(true);
    setTimeout(()=>setCostOk(false),2000);
  }

  return (
    <div style={{padding:"1rem"}}>
      {/* Date selector */}
      <GlassCard glow={!isToday} style={{padding:"1rem",marginBottom:12}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:isToday?GR:GOLD,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>{isToday?"Leo / Today — Input Date":"Tarehe Iliyopita / Past Date"}</p>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${isToday?GR:GOLD}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:14,color:WHITE,outline:"none",boxSizing:"border-box",fontWeight:700}}/>
        {!isToday&&<p style={{fontFamily:"sans-serif",fontSize:"10px",color:GOLD,marginTop:6}}>Unaingiza data ya tarehe: {date} / Entering data for past date: {date}</p>}
      </GlassCard>

      {/* Mode toggle */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <button onClick={()=>setMode("sale")} style={{padding:13,borderRadius:12,border:`2px solid ${mode==="sale"?GR:BORDER}`,background:mode==="sale"?`linear-gradient(135deg,${GR}22,${GR}11)`:"rgba(255,255,255,0.03)",color:mode==="sale"?GR:DIM2,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
          Mauzo / Sales
        </button>
        <button onClick={()=>setMode("cost")} style={{padding:13,borderRadius:12,border:`2px solid ${mode==="cost"?RD:BORDER}`,background:mode==="cost"?`linear-gradient(135deg,${RD}22,${RD}11)`:"rgba(255,255,255,0.03)",color:mode==="cost"?RD:DIM2,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
          Matumizi / Expenses
        </button>
      </div>

      {/* SALE */}
      {mode==="sale"&&(
        <GlassCard style={{padding:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:GR+"99",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Chagua Bidhaa / Select Item</p>
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10,scrollbarWidth:"none",paddingBottom:2}}>
            {sections.map(s=>(
              <button key={s.id} onClick={()=>{setSec(s.id);setItem(null);}} style={{background:sec===s.id?`rgba(0,200,81,0.15)`:"transparent",color:sec===s.id?GR:DIM2,border:`1px solid ${sec===s.id?GR:BORDER}`,borderRadius:99,padding:"5px 11px",whiteSpace:"nowrap",fontFamily:"sans-serif",fontSize:"10px",fontWeight:sec===s.id?700:400,cursor:"pointer",flexShrink:0}}>
                {s.name.sw.split(" ")[0]}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:10}}>
            {secItems.map(it=>{
              const up=prices[it.id]??it.price??(it.sizes?it.sizes[0].price:0);
              const sel=item?.id===it.id;
              return(
                <button key={it.id} onClick={()=>setItem(it)} style={{background:sel?`linear-gradient(135deg,rgba(0,200,81,0.15),rgba(0,200,81,0.05))`:"rgba(255,255,255,0.03)",color:sel?GR:WHITE,border:`1.5px solid ${sel?GR:BORDER}`,borderRadius:10,padding:9,textAlign:"left",cursor:"pointer",boxShadow:sel?`0 0 15px ${GR}22`:"",transition:"all 0.15s"}}>
                  <div style={{fontSize:18,marginBottom:2}}>{it.emoji}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,lineHeight:1.2}}>{it.name.sw}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:"10px",color:sel?GR+"aa":DIM2,marginTop:2}}>{fmt(up)}</div>
                </button>
              );
            })}
          </div>
          {item&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",color:DIM2,fontWeight:700}}>Idadi / Qty:</span>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.06)",color:WHITE,fontWeight:900,fontSize:16,cursor:"pointer"}}>−</button>
                <span style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:WHITE,minWidth:"28px",textAlign:"center"}}>{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.06)",color:WHITE,fontWeight:900,fontSize:16,cursor:"pointer"}}>+</button>
                <span style={{marginLeft:"auto",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:GOLD}}>{fmt((prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0))*qty)}</span>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:10}}>
                {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:`1px solid ${svc===k?GOLD:BORDER}`,background:svc===k?"rgba(212,175,55,0.12)":"transparent",color:svc===k?GOLD:DIM2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
              <button onClick={doSale} disabled={saleBusy} style={{width:"100%",background:saleOk?`linear-gradient(135deg,${GR},#009940)`:saleBusy?"rgba(255,255,255,0.1)":`linear-gradient(135deg,${GR},#009940)`,color:saleBusy?"rgba(255,255,255,0.3)":BG,border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:saleBusy?"default":"pointer",boxShadow:saleBusy?"":`0 6px 24px ${GR}44`,transition:"all 0.3s"}}>
                {saleOk?"✓ Imehifadhiwa! / Saved!":saleBusy?"Inahifadhi...":`SAVE — ${item.name.sw} ×${qty}`}
              </button>
            </div>
          )}
        </GlassCard>
      )}

      {/* COST */}
      {mode==="cost"&&(
        <GlassCard style={{padding:"1rem",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:RD+"99",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Ingiza Matumizi / Record Expense</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            <button onClick={()=>{setCostType("daily");setCat("gas");}} style={{padding:10,borderRadius:10,border:`1.5px solid ${costType==="daily"?BL:BORDER}`,background:costType==="daily"?`rgba(41,121,255,0.12)`:"rgba(255,255,255,0.03)",color:costType==="daily"?BL:DIM2,fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Kila Siku / Daily
            </button>
            <button onClick={()=>{setCostType("bulk");setCat("bulk_ingredients");}} style={{padding:10,borderRadius:10,border:`1.5px solid ${costType==="bulk"?PU:BORDER}`,background:costType==="bulk"?`rgba(156,39,176,0.12)`:"rgba(255,255,255,0.03)",color:costType==="bulk"?PU:DIM2,fontFamily:"sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Manunuzi Makubwa / Bulk
            </button>
          </div>
          <div style={{background:costType==="daily"?`rgba(41,121,255,0.06)`:`rgba(156,39,176,0.06)`,border:`1px solid ${costType==="daily"?BL:PU}22`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontFamily:"sans-serif",fontSize:"10px",color:DIM2}}>
            {costType==="daily"?"Daily: gas, staff wages, small ingredients, rent":"Bulk: large ingredient orders, equipment, marketing"}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {(costType==="daily"?[{k:"gas",l:"Gesi/Gas"},{k:"staff",l:"Staff/Wafanyakazi"},{k:"ingredients",l:"Malighafi/Ingredients"},{k:"rent",l:"Pango/Rent"},{k:"other",l:"Nyingine/Other"}]:[{k:"bulk_ingredients",l:"Jumla/Bulk"},{k:"equipment",l:"Vifaa/Equipment"},{k:"marketing",l:"Matangazo/Marketing"},{k:"bulk_other",l:"Nyingine/Other"}]).map(c=>(
              <button key={c.k} onClick={()=>setCat(c.k)} style={{padding:"7px 8px",borderRadius:8,border:`1px solid ${cat===c.k?GOLD:BORDER}`,background:cat===c.k?"rgba(212,175,55,0.12)":"rgba(255,255,255,0.03)",color:cat===c.k?GOLD:DIM2,fontFamily:"sans-serif",fontSize:"10px",fontWeight:cat===c.k?700:400,cursor:"pointer"}}>{c.l}</button>
            ))}
          </div>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Maelezo / Description (e.g. Mkaa 10kg)" style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Kiasi / Amount (TZS)" style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
          <button onClick={doCost} disabled={costBusy||!amount} style={{width:"100%",background:costOk?`linear-gradient(135deg,${GR},#009940)`:!amount?"rgba(255,255,255,0.06)":`linear-gradient(135deg,${RD},#cc0022)`,color:!amount?DIM2:BG,border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:!amount?"default":"pointer",boxShadow:amount?`0 6px 24px ${RD}44`:"",transition:"all 0.3s"}}>
            {costOk?"✓ Saved!":costBusy?"Saving...":"SAVE EXPENSE"}
          </button>
        </GlassCard>
      )}

      {/* Recent costs for this date — editable */}
      {recentCosts.length>0&&(
        <GlassCard style={{padding:"1rem",marginTop:10}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Gharama za {date} — Tap ✏️ to edit</p>
          {recentCosts.map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={r=>setEditRec(r)} i={i}/>)}
        </GlassCard>
      )}
      {editRec&&<EditModal type="cost" record={editRec} onSave={updateCost} onDelete={deleteCost} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 3: RIPOTI ═══ */
function RipodiTab() {
  const {allSales,allCosts,itemCosts,fetchRange,loading,goals,updateSale,deleteSale,updateCost,deleteCost}=useAdmin();
  const [range,setRange]=useState("today");
  const [cStart,setCStart]=useState(today());
  const [cEnd,setCEnd]=useState(today());
  const [fetched,setFetched]=useState(false);
  const [editRec,setEditRec]=useState(null);
  const [editType,setEditType]=useState("sale");

  function getRangeDates(){
    const t=new Date();const fmt=d=>d.toISOString().split("T")[0];
    if(range==="today")return{start:today(),end:today()};
    if(range==="yesterday"){const y=new Date(t);y.setDate(y.getDate()-1);return{start:fmt(y),end:fmt(y)};}
    if(range==="last7"){const s=new Date(t);s.setDate(s.getDate()-6);return{start:fmt(s),end:fmt(t)};}
    if(range==="month"){const s=new Date(t.getFullYear(),t.getMonth(),1);return{start:fmt(s),end:fmt(t)};}
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

  const byDate=useMemo(()=>{
    const m={};sales.forEach(s=>{if(!m[s.sale_date])m[s.sale_date]={gross:0,count:0};m[s.sale_date].gross+=s.total_price;m[s.sale_date].count+=s.quantity;});
    return Object.entries(m).sort(([a],[b])=>b.localeCompare(a));
  },[sales]);

  async function doFetch(){await fetchRange(start,end);setFetched(true);}

  function sendWhatsApp(){
    const lines=[`RIPOTI — ${start}${start!==end?" hadi "+end:""}`,`Mapato Ghafi: ${fmt(gross)}`,`Gharama za Kila Siku: ${fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}`,`Manunuzi Makubwa: ${fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}`,`Faida Halisi: ${fmt(net)}`,`Jumla ya Mauzo: ${sales.length}`,``,`Unyamwezini Jiko La Bibi JJJ`].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`,"_blank");
  }

  const wkGoalP=range==="last7"&&goals.weekly?pct(gross,goals.weekly):null;
  const moGoalP=range==="month"&&goals.monthly?pct(gross,goals.monthly):null;

  return (
    <div style={{padding:"1rem"}}>
      <GlassCard style={{padding:"1rem",marginBottom:12}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Kipindi / Period</p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:range==="custom"?8:0}}>
          {[["today","Leo"],["yesterday","Jana"],["last7","Wiki 7"],["month","Mwezi"],["custom","Chagua"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setRange(k);setFetched(false);}} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${range===k?GOLD:BORDER}`,background:range===k?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)",color:range===k?GOLD:DIM2,fontFamily:"sans-serif",fontSize:"11px",fontWeight:range===k?700:400,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {range==="custom"&&(
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
            <input type="date" value={cStart} onChange={e=>setCStart(e.target.value)} style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:12,color:WHITE,outline:"none"}}/>
            <span style={{color:DIM2,fontSize:"11px"}}>—</span>
            <input type="date" value={cEnd} onChange={e=>setCEnd(e.target.value)} style={{flex:1,padding:"7px 10px",borderRadius:8,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:12,color:WHITE,outline:"none"}}/>
          </div>
        )}
        <button onClick={doFetch} disabled={loading} style={{marginTop:8,width:"100%",background:`linear-gradient(135deg,#0B1E3A,#142840)`,color:GOLD,border:`1px solid ${GOLD}44`,borderRadius:10,padding:"9px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
          {loading?"Inapakia...":"Pata Ripoti / Get Report"}
        </button>
      </GlassCard>

      {(fetched||range==="today")&&(
        <>
          <GlassCard glow style={{padding:"1.2rem",marginBottom:12}}>
            <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Muhtasari wa Fedha / Financial Summary</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <StatChip label="Mapato Ghafi" value={fmt(gross)} color={GOLD} icon="💰"/>
              <StatChip label="Faida Halisi" value={fmt(net)} color={net>=0?GR:RD} icon={net>=0?"📈":"📉"}/>
              <StatChip label="Gharama Yote" value={fmt(overhead)} color={RD} icon="💸"/>
              <StatChip label="Mauzo" value={sales.length} color={BL} icon="🧾"/>
            </div>
          </GlassCard>

          {(wkGoalP!==null||moGoalP!==null)&&(
            <GlassCard style={{padding:"1rem",marginBottom:12}}>
              {wkGoalP!==null&&<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:WHITE,fontWeight:700}}>Lengo la Wiki / Weekly Goal</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:GOLD}}>{fmt(gross)} / {fmt(goals.weekly)}</span></div><NeonBar value={gross} max={goals.weekly} color={BL}/></div>}
              {moGoalP!==null&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:WHITE,fontWeight:700}}>Lengo la Mwezi / Monthly Goal</span><span style={{fontFamily:"sans-serif",fontSize:"11px",color:GOLD}}>{fmt(gross)} / {fmt(goals.monthly)}</span></div><NeonBar value={gross} max={goals.monthly} color={GR}/></div>}
            </GlassCard>
          )}

          {/* Sales list — editable */}
          {sales.length>0&&(
            <GlassCard style={{padding:"1rem",marginBottom:12}}>
              <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Mauzo / Sales ({sales.length}) — Tap ✏️ to edit</p>
              {sales.slice(0,20).map((s,i)=><SaleRow key={s.id||i} sale={s} onEdit={r=>{setEditRec(r);setEditType("sale");}} i={i}/>)}
            </GlassCard>
          )}

          {/* Costs — editable */}
          {costs.length>0&&(
            <GlassCard style={{padding:"1rem",marginBottom:12}}>
              <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Gharama / Expenses ({costs.length}) — Tap ✏️ to edit</p>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",color:WHITE}}>Kila Siku / Daily</span>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:BL}}>{fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",color:WHITE}}>Jumla / Bulk</span>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:PU}}>{fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}</span>
              </div>
              {costs.slice(0,15).map((c,i)=><CostRow key={c.id||i} cost={c} onEdit={r=>{setEditRec(r);setEditType("cost");}} i={i}/>)}
            </GlassCard>
          )}

          {/* Daily breakdown */}
          {byDate.length>1&&(
            <GlassCard style={{padding:"1rem",marginBottom:12}}>
              <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Kwa Siku / By Day</p>
              {byDate.map(([d,v])=>(
                <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${BORDER}44`}}>
                  <span style={{fontFamily:"sans-serif",fontSize:"12px",color:WHITE}}>{d}</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:GOLD}}>{fmt(v.gross)}</span>
                    <span style={{fontFamily:"sans-serif",fontSize:"10px",color:DIM2,marginLeft:6}}>{v.count} bidhaa</span>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          <button onClick={sendWhatsApp} style={{width:"100%",background:"rgba(37,211,102,0.12)",color:"#25d366",border:`1px solid rgba(37,211,102,0.3)`,borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            Tuma Ripoti WhatsApp / Send Report
          </button>
        </>
      )}
      {editRec&&<EditModal type={editType} record={editRec} onSave={editType==="sale"?updateSale:updateCost} onDelete={editType==="sale"?deleteSale:deleteCost} onClose={()=>setEditRec(null)}/>}
    </div>
  );
}

/* ═══ TAB 4: MALENGO ═══ */
function MalengoTab() {
  const {goals,setGoal,todayGross,allSales,goals:g}=useAdmin();
  const [dv,setDv]=useState(String(goals.daily||""));
  const [wv,setWv]=useState(String(goals.weekly||""));
  const [mv,setMv]=useState(String(goals.monthly||""));
  const [saved,setSaved]=useState(false);
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  const monthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkGross=allSales.filter(s=>s.sale_date>=weekStart.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);
  const moGross=allSales.filter(s=>s.sale_date>=monthStart.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);
  function saveAll(){if(dv)setGoal("daily",dv);if(wv)setGoal("weekly",wv);if(mv)setGoal("monthly",mv);setSaved(true);setTimeout(()=>setSaved(false),2000);}

  return (
    <div style={{padding:"1rem"}}>
      {(goals.daily||goals.weekly||goals.monthly)>0&&(
        <GlassCard glow style={{padding:"1.4rem",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 16px"}}>Maendeleo ya Sasa / Current Progress</p>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {goals.daily>0&&<GoalRing label="Leo/Today" current={todayGross} goal={goals.daily} color={GOLD} size={80}/>}
            {goals.weekly>0&&<GoalRing label="Wiki/Week" current={wkGross} goal={goals.weekly} color={BL} size={80}/>}
            {goals.monthly>0&&<GoalRing label="Mwezi/Month" current={moGross} goal={goals.monthly} color={GR} size={80}/>}
          </div>
        </GlassCard>
      )}

      <GlassCard style={{padding:"1.2rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 16px"}}>Weka Malengo / Set Goals</p>
        {[[GOLD,"Lengo la Kila Siku / Daily Goal",dv,setDv,"Mfano: 100,000 TZS kwa siku"],[BL,"Lengo la Wiki / Weekly Goal",wv,setWv,"Mfano: 700,000 TZS kwa wiki"],[GR,"Lengo la Mwezi / Monthly Goal",mv,setMv,"Mfano: 3,000,000 TZS kwa mwezi"]].map(([color,label,val,setter,hint])=>(
          <div key={label} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>
              <label style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color}}>{label}</label>
            </div>
            <input type="number" value={val} onChange={e=>setter(e.target.value)} placeholder={hint} style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`2px solid ${color}33`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box"}}/>
            {val&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color,margin:"3px 0 0",opacity:0.8}}>{fmt(val)}</p>}
          </div>
        ))}
        <button onClick={saveAll} style={{width:"100%",background:saved?`linear-gradient(135deg,${GR},#009940)`:`linear-gradient(135deg,${GOLD},#a07010)`,color:BG,border:"none",borderRadius:12,padding:13,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 24px ${GOLD}44`,transition:"all 0.3s"}}>
          {saved?"✓ Imehifadhiwa! / Saved!":"Hifadhi Malengo / Save Goals"}
        </button>
      </GlassCard>
    </div>
  );
}

/* ═══ TAB 5: AKILI ═══ */
function AkiliTab() {
  const {allSales,allCosts,itemCosts}=useAdmin();
  const [loaded,setLoaded]=useState(false);
  const {fetchRange}=useAdmin();
  useEffect(()=>{if(!loaded){fetchRange(new Date(Date.now()-30*86400000).toISOString().split("T")[0],today());setLoaded(true);};},[]);
  const s30=allSales.filter(s=>s.sale_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const c30=allCosts.filter(c=>c.cost_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const gross=s30.reduce((s,r)=>s+r.total_price,0);
  const costs=c30.reduce((s,c)=>s+c.amount,0);
  const net=gross-costs;
  const margin=gross?Math.round(net/gross*100):0;
  const itemStats=useMemo(()=>{
    const m={};s30.forEach(s=>{if(!m[s.item_id])m[s.item_id]={id:s.item_id,name:s.item_name,qty:0,rev:0,cost:0};m[s.item_id].qty+=s.quantity;m[s.item_id].rev+=s.total_price;m[s.item_id].cost+=(itemCosts[s.item_id]||0)*s.quantity;});
    return Object.values(m).map(i=>({...i,profit:i.rev-i.cost,margin:i.rev?Math.round((i.rev-i.cost)/i.rev*100):0})).sort((a,b)=>b.rev-a.rev);
  },[s30,itemCosts]);
  const dailyRev=useMemo(()=>{const m={};s30.forEach(s=>{m[s.sale_date]=(m[s.sale_date]||0)+s.total_price;});return Object.entries(m).sort(([a],[b])=>a.localeCompare(b)).slice(-14);},[s30]);
  const maxRev=Math.max(...dailyRev.map(([,v])=>v),1);
  const svcMap=useMemo(()=>{const m={pickup:0,delivery:0,dinein:0};s30.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});return m;},[s30]);
  const health=Math.min(100,Math.max(0,50+(margin/100*30)+(itemStats.length>5?10:0)+(gross>500000?10:0)));
  const hc=health>=70?GR:health>=40?GOLD:RD;
  const insights=[];
  itemStats.filter(i=>i.margin<0&&i.qty>0).slice(0,2).forEach(i=>insights.push({t:"danger",msg:`${i.name} — losing money (margin ${i.margin}%). Raise price or stop selling.`}));
  itemStats.filter(i=>i.margin>40&&i.qty>3).slice(0,2).forEach(i=>insights.push({t:"good",msg:`${i.name} is your star product (${i.margin}% margin). Promote it more!`}));
  if(costs>gross*0.6&&gross>0)insights.push({t:"warn",msg:`Expenses are ${Math.round(costs/gross*100)}% of revenue. Reduce costs to increase profit.`});
  if(svcMap.delivery<svcMap.pickup*0.15&&gross>0)insights.push({t:"info",msg:"Delivery is very low. Promote delivery service to reach more customers."});
  if(!Object.keys(itemCosts).length)insights.push({t:"info",msg:"Set item cooking costs in Menu tab to see true profit margins."});
  return (
    <div style={{padding:"1rem"}}>
      <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Uchambuzi / Analytics — Last 30 Days</p>
      <GlassCard glow style={{padding:"1.2rem",marginBottom:12,display:"flex",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
          <svg width={72} height={72} style={{transform:"rotate(-90deg)"}}>
            <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
            <circle cx={36} cy={36} r={28} fill="none" stroke={hc} strokeWidth={8} strokeDasharray={`${health*1.76} 176`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 8px ${hc}88)`}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:900,color:hc}}>{Math.round(health)}</span>
          </div>
        </div>
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 3px"}}>Afya ya Biashara / Business Health</p>
          <p style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:900,color:hc,margin:"0 0 3px"}}>{health>=70?"Nzuri Sana / Excellent":health>=40?"Wastani / Average":"Hatarini / At Risk"}</p>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",color:DIM2,margin:0}}>Gross: {fmt(gross)} · Net: {fmt(net)} · Margin: {margin}%</p>
        </div>
      </GlassCard>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <StatChip label="Mapato Ghafi" value={fmt(gross)} color={GOLD} icon="💰"/>
        <StatChip label="Faida Halisi" value={fmt(net)} color={net>=0?GR:RD} icon="📊"/>
        <StatChip label="Margin %" value={margin+"%"} color={margin>25?GR:margin>0?GOLD:RD} icon="🎯"/>
        <StatChip label="Mauzo" value={s30.length} color={BL} icon="🧾"/>
      </div>

      {dailyRev.length>2&&(
        <GlassCard style={{padding:"1rem",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Trend / Revenue Trend (14 Days)</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:70}}>
            {dailyRev.map(([d,v])=>(
              <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",background:`linear-gradient(180deg,${GOLD},${GOLD}88)`,borderRadius:"3px 3px 0 0",height:Math.max(3,pct(v,maxRev)*0.68)+"px",boxShadow:`0 0 6px ${GOLD}44`,transition:"height 0.5s"}}/>
                <span style={{fontFamily:"sans-serif",fontSize:"7px",color:DIM2}}>{d.slice(8)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {itemStats.length>0&&(
        <GlassCard style={{padding:"1rem",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Bidhaa Bora / Top Items</p>
          {itemStats.slice(0,5).map((item,i)=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:900,color:i===0?GOLD:DIM2,width:18,flexShrink:0}}>{i+1}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:WHITE,marginBottom:3}}>{item.name}</div>
                <NeonBar value={item.rev} max={itemStats[0].rev} color={i===0?GOLD:BL} height={4}/>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:WHITE}}>{fmt(item.rev)}</div>
                {item.margin!==0&&<span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:item.margin>0?GR:RD}}>{item.margin}%</span>}
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      {gross>0&&(
        <GlassCard style={{padding:"1rem",marginBottom:12}}>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Aina ya Huduma / Service Mix</p>
          {[["Kuchukua/Pickup",svcMap.pickup,BL],["Delivery",svcMap.delivery,GR],["Kula Hapa/Dine-in",svcMap.dinein,PU]].map(([l,v,c])=>v>0&&(
            <div key={l} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:WHITE}}>{l}</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:c}}>{fmt(v)}</span></div>
              <NeonBar value={v} max={gross} color={c}/>
            </div>
          ))}
        </GlassCard>
      )}

      {insights.length>0&&(
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:DIM2,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Ushauri / Business Insights</p>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:ins.t==="good"?`rgba(0,200,81,0.08)`:ins.t==="danger"?`rgba(255,61,87,0.08)`:ins.t==="warn"?`rgba(212,175,55,0.08)`:`rgba(41,121,255,0.08)`,borderLeft:`3px solid ${ins.t==="good"?GR:ins.t==="danger"?RD:ins.t==="warn"?GOLD:BL}`,borderRadius:"0 10px 10px 0",padding:"9px 13px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:WHITE,lineHeight:1.5}}>{ins.msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ MENU TAB ═══ */
function MenuTab() {
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost}=useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [ced,setCed]=useState(null);const [cv,setCv]=useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=>(
        <div key={sec.id} style={{marginBottom:14}}>
          <div style={{background:`linear-gradient(135deg,${BG3},${BG2})`,borderRadius:"12px 12px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10,border:`1px solid ${BORDER}`,borderBottom:"none"}}>
            <div style={{background:`linear-gradient(135deg,${GOLD},#a07010)`,color:BG,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
            <span style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:700,color:GOLD}}>{sec.name.sw}</span>
          </div>
          <div style={{border:`1px solid ${BORDER}`,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
            {menu.filter(m=>m.section===sec.id).map((item,i)=>{
              const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
              const cost=itemCosts[item.id];const oos=!!stock[item.id];
              return(
                <div key={item.id} style={{padding:"10px 14px",background:i%2===0?"rgba(255,255,255,0.025)":"rgba(255,255,255,0.015)",borderTop:i>0?`1px solid ${BORDER}44`:"none",opacity:oos?0.5:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{item.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:WHITE,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
                      {oos&&<span style={{fontFamily:"sans-serif",fontSize:10,color:RD,fontWeight:700}}>OUT OF STOCK</span>}
                    </div>
                    {ed===item.id?(
                      <div style={{display:"flex",gap:4}}>
                        <input type="number" value={val} onChange={e=>setVal(e.target.value)} autoFocus style={{width:72,padding:"4px 6px",borderRadius:6,border:`2px solid ${GOLD}`,background:"rgba(255,255,255,0.08)",fontFamily:"sans-serif",fontSize:12,color:WHITE,outline:"none"}}/>
                        <button onClick={()=>{overridePrice(item.id,parseInt(val));setEd(null);}} style={{background:`linear-gradient(135deg,${GR},#009940)`,color:BG,border:"none",borderRadius:6,padding:"4px 9px",fontSize:12,cursor:"pointer",fontWeight:700}}>OK</button>
                        <button onClick={()=>setEd(null)} style={{background:"rgba(255,255,255,0.08)",color:DIM2,border:"none",borderRadius:6,padding:"4px 7px",fontSize:12,cursor:"pointer"}}>✕</button>
                      </div>
                    ):(
                      <button onClick={()=>{setEd(item.id);setVal(String(cur));}} style={{background:"rgba(212,175,55,0.1)",border:`1px solid ${GOLD}44`,borderRadius:6,padding:"3px 9px",fontFamily:"sans-serif",fontSize:11,fontWeight:700,color:prices[item.id]!==undefined?GR:GOLD,cursor:"pointer"}}>{fmt(cur)}</button>
                    )}
                    <button onClick={()=>toggleStock(item.id)} style={{background:oos?`rgba(255,61,87,0.2)`:`rgba(0,200,81,0.12)`,color:oos?RD:GR,border:`1px solid ${oos?RD:GR}44`,borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA":"IPO"}</button>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26,marginTop:4}}>
                    <span style={{fontFamily:"sans-serif",fontSize:9,color:DIM2}}>Cost/unit:</span>
                    {ced===item.id?(
                      <div style={{display:"flex",gap:4}}>
                        <input type="number" value={cv} onChange={e=>setCv(e.target.value)} autoFocus placeholder="0" style={{width:62,padding:"2px 6px",borderRadius:4,border:`1px solid ${GOLD}`,background:"rgba(255,255,255,0.08)",fontFamily:"sans-serif",fontSize:11,color:WHITE,outline:"none"}}/>
                        <button onClick={()=>{setCost(item.id,parseInt(cv));setCed(null);}} style={{background:GR,color:BG,border:"none",borderRadius:4,padding:"2px 7px",fontSize:11,cursor:"pointer",fontWeight:700}}>OK</button>
                      </div>
                    ):(
                      <button onClick={()=>{setCed(item.id);setCv(String(cost||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:10,color:cost?GR:DIM2,cursor:"pointer",padding:0}}>{cost?fmt(cost):"Set cost"}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══ ORDERS TAB ═══ */
function MaagizoTab() {
  const {orders,addOrder,updateOrderStatus}=useAdmin();
  const [show,setShow]=useState(false);
  const [f,setF]=useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  const td=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
  return(
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[["Leo/All",td.length,GOLD],["Inasubiri/Pending",td.filter(o=>o.status==="pending").length,RD],["Imekamilika/Done",td.filter(o=>o.status==="done").length,GR]].map(([l,v,c])=>(
          <StatChip key={l} label={l} value={v} color={c}/>
        ))}
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:`linear-gradient(135deg,${BG3},${BG2})`,color:GOLD,border:`1px solid ${GOLD}44`,borderRadius:12,padding:12,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12}}>
        {show?"✕ Funga / Close":"+ Agizo Jipya / New Order"}
      </button>
      {show&&(
        <GlassCard style={{padding:"1rem",marginBottom:12}}>
          {[["customer","Jina / Name *",""],["phone","Simu / Phone","07xx"],["items","Chakula / Items *","Pilau x2"],["total","Jumla / Total (TZS)","10000"]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:8}}>
              <label style={{display:"block",fontSize:"10px",fontFamily:"sans-serif",fontWeight:700,color:DIM2,marginBottom:3,textTransform:"uppercase"}}>{l}</label>
              <input value={f[k]} onChange={set(k)} placeholder={p} style={{width:"100%",padding:"9px 11px",borderRadius:9,border:`1px solid ${BORDER}`,background:"rgba(255,255,255,0.05)",fontFamily:"sans-serif",fontSize:13,color:WHITE,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
          <select value={f.service} onChange={set("service")} style={{width:"100%",padding:9,borderRadius:9,border:`1px solid ${BORDER}`,background:BG2,fontFamily:"sans-serif",fontSize:13,color:WHITE,marginBottom:10}}>
            <option value="pickup">Kuchukua / Pickup</option><option value="delivery">Delivery</option><option value="dinein">Kula Hapa / Dine-in</option><option value="events">Sherehe / Events</option>
          </select>
          <button onClick={save} style={{width:"100%",background:`linear-gradient(135deg,${GR},#009940)`,color:BG,border:"none",borderRadius:10,padding:11,fontFamily:"sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>Hifadhi / Save</button>
        </GlassCard>
      )}
      {td.map(o=>(
        <GlassCard key={o.id} style={{padding:"12px 14px",marginBottom:8,borderLeft:`3px solid ${o.status==="done"?GR:GOLD}`,opacity:o.status==="done"?0.65:1,display:"flex",gap:8,alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:WHITE}}>{o.customer}</div>
            <div style={{fontFamily:"sans-serif",fontSize:11,color:DIM2,marginTop:1}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})} · {o.service}{o.phone?` · ${o.phone}`:""}</div>
            <div style={{fontFamily:"sans-serif",fontSize:12,color:DIM,marginTop:4}}>{o.items}</div>
            {o.total>0&&<div style={{fontFamily:"sans-serif",fontSize:13,fontWeight:700,color:GOLD,marginTop:4}}>{fmt(o.total)}</div>}
          </div>
          <button onClick={()=>updateOrderStatus(o.id,o.status==="done"?"pending":"done")} style={{background:o.status==="done"?"rgba(255,255,255,0.06)":`linear-gradient(135deg,${GR},#009940)`,color:o.status==="done"?DIM2:BG,border:"none",borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>
            {o.status==="done"?"✓ Done":"Maliza / Done"}
          </button>
        </GlassCard>
      ))}
      {td.length===0&&<p style={{textAlign:"center",padding:"2rem",color:DIM2,fontFamily:"sans-serif",fontSize:13}}>Hakuna maagizo leo / No orders yet today.</p>}
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function AdminPage({onExit}) {
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
  if(!authed)return <PinGate onAuth={()=>setAuthed(true)}/>;

  const TABS=[
    {key:"leo",    icon:"ti-home",             label:"Leo",     sub:"Today"},
    {key:"ingiza", icon:"ti-plus",             label:"Ingiza",  sub:"Input"},
    {key:"ripoti", icon:"ti-chart-bar",        label:"Ripoti",  sub:"Reports"},
    {key:"malengo",icon:"ti-target",           label:"Malengo", sub:"Goals"},
    {key:"akili",  icon:"ti-brain",            label:"Akili",   sub:"Analytics"},
    {key:"menu",   icon:"ti-tools-kitchen-2",  label:"Menyu",   sub:"Menu"},
    {key:"maagizo",icon:"ti-clipboard-list",   label:"Maagizo", sub:"Orders"},
  ];

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 20% 0%,#0d1f3c 0%,${BG} 50%),radial-gradient(ellipse at 80% 100%,#1a0a00 0%,${BG} 50%)`,paddingBottom:80}}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Header */}
      <div style={{background:"rgba(7,20,40,0.95)",backdropFilter:"blur(20px)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,borderBottom:`1px solid ${BORDER}`}}>
        <button onClick={onExit} style={{background:"none",border:"none",color:DIM2,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,display:"flex",alignItems:"center",gap:6}}><i className="ti ti-arrow-left"/> Rudi / Back</button>
        <span style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,background:`linear-gradient(135deg,${GOLD},${GOLD2})`,backgroundSize:"300% auto",-webkitBackgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite"}}>Msimamizi 🔐</span>
        <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:DIM2,cursor:"pointer",fontFamily:"sans-serif",fontSize:11}}>Toka / Exit</button>
      </div>

      {/* Tab bar */}
      <div style={{background:"rgba(7,20,40,0.9)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${BORDER}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",position:"sticky",top:49,zIndex:39}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:"0 0 auto",padding:"9px 10px",border:"none",background:"none",cursor:"pointer",borderBottom:tab===t.key?`2px solid ${GOLD}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:52,transition:"all 0.2s"}}>
            <i className={`ti ${t.icon}`} style={{fontSize:17,color:tab===t.key?GOLD:DIM2}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"8px",fontWeight:700,color:tab===t.key?GOLD:DIM2,whiteSpace:"nowrap"}}>{t.label}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"7px",color:tab===t.key?GOLD+"88":DIM2+"66",whiteSpace:"nowrap"}}>{t.sub}</span>
          </button>
        ))}
      </div>

      {tab==="leo"    &&<LeoTab onGoTo={setTab}/>}
      {tab==="ingiza" &&<IngizaTab/>}
      {tab==="ripoti" &&<RipodiTab/>}
      {tab==="malengo"&&<MalengoTab/>}
      {tab==="akili"  &&<AkiliTab/>}
      {tab==="menu"   &&<MenuTab/>}
      {tab==="maagizo"&&<MaagizoTab/>}
    </div>
  );
}
