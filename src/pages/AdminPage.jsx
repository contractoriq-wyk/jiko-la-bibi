import { useState, useEffect, useMemo } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

const G="#D4AF37",N="#0B1F45",N2="#06132E",GR="#1B6B20",R="#C62828",BL="#1565C0";
const fmt=n=>"TZS "+Number(n||0).toLocaleString();
const pct=(a,b)=>b?Math.round(a/b*100):0;

/* ─── HELPERS ─── */
function StatCard({label,value,sub,color=N,bg="rgba(11,31,69,0.05)"}) {
  return (
    <div style={{background:bg,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
      <div style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.45)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>{label}</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)",marginTop:3}}>{sub}</div>}
    </div>
  );
}

function MiniBar({label,value,max,color=G}) {
  return (
    <div style={{marginBottom:7}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontFamily:"sans-serif",fontSize:"11px",color:N}}>{label}</span>
        <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N}}>{fmt(value)}</span>
      </div>
      <div style={{height:5,background:"rgba(11,31,69,0.08)",borderRadius:3}}>
        <div style={{height:"100%",width:`${pct(value,max)}%`,background:color,borderRadius:3,transition:"width 0.5s"}}/>
      </div>
    </div>
  );
}

/* ─── PIN GATE ─── */
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
      <img src="/logo.png" alt="" width={80} height={80} style={{borderRadius:"50%",border:`2px solid ${G}`,objectFit:"cover",marginBottom:"1.2rem"}} onError={e=>e.target.style.display="none"}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:"#FDF5E4",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(253,245,228,0.5)",fontSize:"12px",fontFamily:"sans-serif",margin:"0 0 1.8rem"}}>Eneo la Msimamizi</p>
      <div style={{display:"flex",gap:"12px",marginBottom:"1.2rem"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?G:"rgba(253,245,228,0.2)",border:`2px solid ${pin.length>i?G:"rgba(253,245,228,0.3)"}`,transition:"all 0.15s"}}/>)}
      </div>
      {err&&<p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>PIN si sahihi.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:"10px"}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:"12px",fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":"rgba(253,245,228,0.08)",color:k==="⌫"?"rgba(253,245,228,0.5)":"#FDF5E4",border:k===""?"none":"1px solid rgba(253,245,228,0.12)",cursor:k===""?"default":"pointer"}}>{k}</button>)}
      </div>
    </div>
  );
}

/* ─── DATE RANGE PICKER ─── */
function DateRangePicker({value,onChange,customStart,setCustomStart,customEnd,setCustomEnd}) {
  const opts=[["today","Leo"],["yesterday","Jana"],["last7","Wiki 7"],["month","Mwezi"],["custom","Chagua"]];
  return (
    <div>
      <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:value==="custom"?"8px":"0"}}>
        {opts.map(([k,l])=>(
          <button key={k} onClick={()=>onChange(k)} style={{padding:"5px 10px",borderRadius:"99px",border:`1px solid ${value===k?N:"rgba(11,31,69,0.15)"}`,background:value===k?N:"transparent",color:value===k?G:"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"11px",fontWeight:value===k?700:400,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      {value==="custom"&&(
        <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:6}}>
          <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} style={{flex:1,padding:"5px 8px",borderRadius:6,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"12px",color:N,outline:"none"}}/>
          <span style={{color:"rgba(11,31,69,0.4)",fontSize:"11px"}}>—</span>
          <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} style={{flex:1,padding:"5px 8px",borderRadius:6,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"12px",color:N,outline:"none"}}/>
        </div>
      )}
    </div>
  );
}

/* ─── AKILI (ANALYTICS) TAB ─── */
function AkiliTab() {
  const {todaySales,historySales,itemCosts,allDailyCosts,prices,dateRange,setDateRange,customStart,setCustomStart,customEnd,setCustomEnd,fetchByRange,loadingHistory}=useAdmin();
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    if(!loaded){fetchByRange("last7",null,null);setLoaded(true);}
  },[]);

  const sales = dateRange==="today"?todaySales:historySales;
  const costs = useMemo(()=>{
    if(dateRange==="today"){const t=new Date().toISOString().split("T")[0];return allDailyCosts.filter(c=>c.cost_date===t);}
    return allDailyCosts;
  },[dateRange,allDailyCosts]);

  const gross = useMemo(()=>sales.reduce((s,r)=>s+r.total_price,0),[sales]);
  const overhead = useMemo(()=>costs.reduce((s,c)=>s+c.amount,0),[costs]);
  const itemCostTotal = useMemo(()=>sales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0),[sales,itemCosts]);
  const net = gross-itemCostTotal-overhead;
  const margin = gross?Math.round(net/gross*100):0;

  // Item performance
  const itemStats = useMemo(()=>{
    const map={};
    sales.forEach(s=>{
      if(!map[s.item_id]) map[s.item_id]={id:s.item_id,name:s.item_name,qty:0,rev:0,cost:0};
      map[s.item_id].qty+=s.quantity;
      map[s.item_id].rev+=s.total_price;
      map[s.item_id].cost+=(itemCosts[s.item_id]||0)*s.quantity;
    });
    return Object.values(map).map(i=>({...i,profit:i.rev-i.cost,margin:i.rev?Math.round((i.rev-i.cost)/i.rev*100):0})).sort((a,b)=>b.rev-a.rev);
  },[sales,itemCosts]);

  // Daily revenue for trend
  const dailyRev = useMemo(()=>{
    const map={};
    sales.forEach(s=>{map[s.sale_date]=(map[s.sale_date]||0)+s.total_price;});
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
  },[sales]);

  const maxDailyRev = Math.max(...dailyRev.map(([,v])=>v),1);

  // Service breakdown
  const svcMap = useMemo(()=>{
    const m={pickup:0,delivery:0,dinein:0};
    sales.forEach(s=>{m[s.service_type]=(m[s.service_type]||0)+s.total_price;});
    return m;
  },[sales]);

  // Cost breakdown
  const costMap = useMemo(()=>{
    const m={};
    costs.forEach(c=>{m[c.category]=(m[c.category]||0)+c.amount;});
    return m;
  },[costs]);

  // Health score (0-100)
  const healthScore = useMemo(()=>{
    let score=50;
    if(margin>30) score+=20; else if(margin>15) score+=10; else if(margin<0) score-=20;
    if(itemStats.length>3) score+=10;
    if(gross>100000) score+=10; else if(gross>50000) score+=5;
    if(overhead<gross*0.3) score+=10; else if(overhead>gross*0.5) score-=10;
    return Math.max(0,Math.min(100,score));
  },[margin,itemStats,gross,overhead]);

  const healthColor = healthScore>=70?GR:healthScore>=40?G:R;
  const healthLabel = healthScore>=70?"Nzuri Sana":healthScore>=40?"Wastani":"Hatarini";

  // OODA recommendations
  const insights = useMemo(()=>{
    const r=[];
    const losers=itemStats.filter(i=>i.margin<0&&i.qty>0);
    const stars=itemStats.filter(i=>i.margin>40&&i.qty>2);
    const slugs=itemStats.filter(i=>i.qty===0);
    if(losers.length) r.push({t:"danger",icon:"ti-trending-down",title:"Bidhaa Inayopoteza Pesa",msg:`${losers.map(i=>i.name).join(", ")} — inauza chini ya gharama. Panda bei au piga marufuku.`});
    if(stars.length) r.push({t:"good",icon:"ti-star",title:"Bidhaa Yenye Faida Kubwa",msg:`${stars.map(i=>i.name).join(", ")} — margin ${stars[0].margin}%. Tangaza zaidi!`});
    if(slugs.length>2) r.push({t:"warn",icon:"ti-sleep",title:"Bidhaa Haziuzi",msg:`${slugs.slice(0,3).map(i=>i.name).join(", ")} hazijauza. Fikiria promotion au kutoa orodha.`});
    if(overhead>gross*0.4&&gross>0) r.push({t:"warn",icon:"ti-receipt",title:"Gharama za Uendeshaji Juu",msg:`Gharama ni ${pct(overhead,gross)}% ya mapato. Punguza ili kuongeza faida.`});
    if(svcMap.delivery<svcMap.pickup*0.2&&gross>0) r.push({t:"info",icon:"ti-bike",title:"Delivery Chini",msg:"Huduma ya delivery inaweza kuongeza mapato. Tangaza delivery zaidi."});
    if(margin>25) r.push({t:"good",icon:"ti-trending-up",title:"Margin Nzuri",msg:`Margin ya ${margin}% ni nzuri. Lengo: fikia 35% kwa kupunguza gharama za malighafi.`});
    if(!Object.keys(itemCosts).length) r.push({t:"info",icon:"ti-calculator",title:"Weka Gharama za Bidhaa",msg:"Weka gharama ya kila bidhaa katika tab ya Menyu ili kuona faida halisi."});
    return r.slice(0,5);
  },[itemStats,overhead,gross,svcMap,margin,itemCosts]);

  function doFetch(){fetchByRange(dateRange,customStart,customEnd);}

  return (
    <div style={{padding:"1rem"}}>
      {/* Date range */}
      <div style={{background:"#fff",borderRadius:12,padding:"12px",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Kipindi cha Uchambuzi</p>
        <DateRangePicker value={dateRange} onChange={v=>{setDateRange(v);}} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd}/>
        <button onClick={doFetch} disabled={loadingHistory} style={{marginTop:8,width:"100%",background:N,color:G,border:"none",borderRadius:8,padding:"8px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
          {loadingHistory?"Inapakia...":"Tafuta"}
        </button>
      </div>

      {/* Health Score */}
      <div style={{background:N,borderRadius:14,padding:"1.2rem",marginBottom:"1rem",textAlign:"center"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 8px"}}>Afya ya Biashara</p>
        <div style={{position:"relative",width:80,height:80,margin:"0 auto 8px"}}>
          <svg viewBox="0 0 80 80" style={{transform:"rotate(-90deg)"}}>
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke={healthColor} strokeWidth="8" strokeDasharray={`${healthScore*2.01} 201`} strokeLinecap="round"/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:healthColor}}>{healthScore}</span>
          </div>
        </div>
        <p style={{fontFamily:"Georgia,serif",fontSize:"16px",fontWeight:700,color:healthColor,margin:"0 0 4px"}}>{healthLabel}</p>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(253,245,228,0.4)",margin:0}}>Alama ya jumla ya biashara</p>
      </div>

      {/* P&L Summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
        <StatCard label="Mapato Ghafi" value={fmt(gross)} color={G} bg="rgba(212,175,55,0.08)"/>
        <StatCard label="Faida Halisi" value={fmt(net)} color={net>=0?GR:R} bg={net>=0?"rgba(27,107,32,0.08)":"rgba(198,40,40,0.06)"}/>
        <StatCard label="Gharama Bidhaa" value={fmt(itemCostTotal)} color={N} bg="rgba(11,31,69,0.05)"/>
        <StatCard label="Gharama Uendeshaji" value={fmt(overhead)} color={N} bg="rgba(11,31,69,0.05)"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
        <StatCard label="Margin %" value={margin+"%"} color={margin>25?GR:margin>0?G:R} bg={margin>25?"rgba(27,107,32,0.08)":"rgba(212,175,55,0.08)"}/>
        <StatCard label="Idadi ya Mauzo" value={sales.length} color={N} bg="rgba(11,31,69,0.05)"/>
      </div>

      {/* Revenue trend */}
      {dailyRev.length>1&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Trend ya Mapato</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
            {dailyRev.map(([date,val])=>(
              <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",background:G,borderRadius:"3px 3px 0 0",height:`${Math.max(4,pct(val,maxDailyRev)*0.8)}px`,transition:"height 0.5s"}}/>
                <span style={{fontFamily:"sans-serif",fontSize:"8px",color:"rgba(11,31,69,0.4)",textAlign:"center"}}>{date.slice(5)}</span>
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
                <div style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N,marginBottom:2}}>{item.name}</div>
                <div style={{height:4,background:"rgba(11,31,69,0.08)",borderRadius:2}}>
                  <div style={{height:"100%",width:`${pct(item.rev,itemStats[0].rev)}%`,background:i===0?G:BL,borderRadius:2}}/>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N}}>{fmt(item.rev)}</div>
                <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.4)"}}>×{item.qty}</div>
              </div>
              {item.margin>0&&<span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:700,color:item.margin>30?GR:G,background:item.margin>30?"rgba(27,107,32,0.1)":"rgba(212,175,55,0.1)",borderRadius:4,padding:"1px 5px"}}>{item.margin}%</span>}
            </div>
          ))}
        </div>
      )}

      {/* Service mix */}
      {gross>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Aina ya Huduma</p>
          {[["pickup","Kuchukua",BL],["delivery","Delivery",GR],["dinein","Kula Hapa",G]].map(([k,l,c])=>svcMap[k]>0&&(
            <MiniBar key={k} label={l} value={svcMap[k]} max={gross} color={c}/>
          ))}
        </div>
      )}

      {/* Cost breakdown */}
      {overhead>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Gharama kwa Aina</p>
          {Object.entries(costMap).map(([k,v])=>(
            <MiniBar key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} value={v} max={overhead} color={R}/>
          ))}
        </div>
      )}

      {/* OODA Insights */}
      <div style={{marginBottom:"1rem"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Ushauri wa Biashara</p>
        {insights.map((ins,i)=>(
          <div key={i} style={{background:ins.t==="good"?"rgba(27,107,32,0.06)":ins.t==="danger"?"rgba(198,40,40,0.06)":ins.t==="warn"?"rgba(212,175,55,0.08)":"rgba(21,101,192,0.06)",borderLeft:`3px solid ${ins.t==="good"?GR:ins.t==="danger"?R:ins.t==="warn"?G:BL}`,borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:6}}>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N,marginBottom:2}}>{ins.title}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.65)",lineHeight:1.4}}>{ins.msg}</div>
          </div>
        ))}
        {insights.length===0&&<p style={{textAlign:"center",color:"rgba(11,31,69,0.35)",fontFamily:"sans-serif",fontSize:"13px",padding:"1rem 0"}}>Rekodi mauzo ili kuona ushauri.</p>}
      </div>
    </div>
  );
}

/* ─── GHARAMA (COSTS) TAB ─── */
function GharamaTab() {
  const {todayCosts,allDailyCosts,saveDailyCost,deleteDailyCost}=useAdmin();
  const [cat,setCat]=useState("gas");
  const [desc,setDesc]=useState("");
  const [amount,setAmount]=useState("");
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [busy,setBusy]=useState(false);
  const CATS=[["gas","Gesi/Mkaa","ti-flame"],["staff","Wafanyakazi","ti-users"],["ingredients","Malighafi","ti-shopping-cart"],["rent","Pango","ti-building"],["other","Nyingine","ti-dots"]];
  async function save(){
    if(!amount||busy)return; setBusy(true);
    await saveDailyCost(cat,desc||cat,amount,date);
    setAmount(""); setDesc(""); setBusy(false);
  }
  const todayTotal=todayCosts.reduce((s,c)=>s+c.amount,0);
  const recent=allDailyCosts.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,20);

  return (
    <div style={{padding:"1rem"}}>
      <div style={{background:N,borderRadius:14,padding:"1rem",marginBottom:"1rem",textAlign:"center"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 4px"}}>Gharama za Leo</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"32px",fontWeight:900,color:R,margin:0}}>{fmt(todayTotal)}</p>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(253,245,228,0.35)",margin:0}}>{todayCosts.length} rekodi</p>
      </div>

      <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Ongeza Gharama</p>

        {/* Category */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
          {CATS.map(([k,l,ico])=>(
            <button key={k} onClick={()=>setCat(k)} style={{padding:"7px 8px",borderRadius:8,border:`1px solid ${cat===k?N:"rgba(11,31,69,0.15)"}`,background:cat===k?N:"transparent",color:cat===k?G:"rgba(11,31,69,0.6)",fontFamily:"sans-serif",fontSize:"11px",fontWeight:cat===k?700:400,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <i className={`ti ${ico}`} style={{fontSize:13}}/>{l}
            </button>
          ))}
        </div>

        {/* Free text description */}
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Maelezo (hiari)" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box",marginBottom:8}}/>

        {/* Amount */}
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Kiasi (TZS)" style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box",marginBottom:8}}/>

        {/* Date */}
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"7px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box",marginBottom:8}}/>

        <button onClick={save} disabled={busy||!amount} style={{width:"100%",background:busy||!amount?"rgba(11,31,69,0.15)":GR,color:busy||!amount?"rgba(11,31,69,0.35)":"#fff",border:"none",borderRadius:8,padding:"10px",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:busy||!amount?"default":"pointer"}}>
          {busy?"Inahifadhi...":"+ Hifadhi Gharama"}
        </button>
      </div>

      {/* Cost history */}
      {recent.length>0&&(
        <div>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Historia ya Gharama</p>
          {recent.map((c,i)=>(
            <div key={c.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderRadius:8,marginBottom:4}}>
              <div>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{c.description}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.4)",marginLeft:6}}>{c.cost_date} · {c.category}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:R}}>{fmt(c.amount)}</span>
                <button onClick={()=>deleteDailyCost(c.id)} style={{background:"none",border:"none",color:"rgba(198,40,40,0.5)",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── LEO TAB ─── */
function LeoTab() {
  const {todaySales,prices,itemCosts,todayGross,todayNet,todayOverhead,recordSale}=useAdmin();
  const [sec,setSec]=useState(sections[0].id);
  const [item,setItem]=useState(null);
  const [qty,setQty]=useState(1);
  const [svc,setSvc]=useState("pickup");
  const [busy,setBusy]=useState(false);
  const secItems=menu.filter(m=>m.section===sec);
  const bySection={};
  todaySales.forEach(s=>{bySection[s.section_id]=(bySection[s.section_id]||0)+s.total_price;});
  const maxRev=Math.max(...Object.values(bySection),1);

  async function doRecord(){if(!item||busy)return;setBusy(true);await recordSale(item,qty,svc);setItem(null);setQty(1);setBusy(false);}

  function endOfDay(){
    const cnt={};
    todaySales.forEach(s=>{if(!cnt[s.item_id])cnt[s.item_id]={name:s.item_name,qty:0,rev:0};cnt[s.item_id].qty+=s.quantity;cnt[s.item_id].rev+=s.total_price;});
    const sorted=Object.values(cnt).sort((a,b)=>b.rev-a.rev);
    const lines=[
      `RIPOTI — ${new Date().toLocaleDateString("sw-TZ")}`,
      `Mapato Ghafi: ${fmt(todayGross)}`,
      `Gharama Uendeshaji: ${fmt(todayOverhead)}`,
      todayNet!==null?`Faida Halisi: ${fmt(todayNet)}`:"",
      `Jumla ya Mauzo: ${todaySales.length}`,
      "Viongozi vya Leo:",
      ...sorted.slice(0,3).map((v,i)=>`${i+1}. ${v.name} x${v.qty} = ${fmt(v.rev)}`),
      "Unyamwezini Jiko La Bibi JJJ",
      "jikolabibijjj.com",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`,"_blank");
  }

  return (
    <div style={{padding:"1rem"}}>
      <div style={{background:N,borderRadius:14,padding:"1.25rem",marginBottom:"1rem",textAlign:"center"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(253,245,228,0.45)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"1.5px"}}>Mapato ya Leo</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"38px",fontWeight:900,color:G,margin:"0 0 2px",lineHeight:1}}>{fmt(todayGross)}</p>
        {todayNet!==null&&<p style={{fontFamily:"sans-serif",fontSize:"13px",color:todayNet>=0?"#4caf50":"#f44336",margin:"0 0 4px",fontWeight:700}}>Faida: {fmt(todayNet)}</p>}
        {todayOverhead>0&&<p style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(253,245,228,0.4)",margin:"0 0 2px"}}>Gharama: {fmt(todayOverhead)}</p>}
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(253,245,228,0.35)",margin:0}}>{todaySales.length} mauzo • {new Date().toLocaleDateString("sw-TZ")}</p>
      </div>

      {Object.keys(bySection).length>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Mauzo kwa Sehemu</p>
          {sections.map(s=>{const rev=bySection[s.id]||0;if(!rev)return null;return(<MiniBar key={s.id} label={s.name.sw.split(" ")[0]} value={rev} max={maxRev}/>);})}
        </div>
      )}

      <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>Rekodi Mauzo Haraka</p>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10,scrollbarWidth:"none",paddingBottom:2}}>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>{setSec(s.id);setItem(null);}} style={{background:sec===s.id?N:"transparent",color:sec===s.id?G:"rgba(11,31,69,0.5)",border:`1px solid ${sec===s.id?N:"rgba(11,31,69,0.15)"}`,borderRadius:"99px",padding:"4px 10px",whiteSpace:"nowrap",fontFamily:"sans-serif",fontSize:"11px",fontWeight:sec===s.id?700:400,cursor:"pointer",flexShrink:0}}>
              {s.name.sw.split(" ")[0]}
            </button>
          ))}
        </div>
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
              {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"5px 4px",borderRadius:6,border:`1px solid ${svc===k?N:"rgba(11,31,69,0.15)"}`,background:svc===k?N:"transparent",color:svc===k?G:"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <button onClick={doRecord} disabled={busy} style={{width:"100%",background:busy?"rgba(11,31,69,0.3)":GR,color:"#fff",border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:busy?"default":"pointer"}}>
              {busy?"Inahifadhi...":` REKODI — ${item.name.sw} x${qty}`}
            </button>
          </div>
        )}
      </div>

      {todaySales.length>0&&(
        <div style={{marginBottom:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Mauzo ya Leo ({todaySales.length})</p>
          {todaySales.slice(0,15).map((s,i)=>(
            <div key={s.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderRadius:8,marginBottom:4}}>
              <div>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{s.item_name}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)",marginLeft:5}}>x{s.quantity} · {s.service_type}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:G}}>{fmt(s.total_price)}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.35)"}}>{new Date(s.created_at).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={endOfDay} style={{width:"100%",background:"rgba(212,175,55,0.12)",color:N,border:`1.5px solid ${G}`,borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>
        Ripoti ya Mwisho wa Siku — WhatsApp
      </button>
    </div>
  );
}

/* ─── HISTORIA TAB ─── */
function HistoriaTab() {
  const {historySales,allDailyCosts,itemCosts,dateRange,setDateRange,customStart,setCustomStart,customEnd,setCustomEnd,fetchByRange,loadingHistory}=useAdmin();
  const [fetched,setFetched]=useState(false);

  const {start,end}=useMemo(()=>{
    const today=new Date();const fmt=d=>d.toISOString().split("T")[0];
    switch(dateRange){
      case"yesterday":{const y=new Date(today);y.setDate(y.getDate()-1);return{start:fmt(y),end:fmt(y)};}
      case"last7":{const s=new Date(today);s.setDate(s.getDate()-6);return{start:fmt(s),end:fmt(today)};}
      case"month":{const s=new Date(today.getFullYear(),today.getMonth(),1);return{start:fmt(s),end:fmt(today)};}
      case"custom":return{start:customStart,end:customEnd};
      default:{const t=fmt(today);return{start:t,end:t};}
    }
  },[dateRange,customStart,customEnd]);

  const sales=dateRange==="today"?[]:historySales;
  const costs=allDailyCosts.filter(c=>c.cost_date>=start&&c.cost_date<=end);
  const gross=sales.reduce((s,r)=>s+r.total_price,0);
  const overhead=costs.reduce((s,c)=>s+c.amount,0);
  const itemCostTotal=sales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0);
  const net=gross-itemCostTotal-overhead;

  // Group by date
  const byDate=useMemo(()=>{
    const m={};
    sales.forEach(s=>{
      if(!m[s.sale_date])m[s.sale_date]={date:s.sale_date,gross:0,count:0,items:{}};
      m[s.sale_date].gross+=s.total_price;
      m[s.sale_date].count+=s.quantity;
      m[s.sale_date].items[s.item_name]=(m[s.sale_date].items[s.item_name]||0)+s.quantity;
    });
    return Object.values(m).sort((a,b)=>b.date.localeCompare(a.date));
  },[sales]);

  function doFetch(){fetchByRange(dateRange,customStart,customEnd);setFetched(true);}

  return (
    <div style={{padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"12px",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Chagua Kipindi</p>
        <DateRangePicker value={dateRange} onChange={v=>{setDateRange(v);setFetched(false);}} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd}/>
        <button onClick={doFetch} disabled={loadingHistory} style={{marginTop:8,width:"100%",background:N,color:G,border:"none",borderRadius:8,padding:"9px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,cursor:"pointer"}}>
          {loadingHistory?"Inapakia...":"Tafuta Historia"}
        </button>
      </div>

      {fetched&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
            <StatCard label="Mapato Ghafi" value={fmt(gross)} color={G} bg="rgba(212,175,55,0.08)"/>
            <StatCard label="Faida Halisi" value={fmt(net)} color={net>=0?GR:R} bg={net>=0?"rgba(27,107,32,0.08)":"rgba(198,40,40,0.06)"}/>
            <StatCard label="Gharama" value={fmt(overhead)} color={R} bg="rgba(198,40,40,0.05)"/>
            <StatCard label="Mauzo" value={sales.length} color={N} bg="rgba(11,31,69,0.05)"/>
          </div>

          {byDate.length>0?(
            byDate.map(day=>(
              <div key={day.date} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:8,boxShadow:"0 2px 6px rgba(11,31,69,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{day.date}</span>
                  <span style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:G}}>{fmt(day.gross)}</span>
                </div>
                <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)"}}>
                  {Object.entries(day.items).slice(0,3).map(([n,q])=>`${n} x${q}`).join(" · ")}
                </div>
              </div>
            ))
          ):(
            <p style={{textAlign:"center",color:"rgba(11,31,69,0.35)",fontFamily:"sans-serif",fontSize:"13px",padding:"2rem 0"}}>Hakuna data kwa kipindi hicho.</p>
          )}
        </>
      )}
    </div>
  );
}

/* ─── MENU TAB ─── */
function MenuTab() {
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost}=useAdmin();
  const [ed,setEd]=useState(null);const [val,setVal]=useState("");const [costEd,setCostEd]=useState(null);const [costVal,setCostVal]=useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=>{
        const items=menu.filter(m=>m.section===sec.id);
        return (
          <div key={sec.id} style={{marginBottom:"1.2rem"}}>
            <div style={{background:N,borderRadius:"10px 10px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:G,color:N2,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
              <span style={{fontFamily:"Georgia,serif",fontSize:"14px",fontWeight:700,color:G}}>{sec.name.sw}</span>
            </div>
            <div style={{border:"1px solid rgba(11,31,69,0.12)",borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
              {items.map((item,i)=>{
                const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
                const cost=itemCosts[item.id];const oos=!!stock[item.id];const isEd=ed===item.id;const isCEd=costEd===item.id;
                return (
                  <div key={item.id} style={{padding:"10px 14px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderTop:i>0?"1px solid rgba(11,31,69,0.07)":"none",opacity:oos?0.6:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:isCEd||isEd?"6px":0}}>
                      <span style={{fontSize:"18px"}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
                        {oos&&<span style={{fontFamily:"sans-serif",fontSize:"10px",color:R,fontWeight:700}}>IMEISHA</span>}
                      </div>
                      {isEd?(
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <input type="number" value={val} onChange={e=>setVal(e.target.value)} autoFocus style={{width:80,padding:"4px 8px",borderRadius:6,border:`2px solid ${G}`,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:N,outline:"none"}}/>
                          <button onClick={()=>{overridePrice(item.id,parseInt(val));setEd(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:6,padding:"5px 10px",fontSize:"12px",cursor:"pointer",fontWeight:700}}>OK</button>
                          <button onClick={()=>setEd(null)} style={{background:"#ccc",color:"#333",border:"none",borderRadius:6,padding:"5px 8px",fontSize:"12px",cursor:"pointer"}}>X</button>
                        </div>
                      ):(
                        <button onClick={()=>{setEd(item.id);setVal(String(cur));}} style={{background:"none",border:"1px solid rgba(11,31,69,0.2)",borderRadius:6,padding:"4px 10px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:prices[item.id]!==undefined?GR:N,cursor:"pointer"}}>{fmt(cur)}</button>
                      )}
                      <button onClick={()=>toggleStock(item.id)} style={{background:oos?R:"rgba(27,107,32,0.12)",color:oos?"#fff":GR,border:"none",borderRadius:6,padding:"4px 8px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA":"IPO"}</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:26}}>
                      <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)"}}>Gharama ya kupika:</span>
                      {isCEd?(
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <input type="number" value={costVal} onChange={e=>setCostVal(e.target.value)} autoFocus placeholder="0" style={{width:70,padding:"2px 6px",borderRadius:4,border:`1px solid ${G}`,fontFamily:"sans-serif",fontSize:"11px",outline:"none"}}/>
                          <button onClick={()=>{setCost(item.id,parseInt(costVal));setCostEd(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:4,padding:"2px 8px",fontSize:"11px",cursor:"pointer",fontWeight:700}}>OK</button>
                        </div>
                      ):(
                        <button onClick={()=>{setCostEd(item.id);setCostVal(String(cost||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:"10px",color:cost?GR:"rgba(11,31,69,0.35)",cursor:"pointer",padding:0}}>
                          {cost?fmt(cost):"Weka gharama"}
                        </button>
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

/* ─── ORDERS TAB ─── */
function OrdersTab() {
  const {orders,addOrder,updateOrderStatus}=useAdmin();
  const [show,setShow]=useState(false);
  const [f,setF]=useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  const today=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
  return (
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1rem"}}>
        {[["Leo Yote",today.length,"rgba(212,175,55,0.12)",N],["Inasubiri",today.filter(o=>o.status==="pending").length,"rgba(198,40,40,0.08)",R],["Imekamilika",today.filter(o=>o.status==="done").length,"rgba(27,107,32,0.08)",GR]].map(([l,v,bg,c])=>(
          <div key={l} style={{background:bg,borderRadius:10,padding:10,textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:"24px",fontWeight:900,color:c}}>{v}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>{l}</div></div>
        ))}
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:N,color:G,border:"none",borderRadius:10,padding:12,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>{show?"Funga":"+ Agizo Jipya"}</button>
      {show&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1rem",marginBottom:"1rem",border:`1px solid rgba(212,175,55,0.3)`}}>
          {[["customer","Jina *",""],["phone","Simu","07xx"],["items","Chakula *","Pilau x2"],["total","Jumla (TZS)","10000"],["notes","Maelezo",""]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:8}}><label style={{display:"block",fontSize:"11px",fontFamily:"sans-serif",fontWeight:700,color:"rgba(11,31,69,0.5)",marginBottom:3,textTransform:"uppercase"}}>{l}</label><input value={f[k]} onChange={set(k)} placeholder={p} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box"}}/></div>
          ))}
          <select value={f.service} onChange={set("service")} style={{width:"100%",padding:8,borderRadius:8,border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,background:"#fff",marginBottom:10}}>
            <option value="pickup">Kuchukua</option><option value="delivery">Delivery</option><option value="dinein">Kula Hapa</option><option value="events">Sherehe</option>
          </select>
          <button onClick={save} style={{width:"100%",background:GR,color:"#fff",border:"none",borderRadius:8,padding:10,fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer"}}>Hifadhi</button>
        </div>
      )}
      {today.map(o=>(
        <div key={o.id} style={{background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(11,31,69,0.07)",borderLeft:`4px solid ${o.status==="done"?GR:G}`,opacity:o.status==="done"?0.7:1,display:"flex",gap:8,alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N}}>{o.customer}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.45)",marginTop:1}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})} · {o.service}{o.phone?` · ${o.phone}`:""}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"rgba(11,31,69,0.65)",marginTop:4}}>{o.items}</div>
            {o.total>0&&<div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:G,marginTop:4}}>{fmt(o.total)}</div>}
          </div>
          <button onClick={()=>updateOrderStatus(o.id,o.status==="done"?"pending":"done")} style={{background:o.status==="done"?"rgba(11,31,69,0.08)":GR,color:o.status==="done"?"rgba(11,31,69,0.4)":"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>
            {o.status==="done"?"Imekamilika":"Maliza"}
          </button>
        </div>
      ))}
      {today.length===0&&<p style={{textAlign:"center",padding:"2rem",color:"rgba(11,31,69,0.35)",fontFamily:"sans-serif",fontSize:"13px"}}>Hakuna maagizo leo bado.</p>}
    </div>
  );
}

/* ─── MAIN ADMIN PAGE ─── */
export default function AdminPage({onExit}) {
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("leo");
  if(!authed)return <PinGate onAuth={()=>setAuthed(true)}/>;
  const TABS=[
    {key:"leo",   icon:"ti-chart-bar",      label:"Leo"},
    {key:"akili", icon:"ti-brain",           label:"Akili"},
    {key:"gharama",icon:"ti-receipt",        label:"Gharama"},
    {key:"historia",icon:"ti-calendar",     label:"Historia"},
    {key:"menu",  icon:"ti-tools-kitchen-2", label:"Menyu"},
    {key:"orders",icon:"ti-clipboard-list",  label:"Maagizo"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"#F9F3E8",paddingBottom:"80px"}}>
      <div style={{background:N2,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
        <button onClick={onExit} style={{background:"none",border:"none",color:"rgba(253,245,228,0.5)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"13px",display:"flex",alignItems:"center",gap:6}}><i className="ti ti-arrow-left"/> Rudi</button>
        <span style={{fontFamily:"Georgia,serif",fontSize:"15px",fontWeight:700,color:G}}>Msimamizi</span>
        <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:"rgba(253,245,228,0.4)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"11px"}}>Toka</button>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid rgba(212,175,55,0.2)",display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:"0 0 auto",padding:"9px 12px",border:"none",background:"none",cursor:"pointer",color:tab===t.key?N:"rgba(11,31,69,0.4)",borderBottom:tab===t.key?`2px solid ${G}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:56}}>
            <i className={`ti ${t.icon}`} style={{fontSize:17}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"9px",fontWeight:tab===t.key?700:400,whiteSpace:"nowrap"}}>{t.label}</span>
          </button>
        ))}
      </div>
      {tab==="leo"     &&<LeoTab/>}
      {tab==="akili"   &&<AkiliTab/>}
      {tab==="gharama" &&<GharamaTab/>}
      {tab==="historia"&&<HistoriaTab/>}
      {tab==="menu"    &&<MenuTab/>}
      {tab==="orders"  &&<OrdersTab/>}
    </div>
  );
}
