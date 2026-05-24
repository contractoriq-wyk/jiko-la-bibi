import { useState, useMemo, useEffect } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

const G="#D4AF37",N="#0B1F45",N2="#06132E",GR="#1B6B20",R="#C62828",BL="#1565C0";
const fmt = n => "TZS "+Number(n||0).toLocaleString();
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
const today = () => new Date().toISOString().split("T")[0];

const DAILY_CATS = [
  {k:"gas",      l:"Gesi/Mkaa / Gas/Charcoal",    icon:"ti-flame"},
  {k:"staff",    l:"Wafanyakazi / Staff Wages",  icon:"ti-users"},
  {k:"ingredients",l:"Malighafi / Ingredients", icon:"ti-shopping-cart"},
  {k:"rent",     l:"Pango / Rent",        icon:"ti-building"},
  {k:"other",    l:"Nyingine / Other",     icon:"ti-dots"},
];
const BULK_CATS = [
  {k:"bulk_ingredients",l:"Malighafi ya Jumla / Bulk Ingredients", icon:"ti-packages"},
  {k:"equipment",       l:"Vifaa/Zana / Equipment",         icon:"ti-tools"},
  {k:"marketing",       l:"Matangazo / Marketing",           icon:"ti-speakerphone"},
  {k:"bulk_other",      l:"Nyingine (Jumla) / Other (Bulk)",    icon:"ti-dots"},
];

function Badge({children,color=N,bg="rgba(11,31,69,0.08)"}) {
  return <span style={{background:bg,color,borderRadius:99,padding:"2px 8px",fontFamily:"sans-serif",fontSize:"10px",fontWeight:700}}>{children}</span>;
}
function Pill({label,active,onClick,color=N}) {
  return <button onClick={onClick} style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${active?color:"rgba(11,31,69,0.15)"}`,background:active?color:"transparent",color:active?"#fff":"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"11px",fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>;
}
function GoalBar({label,current,goal,color=G}) {
  const p = goal ? Math.min(100,pct(current,goal)) : 0;
  const over = goal && current > goal;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontFamily:"sans-serif",fontSize:"11px",color:N,fontWeight:700}}>{label}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"11px",color:over?GR:N}}>{fmt(current)} / {fmt(goal||"---")}</span>
      </div>
      <div style={{height:8,background:"rgba(11,31,69,0.08)",borderRadius:4}}>
        <div style={{height:"100%",width:p+"%",background:over?GR:color,borderRadius:4,transition:"width 0.5s"}}/>
      </div>
      <div style={{fontFamily:"sans-serif",fontSize:"10px",color:over?GR:"rgba(11,31,69,0.4)",marginTop:2,textAlign:"right"}}>{over?"Lengo limefikiwa! "+p+"%":p+"%"}</div>
    </div>
  );
}

/* ════ PIN GATE ════ */
function PinGate({onAuth}) {
  const [pin,setPin]=useState(""), [err,setErr]=useState(false);
  const PAD=["1","2","3","4","5","6","7","8","9","","0","⌫"];
  function tap(k){
    if(k==="")return; if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}
    const next=pin+k; setPin(next);
    if(next.length===4){if(next===(business.adminPin||"5566"))onAuth();else{setErr(true);setPin("");setTimeout(()=>setErr(false),1400);}}
  }
  return (
    <div style={{minHeight:"100vh",background:N2,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <img src="/logo.png" alt="" width={80} height={80} style={{borderRadius:"50%",border:`3px solid ${G}`,objectFit:"cover",marginBottom:"1rem"}} onError={e=>e.target.style.display="none"}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:"#FDF5E4",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(253,245,228,0.5)",fontSize:"12px",fontFamily:"sans-serif",margin:"0 0 1.8rem"}}>Eneo la Msimamizi — Weka PIN</p>
      <div style={{display:"flex",gap:"12px",marginBottom:"1.2rem"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?G:"rgba(253,245,228,0.2)",border:`2px solid ${pin.length>i?G:"rgba(253,245,228,0.3)"}`,transition:"all 0.15s"}}/>)}
      </div>
      {err&&<p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>PIN si sahihi. Jaribu tena.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:"10px"}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:"12px",fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":"rgba(253,245,228,0.08)",color:k==="⌫"?"rgba(253,245,228,0.5)":"#FDF5E4",border:k===""?"none":"1px solid rgba(253,245,228,0.12)",cursor:k===""?"default":"pointer"}}>{k}</button>)}
      </div>
    </div>
  );
}

/* ════ TAB 1: LEO (TODAY DASHBOARD) ════ */
function LeoTab({onGoTo}) {
  const {todaySales,todayGross,todayNet,todayOverhead,goals,allCosts}=useAdmin();
  const td=today();
  const weekStart=new Date(); weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  const monthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkSales=useMemo(()=>todaySales,[todaySales]);
  const h=new Date().getHours();
  const tips=[];
  if(todayGross===0&&h>9) tips.push({c:"warn",msg:"Hakuna mauzo bado leo. Hakikisha menyu iko tayari!"});
  if(goals.daily&&todayGross>=goals.daily) tips.push({c:"good",msg:"Hongera! Umefika lengo la leo."});
  if(goals.daily&&todayGross<goals.daily*0.5&&h>14) tips.push({c:"warn",msg:"Mauzo chini ya nusu ya lengo. Fikiria promotion ya jioni."});
  if(todayOverhead>todayGross*0.5&&todayGross>0) tips.push({c:"danger",msg:"Gharama ni zaidi ya nusu ya mapato leo. Kagua matumizi."});
  return (
    <div style={{padding:"1rem"}}>
      {/* Revenue Hero */}
      <div style={{background:N,borderRadius:14,padding:"1.2rem",marginBottom:"1rem",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(to right,${todayNet&&todayNet>0?GR:R},${G})`}}/>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"1.5px"}}>Mapato ya Leo / Today's Revenue — {td}</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"40px",fontWeight:900,color:G,margin:"0",lineHeight:1}}>{fmt(todayGross)}</p>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:8}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(253,245,228,0.4)",textTransform:"uppercase"}}>Gharama / Costs</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:R}}>{fmt(todayOverhead)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(253,245,228,0.4)",textTransform:"uppercase"}}>Faida / Profit</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:todayNet===null?"rgba(253,245,228,0.3)":todayNet>=0?GR:R}}>{todayNet===null?"--":fmt(todayNet)}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(253,245,228,0.4)",textTransform:"uppercase"}}>Mauzo / Sales</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:"#FDF5E4"}}>{todaySales.length}</div>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      {(goals.daily||goals.weekly||goals.monthly)>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Maendeleo ya Malengo</p>
          {goals.daily>0&&<GoalBar label="Leo / Today" current={todayGross} goal={goals.daily}/>}
        </div>
      )}

      {/* Tips */}
      {tips.map((t,i)=>(
        <div key={i} style={{background:t.c==="good"?"rgba(27,107,32,0.06)":t.c==="danger"?"rgba(198,40,40,0.06)":"rgba(212,175,55,0.08)",borderLeft:`3px solid ${t.c==="good"?GR:t.c==="danger"?R:G}`,borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:N}}>{t.msg}</div>
      ))}

      {/* Quick actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
        <button onClick={()=>onGoTo("ingiza")} style={{background:GR,color:"#fff",border:"none",borderRadius:10,padding:"12px 8px",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-plus"/>Rekodi Mauzo
            Record Sale
        </button>
        <button onClick={()=>onGoTo("matumizi")} style={{background:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 8px",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-minus"/>Rekodi Matumizi
            Record Expense
        </button>
      </div>

      {/* Today's sales log */}
      {todaySales.length>0&&(
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Mauzo ya Leo ({todaySales.length})</p>
          {todaySales.slice(0,10).map((s,i)=>(
            <div key={s.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderRadius:8,marginBottom:4}}>
              <div>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{s.item_name}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)",marginLeft:5}}>x{s.quantity}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:G}}>{fmt(s.total_price)}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.35)"}}>{new Date(s.created_at).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════ TAB 2: INGIZA (INPUT DATA) ════ */
function IngizaTab() {
  const {prices,recordSale,recordCost}=useAdmin();
  const [mode,setMode]=useState("sale"); // "sale" or "cost"
  const [date,setDate]=useState(today());
  // Sale state
  const [sec,setSec]=useState(sections[0].id);
  const [item,setItem]=useState(null);
  const [qty,setQty]=useState(1);
  const [svc,setSvc]=useState("pickup");
  const [saleBusy,setSaleBusy]=useState(false);
  const [saleSuccess,setSaleSuccess]=useState(false);
  // Cost state
  const [costType,setCostType]=useState("daily"); // daily or bulk
  const [cat,setCat]=useState("gas");
  const [desc,setDesc]=useState("");
  const [amount,setAmount]=useState("");
  const [costBusy,setCostBusy]=useState(false);
  const [costSuccess,setCostSuccess]=useState(false);

  const secItems=menu.filter(m=>m.section===sec);
  const currentCats=costType==="daily"?DAILY_CATS:BULK_CATS;

  async function doSale(){
    if(!item||saleBusy)return; setSaleBusy(true);
    await recordSale(item,qty,svc,date);
    setItem(null); setQty(1); setSaleBusy(false); setSaleSuccess(true);
    setTimeout(()=>setSaleSuccess(false),2000);
  }
  async function doCost(){
    if(!amount||costBusy)return; setCostBusy(true);
    await recordCost(cat,desc,amount,date,costType);
    setAmount(""); setDesc(""); setCostBusy(false); setCostSuccess(true);
    setTimeout(()=>setCostSuccess(false),2000);
  }

  const isToday=date===today();
  const dateLabel=isToday?"Leo":date;

  return (
    <div style={{padding:"1rem"}}>
      {/* Header */}
      <div style={{background:N,borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Tarehe ya Kuingiza Data</p>
        <p style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(253,245,228,0.35)",margin:"0 0 8px"}}>Select the date you want to enter data for</p>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`2px solid ${G}`,fontFamily:"sans-serif",fontSize:"14px",color:N,outline:"none",boxSizing:"border-box",fontWeight:700}}/>
        {!isToday&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color:G,marginTop:6,textAlign:"center"}}>Unaingiza data ya tarehe iliyopita: {date}</p>}
      </div>

      {/* Mode toggle */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:"1rem"}}>
        <button onClick={()=>setMode("sale")} style={{padding:"12px",borderRadius:10,border:`2px solid ${mode==="sale"?GR:"rgba(11,31,69,0.15)"}`,background:mode==="sale"?GR:"#fff",color:mode==="sale"?"#fff":N,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-currency-dollar"/><span>Mauzo<br/><span style={{fontSize:10,opacity:0.8}}>Sales</span></span>
        </button>
        <button onClick={()=>setMode("cost")} style={{padding:"12px",borderRadius:10,border:`2px solid ${mode==="cost"?R:"rgba(11,31,69,0.15)"}`,background:mode==="cost"?R:"#fff",color:mode==="cost"?"#fff":N,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <i className="ti ti-minus"/><span>Matumizi<br/><span style={{fontSize:10,opacity:0.8}}>Expenses</span></span>
        </button>
      </div>

      {/* SALE INPUT */}
      {mode==="sale"&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Chagua Bidhaa / Select Item — {dateLabel}</p>
          {/* Section pills */}
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10,scrollbarWidth:"none",paddingBottom:2}}>
            {sections.map(s=><Pill key={s.id} label={s.name.sw.split(" ")[0]} active={sec===s.id} onClick={()=>{setSec(s.id);setItem(null);}}/> )}
          </div>
          {/* Items */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:10}}>
            {secItems.map(it=>{
              const up=prices[it.id]??it.price??(it.sizes?it.sizes[0].price:0);
              return(
                <button key={it.id} onClick={()=>setItem(it)} style={{background:item?.id===it.id?N:"rgba(11,31,69,0.04)",color:item?.id===it.id?G:N,border:`1.5px solid ${item?.id===it.id?N:"rgba(11,31,69,0.12)"}`,borderRadius:8,padding:8,textAlign:"left",cursor:"pointer"}}>
                  <div style={{fontSize:18,marginBottom:2}}>{it.emoji}</div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:"11px",fontWeight:700,lineHeight:1.2}}>{it.name.sw}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:"10px",color:item?.id===it.id?"rgba(212,175,55,0.8)":"rgba(11,31,69,0.4)",marginTop:2}}>{fmt(up)}</div>
                </button>
              );
            })}
          </div>
          {item&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>Idadi:</span>
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(11,31,69,0.2)",background:"#fff",fontWeight:900,fontSize:16,cursor:"pointer"}}>-</button>
                <span style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:N,minWidth:"24px",textAlign:"center"}}>{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(11,31,69,0.2)",background:"#fff",fontWeight:900,fontSize:16,cursor:"pointer"}}>+</button>
                <span style={{marginLeft:"auto",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:G}}>= {fmt((prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0))*qty)}</span>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:10}}>
                {[["pickup","Kuchukua / Pickup"],["delivery","Delivery"],["dinein","Kula Hapa / Dine-in"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"5px 4px",borderRadius:6,border:`1px solid ${svc===k?N:"rgba(11,31,69,0.15)"}`,background:svc===k?N:"transparent",color:svc===k?G:"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
              <button onClick={doSale} disabled={saleBusy} style={{width:"100%",background:saleSuccess?"#4caf50":saleBusy?"rgba(11,31,69,0.3)":GR,color:"#fff",border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:saleBusy?"default":"pointer",transition:"background 0.3s"}}>
                {saleSuccess?"Imehifadhiwa! / Saved!":saleBusy?"Inahifadhi...":` HIFADHI — ${item.name.sw} x${qty} — ${dateLabel}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* COST INPUT */}
      {mode==="cost"&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Ingiza Matumizi — {dateLabel}</p>

          {/* Daily vs Bulk */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
            <button onClick={()=>{setCostType("daily");setCat("gas");}} style={{padding:"9px",borderRadius:8,border:`1.5px solid ${costType==="daily"?BL:"rgba(11,31,69,0.15)"}`,background:costType==="daily"?BL:"transparent",color:costType==="daily"?"#fff":"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
              Matumizi ya Kila Siku<br/><span style={{fontSize:10,opacity:0.75}}>Daily Expenses</span>
            </button>
            <button onClick={()=>{setCostType("bulk");setCat("bulk_ingredients");}} style={{padding:"9px",borderRadius:8,border:`1.5px solid ${costType==="bulk"?N:"rgba(11,31,69,0.15)"}`,background:costType==="bulk"?N:"transparent",color:costType==="bulk"?G:"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
              Manunuzi Makubwa<br/><span style={{fontSize:10,opacity:0.75}}>Bulk Purchase</span>
            </button>
          </div>

          {/* Explanation */}
          <div style={{background:costType==="daily"?"rgba(21,101,192,0.06)":"rgba(11,31,69,0.04)",borderRadius:8,padding:"7px 10px",marginBottom:10,fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.55)"}}>
            {costType==="daily"?"Matumizi ya kawaida kila siku: gesi, mishahara, malighafi ndogo, pango.\nDaily recurring costs: gas, wages, small ingredients, rent.":"Manunuzi makubwa ya mara moja: malighafi ya jumla, vifaa, matangazo.\nOne-time large purchases: bulk ingredients, equipment, marketing."}
          </div>

          {/* Categories */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
            {currentCats.map(c=>(
              <button key={c.k} onClick={()=>setCat(c.k)} style={{padding:"7px 8px",borderRadius:8,border:`1px solid ${cat===c.k?N:"rgba(11,31,69,0.15)"}`,background:cat===c.k?N:"transparent",color:cat===c.k?G:"rgba(11,31,69,0.6)",fontFamily:"sans-serif",fontSize:"11px",fontWeight:cat===c.k?700:400,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                <i className={`ti ${c.icon}`} style={{fontSize:13}}/>{c.l}
              </button>
            ))}
          </div>

          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Maelezo / Description (e.g. mkaa 10kg)" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Kiasi / Amount (TZS)" style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box",marginBottom:10}}/>

          <button onClick={doCost} disabled={costBusy||!amount} style={{width:"100%",background:costSuccess?"#4caf50":costBusy||!amount?"rgba(11,31,69,0.15)":R,color:costBusy||!amount?"rgba(11,31,69,0.35)":"#fff",border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:costBusy||!amount?"default":"pointer",transition:"background 0.3s"}}>
            {costSuccess?"Imehifadhiwa! / Saved!":costBusy?"Inahifadhi...":` HIFADHI MATUMIZI — ${dateLabel}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ════ TAB 3: RIPOTI (REPORTS & HISTORY) ════ */
function RipodiTab() {
  const {allSales,allCosts,itemCosts,fetchRange,loading,goals}=useAdmin();
  const [range,setRange]=useState("today");
  const [cStart,setCStart]=useState(today());
  const [cEnd,setCEnd]=useState(today());
  const [fetched,setFetched]=useState(false);

  function getRangeDates(){
    const t=new Date(); const fmt=d=>d.toISOString().split("T")[0];
    if(range==="today") return {start:today(),end:today()};
    if(range==="yesterday"){const y=new Date(t);y.setDate(y.getDate()-1);return{start:fmt(y),end:fmt(y)};}
    if(range==="last7"){const s=new Date(t);s.setDate(s.getDate()-6);return{start:fmt(s),end:fmt(t)};}
    if(range==="month"){const s=new Date(t.getFullYear(),t.getMonth(),1);return{start:fmt(s),end:fmt(t)};}
    return {start:cStart,end:cEnd};
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

  // Daily breakdown
  const byDate=useMemo(()=>{
    const m={};
    sales.forEach(s=>{if(!m[s.sale_date])m[s.sale_date]={gross:0,count:0};m[s.sale_date].gross+=s.total_price;m[s.sale_date].count+=s.quantity;});
    return Object.entries(m).sort(([a],[b])=>b.localeCompare(a));
  },[sales]);

  // Goal progress for range
  const weekGoalProgress = range==="last7"&&goals.weekly ? pct(gross,goals.weekly) : null;
  const monthGoalProgress = range==="month"&&goals.monthly ? pct(gross,goals.monthly) : null;

  async function doFetch(){await fetchRange(start,end);setFetched(true);}

  function endDayWhatsApp(){
    const lines=[
      `RIPOTI — ${start}${start!==end?" hadi "+end:""}`,
      `Mapato Ghafi: ${fmt(gross)}`,
      `Gharama za Kila Siku: ${fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}`,
      `Manunuzi Makubwa: ${fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}`,
      `Faida Halisi: ${fmt(net)}`,
      `Jumla ya Mauzo: ${sales.length}`,
      ``,
      `Viongozi:`,
      ...Object.entries(sales.reduce((m,s)=>{m[s.item_name]=(m[s.item_name]||0)+s.total_price;return m;},{})).sort(([,a],[,b])=>b-a).slice(0,3).map(([n,v])=>`${n}: ${fmt(v)}`),
      ``,
      `Unyamwezini Jiko La Bibi JJJ`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`,"_blank");
  }

  return (
    <div style={{padding:"1rem"}}>
      {/* Range selector */}
      <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Kipindi / Time Period</p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:range==="custom"?8:0}}>
          {[["today","Leo"],["yesterday","Jana"],["last7","Wiki 7"],["month","Mwezi"],["custom","Chagua"]].map(([k,l])=>(
            <Pill key={k} label={l} active={range===k} onClick={()=>{setRange(k);setFetched(false);}}/>
          ))}
        </div>
        {range==="custom"&&(
          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
            <input type="date" value={cStart} onChange={e=>setCStart(e.target.value)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"12px",color:N,outline:"none"}}/>
            <span style={{color:"rgba(11,31,69,0.4)",fontSize:"11px"}}>—</span>
            <input type="date" value={cEnd} onChange={e=>setCEnd(e.target.value)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"12px",color:N,outline:"none"}}/>
          </div>
        )}
        <button onClick={doFetch} disabled={loading} style={{marginTop:8,width:"100%",background:N,color:G,border:"none",borderRadius:8,padding:"9px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
          {loading?"Inapakia...":"Pata Ripoti / Get Report"}
        </button>
      </div>

      {(fetched||range==="today")&&(
        <>
          {/* P&L summary */}
          <div style={{background:N,borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
            <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Muhtasari wa Fedha</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[[fmt(gross),G,"Mapato Ghafi / Gross Revenue"],[fmt(overhead),R,"Gharama Yote / Total Costs"],[fmt(itemCostTotal),"rgba(253,245,228,0.6)","Gharama Bidhaa / Food Costs"],[fmt(net),net>=0?"#4caf50":"#f44336","Faida Halisi / Net Profit"]].map(([v,c,l])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:"16px",fontWeight:900,color:c}}>{v}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(253,245,228,0.4)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal progress */}
          {weekGoalProgress!==null&&(
            <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
              <GoalBar label="Lengo la Wiki / Weekly Goal" current={gross} goal={goals.weekly}/>
            </div>
          )}
          {monthGoalProgress!==null&&(
            <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
              <GoalBar label="Lengo la Mwezi / Monthly Goal" current={gross} goal={goals.monthly}/>
            </div>
          )}

          {/* Costs breakdown */}
          {overhead>0&&(
            <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
              <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Matumizi Yote</p>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",color:N}}>Matumizi ya Kila Siku</span>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:BL}}>{fmt(dailyCosts.reduce((s,c)=>s+c.amount,0))}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",color:N}}>Manunuzi Makubwa</span>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{fmt(bulkCosts.reduce((s,c)=>s+c.amount,0))}</span>
              </div>
              {costs.slice(0,8).map((c,i)=>(
                <div key={c.id||i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid rgba(11,31,69,0.06)"}}>
                  <div>
                    <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N}}>{c.description}</span>
                    <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.35)",marginLeft:5}}>{c.cost_date} · {c.category}</span>
                    {c.spending_type==="bulk"&&<Badge color={N} bg="rgba(11,31,69,0.08)" style={{marginLeft:4}}>Jumla</Badge>}
                  </div>
                  <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:R}}>{fmt(c.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Daily breakdown */}
          {byDate.length>1&&(
            <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
              <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Kwa Siku</p>
              {byDate.map(([d,v])=>(
                <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid rgba(11,31,69,0.06)"}}>
                  <span style={{fontFamily:"sans-serif",fontSize:"12px",color:N}}>{d}</span>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:G}}>{fmt(v.gross)}</span>
                    <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)",marginLeft:6}}>{v.count} bidhaa</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={endDayWhatsApp} style={{width:"100%",background:"rgba(212,175,55,0.12)",color:N,border:`1.5px solid ${G}`,borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>
            Tuma Ripoti WhatsApp
          </button>
        </>
      )}
    </div>
  );
}

/* ════ TAB 4: MALENGO (GOALS) ════ */
function MalengoTab() {
  const {goals,setGoal,todayGross,allSales,allCosts}=useAdmin();
  const [dv,setDv]=useState(String(goals.daily||""));
  const [wv,setWv]=useState(String(goals.weekly||""));
  const [mv,setMv]=useState(String(goals.monthly||""));
  const [saved,setSaved]=useState(false);

  function saveAll(){
    if(dv) setGoal("daily",dv);
    if(wv) setGoal("weekly",wv);
    if(mv) setGoal("monthly",mv);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  }

  // Compute weekly & monthly gross
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  const monthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  const wkGross=allSales.filter(s=>s.sale_date>=weekStart.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);
  const moGross=allSales.filter(s=>s.sale_date>=monthStart.toISOString().split("T")[0]).reduce((s,r)=>s+r.total_price,0);

  return (
    <div style={{padding:"1rem"}}>
      {/* Goal Progress */}
      {(goals.daily||goals.weekly||goals.monthly)>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Maendeleo ya Sasa / Current Progress</p>
          {goals.daily>0&&<GoalBar label="Leo / Today" current={todayGross} goal={goals.daily} color={G}/>}
          {goals.weekly>0&&<GoalBar label="Wiki hii / This Week" current={wkGross} goal={goals.weekly} color={BL}/>}
          {goals.monthly>0&&<GoalBar label="Mwezi huu / This Month" current={moGross} goal={goals.monthly} color={GR}/>}
        </div>
      )}

      {/* Set Goals */}
      <div style={{background:"#fff",borderRadius:12,padding:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Weka Malengo ya Mapato / Set Revenue Goals</p>

        {[["Lengo la Kila Siku / Daily Goal",dv,setDv,G,"Mfano: 100000 = TZS 100K kwa siku"],["Lengo la Wiki / Weekly Goal",wv,setWv,BL,"Mfano: 700000 = TZS 700K kwa wiki"],["Lengo la Mwezi / Monthly Goal",mv,setMv,GR,"Mfano: 3000000 = TZS 3M kwa mwezi"]].map(([label,val,setter,color,hint])=>(
          <div key={label} style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</label>
            <input type="number" value={val} onChange={e=>setter(e.target.value)} placeholder={hint} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`2px solid ${color}33`,fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box"}}/>
            {val&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.5)",margin:"3px 0 0"}}>= {fmt(val)}</p>}
          </div>
        ))}

        <button onClick={saveAll} style={{width:"100%",background:saved?GR:N,color:saved?"#fff":G,border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer",transition:"background 0.3s"}}>
          {saved?"Imehifadhiwa! / Saved!":"Hifadhi Malengo / Save Goals"}
        </button>
      </div>

      {/* Tips */}
      <div style={{background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:12,padding:"1rem",marginTop:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.5)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Ushauri wa Kuweka Malengo</p>
        {["Angalia wastani wa wiki iliyopita ili kuweka lengo halisi.","Lengo la wiki = lengo la siku x 7.","Lengo la mwezi = lengo la wiki x 4.","Anza na lengo dogo, kisha ongeza polepole."].map((t,i)=>(
          <p key={i} style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.55)",lineHeight:1.6,margin:"0 0 4px"}}>• {t}</p>
        ))}
      </div>
    </div>
  );
}

/* ════ TAB 5: AKILI (ANALYTICS) ════ */
function AkiliTab() {
  const {allSales,allCosts,itemCosts,goals,todayGross,fetchRange}=useAdmin();
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{if(!loaded){fetchRange(new Date(Date.now()-30*86400000).toISOString().split("T")[0],today());setLoaded(true);};},[]);

  const last30sales=allSales.filter(s=>s.sale_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const last30costs=allCosts.filter(c=>c.cost_date>=new Date(Date.now()-30*86400000).toISOString().split("T")[0]);
  const gross30=last30sales.reduce((s,r)=>s+r.total_price,0);
  const cost30=last30costs.reduce((s,c)=>s+c.amount,0);
  const net30=gross30-cost30;

  const itemStats=useMemo(()=>{
    const m={};
    last30sales.forEach(s=>{if(!m[s.item_id])m[s.item_id]={id:s.item_id,name:s.item_name,qty:0,rev:0,cost:0};m[s.item_id].qty+=s.quantity;m[s.item_id].rev+=s.total_price;m[s.item_id].cost+=(itemCosts[s.item_id]||0)*s.quantity;});
    return Object.values(m).map(i=>({...i,profit:i.rev-i.cost,margin:i.rev?Math.round((i.rev-i.cost)/i.rev*100):0})).sort((a,b)=>b.rev-a.rev);
  },[last30sales,itemCosts]);

  const dailyRev=useMemo(()=>{
    const m={};last30sales.forEach(s=>{m[s.sale_date]=(m[s.sale_date]||0)+s.total_price;});
    return Object.entries(m).sort(([a],[b])=>a.localeCompare(b)).slice(-14);
  },[last30sales]);
  const maxRev=Math.max(...dailyRev.map(([,v])=>v),1);

  const svcMap=useMemo(()=>{const m={pickup:0,delivery:0,dinein:0};last30sales.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});return m;},[last30sales]);
  const healthScore=Math.min(100,Math.max(0,50+(net30/gross30*30||0)+(itemStats.length>5?10:0)+(gross30>500000?10:0)));

  const insights=[];
  itemStats.filter(i=>i.margin<0&&i.qty>0).slice(0,2).forEach(i=>insights.push({t:"danger",msg:`${i.name} inapoteza pesa (margin ${i.margin}%). Panda bei au simama kuuza.`}));
  itemStats.filter(i=>i.margin>40&&i.qty>3).slice(0,2).forEach(i=>insights.push({t:"good",msg:`${i.name} ina faida kubwa (${i.margin}%). Tangaza zaidi!`}));
  if(cost30>gross30*0.6&&gross30>0) insights.push({t:"warn",msg:`Gharama ni ${Math.round(cost30/gross30*100)}% ya mapato. Punguza matumizi.`});
  if(svcMap.delivery<svcMap.pickup*0.15&&gross30>0) insights.push({t:"info",msg:"Delivery chini sana. Ongeza delivery ili kupata wateja zaidi."});

  return (
    <div style={{padding:"1rem"}}>
      <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 2px"}}>Uchambuzi wa Siku 30 Zilizopita / Last 30 Days Analytics</p>

      {/* Health score */}
      <div style={{background:N,borderRadius:14,padding:"1.2rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
          <svg viewBox="0 0 64 64" style={{transform:"rotate(-90deg)"}}>
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke={healthScore>=70?GR:healthScore>=40?G:R} strokeWidth="7" strokeDasharray={`${healthScore*1.63} 163`} strokeLinecap="round"/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontSize:"16px",fontWeight:900,color:healthScore>=70?GR:healthScore>=40?G:R}}>{Math.round(healthScore)}</div>
        </div>
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(253,245,228,0.45)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 3px"}}>Afya ya Biashara</p>
          <p style={{fontFamily:"Georgia,serif",fontSize:"18px",fontWeight:900,color:healthScore>=70?GR:healthScore>=40?G:R,margin:"0 0 2px"}}>{healthScore>=70?"Nzuri Sana / Excellent":healthScore>=40?"Wastani / Average":"Hatarini / At Risk"}</p>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(253,245,228,0.35)",margin:0}}>Gross: {fmt(gross30)} · Net: {fmt(net30)}</p>
        </div>
      </div>

      {/* Trend chart */}
      {dailyRev.length>2&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Trend ya Mapato (Siku 14)</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:70}}>
            {dailyRev.map(([d,v])=>(
              <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",background:G,borderRadius:"3px 3px 0 0",height:Math.max(3,pct(v,maxRev)*0.7)+"px"}}/>
                <span style={{fontFamily:"sans-serif",fontSize:"7px",color:"rgba(11,31,69,0.35)"}}>{d.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top items */}
      {itemStats.length>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Bidhaa Bora (Mapato)</p>
          {itemStats.slice(0,5).map((item,i)=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"14px",fontWeight:900,color:i===0?G:"rgba(11,31,69,0.3)",width:16}}>{i+1}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N,marginBottom:2}}>{item.name}</div>
                <div style={{height:4,background:"rgba(11,31,69,0.08)",borderRadius:2}}><div style={{height:"100%",width:pct(item.rev,itemStats[0].rev)+"%",background:i===0?G:BL,borderRadius:2}}/></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:N}}>{fmt(item.rev)}</div>
                {item.margin!==0&&<span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:item.margin>0?GR:R}}>{item.margin}%</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service mix */}
      {gross30>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Aina ya Huduma</p>
          {[["Kuchukua / Pickup",svcMap.pickup,BL],["Delivery",svcMap.delivery,GR],["Kula Hapa / Dine-in",svcMap.dinein,G]].map(([l,v,c])=>v>0&&(
            <div key={l} style={{marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:"sans-serif",fontSize:"11px",color:N}}>{l}</span><span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N}}>{fmt(v)}</span></div>
              <div style={{height:5,background:"rgba(11,31,69,0.08)",borderRadius:3}}><div style={{height:"100%",width:pct(v,gross30)+"%",background:c,borderRadius:3}}/></div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {insights.length>0&&(
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Ushauri wa Biashara</p>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:ins.t==="good"?"rgba(27,107,32,0.06)":ins.t==="danger"?"rgba(198,40,40,0.06)":ins.t==="warn"?"rgba(212,175,55,0.08)":"rgba(21,101,192,0.06)",borderLeft:`3px solid ${ins.t==="good"?GR:ins.t==="danger"?R:ins.t==="warn"?G:BL}`,borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:6,fontFamily:"sans-serif",fontSize:"12px",color:N,lineHeight:1.4}}>{ins.msg}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════ MENU TAB ════ */
function MenuTab() {
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost}=useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [ced,setCed]=useState(null);const [cv,setCv]=useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=>{
        const items=menu.filter(m=>m.section===sec.id);
        return(
          <div key={sec.id} style={{marginBottom:"1.2rem"}}>
            <div style={{background:N,borderRadius:"10px 10px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:G,color:N2,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
              <span style={{fontFamily:"Georgia,serif",fontSize:"14px",fontWeight:700,color:G}}>{sec.name.sw}</span>
            </div>
            <div style={{border:"1px solid rgba(11,31,69,0.12)",borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
              {items.map((item,i)=>{
                const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
                const cost=itemCosts[item.id];const oos=!!stock[item.id];
                return(
                  <div key={item.id} style={{padding:"10px 14px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderTop:i>0?"1px solid rgba(11,31,69,0.07)":"none",opacity:oos?0.6:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
                        {oos&&<span style={{fontFamily:"sans-serif",fontSize:"10px",color:R,fontWeight:700}}>IMEISHA</span>}
                      </div>
                      {ed===item.id?(
                        <div style={{display:"flex",gap:4}}>
                          <input type="number" value={val} onChange={e=>setVal(e.target.value)} autoFocus style={{width:70,padding:"4px 6px",borderRadius:6,border:`2px solid ${G}`,fontFamily:"sans-serif",fontSize:"12px",color:N,outline:"none"}}/>
                          <button onClick={()=>{overridePrice(item.id,parseInt(val));setEd(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:6,padding:"4px 8px",fontSize:"12px",cursor:"pointer",fontWeight:700}}>OK</button>
                          <button onClick={()=>setEd(null)} style={{background:"#ddd",color:"#333",border:"none",borderRadius:6,padding:"4px 6px",fontSize:"12px",cursor:"pointer"}}>X</button>
                        </div>
                      ):(
                        <button onClick={()=>{setEd(item.id);setVal(String(cur));}} style={{background:"none",border:"1px solid rgba(11,31,69,0.2)",borderRadius:6,padding:"3px 8px",fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:prices[item.id]!==undefined?GR:N,cursor:"pointer"}}>{fmt(cur)}</button>
                      )}
                      <button onClick={()=>toggleStock(item.id)} style={{background:oos?R:"rgba(27,107,32,0.12)",color:oos?"#fff":GR,border:"none",borderRadius:6,padding:"3px 7px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA / OUT OF STOCK":"IPO / IN STOCK"}</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26,marginTop:4}}>
                      <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.4)"}}>Gharama ya kupika:</span>
                      {ced===item.id?(
                        <div style={{display:"flex",gap:4}}>
                          <input type="number" value={cv} onChange={e=>setCv(e.target.value)} autoFocus placeholder="0" style={{width:60,padding:"2px 5px",borderRadius:4,border:`1px solid ${G}`,fontFamily:"sans-serif",fontSize:"11px",outline:"none"}}/>
                          <button onClick={()=>{setCost(item.id,parseInt(cv));setCed(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:4,padding:"2px 6px",fontSize:"11px",cursor:"pointer",fontWeight:700}}>OK</button>
                        </div>
                      ):(
                        <button onClick={()=>{setCed(item.id);setCv(String(cost||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:"10px",color:cost?GR:"rgba(11,31,69,0.35)",cursor:"pointer",padding:0}}>{cost?fmt(cost):"Weka gharama / Set cost"}</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════ ORDERS TAB ════ */
function MaagizoTab() {
  const {orders,addOrder,updateOrderStatus}=useAdmin();
  const [show,setShow]=useState(false);
  const [f,setF]=useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  const td=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
  return(
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1rem"}}>
        {[["Leo Yote / All Today",td.length,"rgba(212,175,55,0.12)",N],["Inasubiri / Pending",td.filter(o=>o.status==="pending").length,"rgba(198,40,40,0.08)",R],["Imekamilika / Completed",td.filter(o=>o.status==="done").length,"rgba(27,107,32,0.08)",GR]].map(([l,v,bg,c])=>(
          <div key={l} style={{background:bg,borderRadius:10,padding:10,textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:"24px",fontWeight:900,color:c}}>{v}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>{l}</div></div>
        ))}
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:N,color:G,border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>{show?"Funga / Close":"+ Agizo Jipya / + New Order"}</button>
      {show&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",border:`1px solid rgba(212,175,55,0.3)`}}>
          {[["customer","Jina *",""],["phone","Simu","07xx"],["items","Chakula *","Pilau x2"],["total","Jumla (TZS)","10000"]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:8}}><label style={{display:"block",fontSize:"11px",fontFamily:"sans-serif",fontWeight:700,color:"rgba(11,31,69,0.5)",marginBottom:3,textTransform:"uppercase"}}>{l}</label><input value={f[k]} onChange={set(k)} placeholder={p} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box"}}/></div>
          ))}
          <select value={f.service} onChange={set("service")} style={{width:"100%",padding:8,borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,background:"#fff",marginBottom:10}}>
            <option value="pickup">Kuchukua</option><option value="delivery">Delivery</option><option value="dinein">Kula Hapa</option><option value="events">Sherehe</option>
          </select>
          <button onClick={save} style={{width:"100%",background:GR,color:"#fff",border:"none",borderRadius:8,padding:10,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer"}}>Hifadhi</button>
        </div>
      )}
      {td.map(o=>(
        <div key={o.id} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(11,31,69,0.07)",borderLeft:`4px solid ${o.status==="done"?GR:G}`,display:"flex",gap:8,alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N}}>{o.customer}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.45)",marginTop:1}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})} · {o.service}{o.phone?` · ${o.phone}`:""}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"rgba(11,31,69,0.65)",marginTop:4}}>{o.items}</div>
            {o.total>0&&<div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:G,marginTop:4}}>{fmt(o.total)}</div>}
          </div>
          <button onClick={()=>updateOrderStatus(o.id,o.status==="done"?"pending":"done")} style={{background:o.status==="done"?"rgba(11,31,69,0.08)":GR,color:o.status==="done"?"rgba(11,31,69,0.4)":"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{o.status==="done"?"Imekamilika / Completed":"Maliza"}</button>
        </div>
      ))}
      {td.length===0&&<p style={{textAlign:"center",padding:"2rem",color:"rgba(11,31,69,0.35)",fontFamily:"sans-serif",fontSize:"13px"}}>Hakuna maagizo leo bado.</p>}
    </div>
  );
}

/* ════ MAIN ════ */
export default function AdminPage({onExit}) {
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
  if(!authed)return <PinGate onAuth={()=>setAuthed(true)}/>;

  const TABS=[
    {key:"leo",    icon:"ti-home",              label:"Leo / Today",     sub:"Today"},
    {key:"ingiza", icon:"ti-plus",              label:"Ingiza",  sub:"Input"},
    {key:"ripoti", icon:"ti-chart-bar",         label:"Ripoti",  sub:"Reports"},
    {key:"malengo",icon:"ti-target",            label:"Malengo", sub:"Goals"},
    {key:"akili",  icon:"ti-brain",             label:"Akili",   sub:"Analytics"},
    {key:"menu",   icon:"ti-tools-kitchen-2",   label:"Menyu",   sub:"Menu"},
    {key:"maagizo",icon:"ti-clipboard-list",    label:"Maagizo", sub:"Orders"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#F9F3E8",paddingBottom:"80px"}}>
      <div style={{background:N2,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
        <button onClick={onExit} style={{background:"none",border:"none",color:"rgba(253,245,228,0.5)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"13px",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-arrow-left"/> Rudi</button>
        <span style={{fontFamily:"Georgia,serif",fontSize:"15px",fontWeight:700,color:G}}>Msimamizi / Admin</span>
        <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:"rgba(253,245,228,0.4)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"11px"}}>Toka</button>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid rgba(212,175,55,0.2)",display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:"0 0 auto",padding:"9px 10px",border:"none",background:"none",cursor:"pointer",color:tab===t.key?N:"rgba(11,31,69,0.4)",borderBottom:tab===t.key?`2px solid ${G}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:52}}>
            <i className={`ti ${t.icon}`} style={{fontSize:17}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,whiteSpace:"nowrap",color:tab===t.key?N:"rgba(11,31,69,0.55)"}}>{t.label}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"7px",color:tab===t.key?"rgba(11,31,69,0.45)":"rgba(11,31,69,0.3)",whiteSpace:"nowrap"}}>{t.sub}</span>
            <span style={{fontFamily:"sans-serif",fontSize:"8px",color:"rgba(11,31,69,0.35)",whiteSpace:"nowrap"}}>{t.sub}</span>
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
