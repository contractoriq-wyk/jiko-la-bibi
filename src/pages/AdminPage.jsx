import { useState } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

const G="#D4AF37",N="#0B1F45",N2="#06132E",GR="#1B6B20",R="#C62828";
const fmt=n=>"TZS "+Number(n).toLocaleString();

function getSuggestions(todaySales,prices) {
  const s=[]; const h=new Date().getHours();
  const gross=todaySales.reduce((a,r)=>a+r.total_price,0);
  const cnt={}; todaySales.forEach(r=>{cnt[r.item_id]=(cnt[r.item_id]||0)+r.quantity;});
  const topId=Object.entries(cnt).sort(([,a],[,b])=>b-a)[0]?.[0];
  const topItem=topId?menu.find(m=>m.id===topId):null;
  if(topItem) s.push({t:"good",msg:`🔥 ${topItem.name.sw} — kiongozi leo (${cnt[topId]} zilizouzwa)`});
  if(gross===0&&h>9) s.push({t:"warn",msg:"📢 Hakuna mauzo bado — hakikisha menyu iko tayari!"});
  if(gross>100000) s.push({t:"good",msg:`🏆 Siku nzuri! Umevuka TZS ${fmt(gross)}`});
  if(gross>0&&gross<20000&&h>14) s.push({t:"warn",msg:"⚠️ Mauzo chini leo — fikiria promotion ya jioni"});
  const hasSec=new Set(todaySales.map(r=>r.section_id));
  const quiet=sections.find(s=>!hasSec.has(s.id)&&h>11);
  if(quiet) s.push({t:"info",msg:`💡 ${quiet.name.sw} haijauza leo — tangaza!`});
  return s.slice(0,3);
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
      <div style={{display:"flex",gap:"12px",marginBottom:"1.2rem"}}>{[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?G:"rgba(253,245,228,0.2)",border:`2px solid ${pin.length>i?G:"rgba(253,245,228,0.3)"}`,transition:"all 0.15s"}}/>)}</div>
      {err&&<p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>PIN si sahihi.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:"10px"}}>
        {PAD.map((k,i)=><button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:"12px",fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":"rgba(253,245,228,0.08)",color:k==="⌫"?"rgba(253,245,228,0.5)":"#FDF5E4",border:k===""?"none":"1px solid rgba(253,245,228,0.12)",cursor:k===""?"default":"pointer"}}>{k}</button>)}
      </div>
    </div>
  );
}

/* ─── MENU TAB ─── */
function MenuTab() {
  const {prices,stock,itemCosts,overridePrice,toggleStock,setCost}=useAdmin();
  const [ed,setEd]=useState(null); const [val,setVal]=useState(""); const [costEd,setCostEd]=useState(null); const [costVal,setCostVal]=useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=>{
        const items=menu.filter(m=>m.section===sec.id);
        return (
          <div key={sec.id} style={{marginBottom:"1.2rem"}}>
            <div style={{background:N,borderRadius:"10px 10px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{background:G,color:N2,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
              <span style={{fontFamily:"Georgia,serif",fontSize:"14px",fontWeight:700,color:G}}>{sec.name.sw}</span>
            </div>
            <div style={{border:`1px solid rgba(11,31,69,0.12)`,borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
              {items.map((item,i)=>{
                const cur=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
                const cost=itemCosts[item.id];
                const oos=!!stock[item.id]; const isEd=ed===item.id; const isCEd=costEd===item.id;
                return (
                  <div key={item.id} style={{padding:"10px 14px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderTop:i>0?"1px solid rgba(11,31,69,0.07)":"none",opacity:oos?0.6:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:isCEd||isEd?"6px":0}}>
                      <span style={{fontSize:"18px"}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
                        {oos&&<span style={{fontFamily:"sans-serif",fontSize:"10px",color:R,fontWeight:700}}>IMEISHA</span>}
                      </div>
                      {isEd?(
                        <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                          <input type="number" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){overridePrice(item.id,parseInt(val));setEd(null);}}} autoFocus style={{width:80,padding:"4px 8px",borderRadius:"6px",border:`2px solid ${G}`,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:N,outline:"none"}}/>
                          <button onClick={()=>{overridePrice(item.id,parseInt(val));setEd(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:"6px",padding:"5px 10px",fontSize:"12px",cursor:"pointer",fontWeight:700}}>✓</button>
                          <button onClick={()=>setEd(null)} style={{background:"#ccc",color:"#333",border:"none",borderRadius:"6px",padding:"5px 8px",fontSize:"12px",cursor:"pointer"}}>✕</button>
                        </div>
                      ):(
                        <button onClick={()=>{setEd(item.id);setVal(String(cur));}} style={{background:"none",border:`1px solid rgba(11,31,69,0.2)`,borderRadius:"6px",padding:"4px 10px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:prices[item.id]!==undefined?GR:N,cursor:"pointer"}}>{fmt(cur)} ✏️</button>
                      )}
                      <button onClick={()=>toggleStock(item.id)} style={{background:oos?R:"rgba(27,107,32,0.12)",color:oos?"#fff":GR,border:"none",borderRadius:"6px",padding:"4px 8px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA":"IPO"}</button>
                    </div>
                    {/* Cost per unit */}
                    <div style={{display:"flex",alignItems:"center",gap:"6px",paddingLeft:"26px"}}>
                      <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)"}}>Gharama ya kupika:</span>
                      {isCEd?(
                        <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                          <input type="number" value={costVal} onChange={e=>setCostVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setCost(item.id,parseInt(costVal));setCostEd(null);}}} autoFocus placeholder="0" style={{width:70,padding:"2px 6px",borderRadius:"4px",border:`1px solid ${G}`,fontFamily:"sans-serif",fontSize:"11px",outline:"none"}}/>
                          <button onClick={()=>{setCost(item.id,parseInt(costVal));setCostEd(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:"4px",padding:"2px 8px",fontSize:"11px",cursor:"pointer",fontWeight:700}}>✓</button>
                        </div>
                      ):(
                        <button onClick={()=>{setCostEd(item.id);setCostVal(String(cost||""));}} style={{background:"none",border:"none",fontFamily:"sans-serif",fontSize:"10px",color:cost?GR:"rgba(11,31,69,0.35)",cursor:"pointer",padding:0}}>
                          {cost?fmt(cost):"Weka gharama ✏️"}
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

/* ─── LEO TAB (OODA DASHBOARD) ─── */
function LeoTab() {
  const {todaySales,prices,itemCosts,todayGross,todayNet,recordSale}=useAdmin();
  const [sec,setSec]=useState(sections[0].id);
  const [item,setItem]=useState(null);
  const [qty,setQty]=useState(1);
  const [svc,setSvc]=useState("pickup");
  const [busy,setBusy]=useState(false);

  const secItems=menu.filter(m=>m.section===sec);
  const suggestions=getSuggestions(todaySales,prices);

  const bySection={};
  todaySales.forEach(s=>{bySection[s.section_id]=(bySection[s.section_id]||0)+s.total_price;});
  const maxRev=Math.max(...Object.values(bySection),1);

  async function doRecord(){
    if(!item||busy)return; setBusy(true);
    await recordSale(item,qty,svc);
    setItem(null); setQty(1); setBusy(false);
  }

  function endOfDay(){
    const cnt={};
    todaySales.forEach(s=>{if(!cnt[s.item_id])cnt[s.item_id]={name:s.item_name,qty:0,rev:0};cnt[s.item_id].qty+=s.quantity;cnt[s.item_id].rev+=s.total_price;});
    const sorted=Object.values(cnt).sort((a,b)=>b.rev-a.rev);
    const lines=[
      `📊 RIPOTI — ${new Date().toLocaleDateString("sw-TZ")}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 Mapato Ghafi: ${fmt(todayGross)}`,
      todayNet!==null?`💵 Faida Halisi: ${fmt(todayNet)}`:"",
      `📦 Jumla ya Mauzo: ${todaySales.length}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      "🏆 Viongozi vya Leo:",
      ...sorted.slice(0,3).map((v,i)=>`${i+1}. ${v.name} ×${v.qty} = ${fmt(v.rev)}`),
      sorted.length>3?`━━━━━━━━━━━━━━━━━━━━`:"",
      sorted.length>3?"📉 Polepole:":``,
      ...sorted.slice(-3).reverse().filter(v=>!sorted.slice(0,3).includes(v)).map(v=>`• ${v.name} ×${v.qty}`),
      `━━━━━━━━━━━━━━━━━━━━`,
      `Unyamwezini Jiko La Bibi JJJ 🇹🇿`,
      `jikolabibijjj.com`,
    ].filter(l=>l!==null&&l!==undefined).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`,"_blank");
  }

  return (
    <div style={{padding:"1rem"}}>
      {/* Revenue hero */}
      <div style={{background:N,borderRadius:"14px",padding:"1.25rem",marginBottom:"1rem",textAlign:"center"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:"rgba(253,245,228,0.45)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"1.5px"}}>Mapato ya Leo</p>
        <p style={{fontFamily:"Georgia,serif",fontSize:"38px",fontWeight:900,color:G,margin:"0 0 2px",lineHeight:1}}>{fmt(todayGross)}</p>
        {todayNet!==null&&<p style={{fontFamily:"sans-serif",fontSize:"13px",color:todayNet>=0?"#4caf50":"#f44336",margin:"0 0 6px",fontWeight:700}}>Faida: {fmt(todayNet)}</p>}
        <p style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(253,245,228,0.35)",margin:0}}>{todaySales.length} mauzo • {new Date().toLocaleDateString("sw-TZ")}</p>
      </div>

      {/* OODA suggestions */}
      {suggestions.length>0&&(
        <div style={{marginBottom:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 6px"}}>🧠 OODA — Ushauri</p>
          {suggestions.map((s,i)=>(
            <div key={i} style={{background:s.t==="good"?"rgba(27,107,32,0.08)":s.t==="warn"?"rgba(198,40,40,0.06)":"rgba(212,175,55,0.08)",borderLeft:`3px solid ${s.t==="good"?GR:s.t==="warn"?R:G}`,borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:"5px",fontFamily:"sans-serif",fontSize:"12px",color:N}}>
              {s.msg}
            </div>
          ))}
        </div>
      )}

      {/* Section revenue bars — Orient */}
      {Object.keys(bySection).length>0&&(
        <div style={{background:"#fff",borderRadius:"12px",padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>📊 Mauzo kwa Sehemu</p>
          {sections.map(s=>{
            const rev=bySection[s.id]||0; if(!rev)return null;
            return (
              <div key={s.id} style={{marginBottom:"7px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                  <span style={{fontFamily:"sans-serif",fontSize:"11px",color:N}}>{s.name.sw.split(" ")[0]}</span>
                  <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:N}}>{fmt(rev)}</span>
                </div>
                <div style={{height:6,background:"rgba(11,31,69,0.08)",borderRadius:3}}>
                  <div style={{height:"100%",width:`${Math.round(rev/maxRev*100)}%`,background:G,borderRadius:3,transition:"width 0.5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick POS — Act */}
      <div style={{background:"#fff",borderRadius:"12px",padding:"1rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(11,31,69,0.07)"}}>
        <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>⚡ Rekodi Mauzo Haraka</p>
        <div style={{display:"flex",gap:"5px",overflowX:"auto",marginBottom:"10px",scrollbarWidth:"none",paddingBottom:"2px"}}>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>{setSec(s.id);setItem(null);}} style={{background:sec===s.id?N:"transparent",color:sec===s.id?G:"rgba(11,31,69,0.5)",border:`1px solid ${sec===s.id?N:"rgba(11,31,69,0.15)"}`,borderRadius:"99px",padding:"4px 10px",whiteSpace:"nowrap",fontFamily:"sans-serif",fontSize:"11px",fontWeight:sec===s.id?700:400,cursor:"pointer",flexShrink:0}}>
              {s.name.sw.split(" ")[0]}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"6px",marginBottom:"10px"}}>
          {secItems.map(it=>{
            const up=prices[it.id]??it.price??(it.sizes?it.sizes[0].price:0);
            return (
              <button key={it.id} onClick={()=>setItem(it)} style={{background:item?.id===it.id?N:"rgba(11,31,69,0.04)",color:item?.id===it.id?G:N,border:`1.5px solid ${item?.id===it.id?N:"rgba(11,31,69,0.12)"}`,borderRadius:"8px",padding:"8px",textAlign:"left",cursor:"pointer"}}>
                <div style={{fontSize:"18px",marginBottom:"2px"}}>{it.emoji}</div>
                <div style={{fontFamily:"Georgia,serif",fontSize:"11px",fontWeight:700,lineHeight:1.2}}>{it.name.sw}</div>
                <div style={{fontFamily:"sans-serif",fontSize:"10px",color:item?.id===it.id?"rgba(212,175,55,0.8)":"rgba(11,31,69,0.4)",marginTop:"2px"}}>{fmt(up)}</div>
              </button>
            );
          })}
        </div>
        {item&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <span style={{fontFamily:"sans-serif",fontSize:"12px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>Idadi:</span>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(11,31,69,0.2)",background:"#fff",fontWeight:900,fontSize:"16px",cursor:"pointer"}}>−</button>
              <span style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:N,minWidth:"24px",textAlign:"center"}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(11,31,69,0.2)",background:"#fff",fontWeight:900,fontSize:"16px",cursor:"pointer"}}>+</button>
              <span style={{marginLeft:"auto",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:G}}>= {fmt((prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0))*qty)}</span>
            </div>
            <div style={{display:"flex",gap:"5px",marginBottom:"10px"}}>
              {[["pickup","Kuchukua"],["delivery","Delivery"],["dinein","Kula Hapa"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSvc(k)} style={{flex:1,padding:"5px 4px",borderRadius:"6px",border:`1px solid ${svc===k?N:"rgba(11,31,69,0.15)"}`,background:svc===k?N:"transparent",color:svc===k?G:"rgba(11,31,69,0.5)",fontFamily:"sans-serif",fontSize:"10px",fontWeight:svc===k?700:400,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <button onClick={doRecord} disabled={busy} style={{width:"100%",background:busy?"rgba(11,31,69,0.3)":GR,color:"#fff",border:"none",borderRadius:"10px",padding:"12px",fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:busy?"default":"pointer"}}>
              {busy?"Inahifadhi...":` ✓ REKODI — ${item.name.sw} ×${qty}`}
            </button>
          </div>
        )}
      </div>

      {/* Sales log */}
      {todaySales.length>0&&(
        <div style={{marginBottom:"1rem"}}>
          <p style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:700,color:"rgba(11,31,69,0.4)",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>📋 Mauzo ya Leo ({todaySales.length})</p>
          {todaySales.slice(0,10).map((s,i)=>(
            <div key={s.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderRadius:"8px",marginBottom:"4px"}}>
              <div>
                <span style={{fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:N}}>{s.item_name}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.4)",marginLeft:"5px"}}>×{s.quantity}</span>
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <span style={{fontFamily:"sans-serif",fontSize:"11px",fontWeight:700,color:G}}>{fmt(s.total_price)}</span>
                <span style={{fontFamily:"sans-serif",fontSize:"9px",color:"rgba(11,31,69,0.35)"}}>{new Date(s.created_at).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End of day report */}
      <button onClick={endOfDay} style={{width:"100%",background:`rgba(212,175,55,0.12)`,color:N,border:`1.5px solid ${G}`,borderRadius:"10px",padding:"12px",fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,cursor:"pointer"}}>
        📊 Ripoti ya Mwisho wa Siku → WhatsApp
      </button>
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"1rem"}}>
        {[["Leo Yote",today.length,"rgba(212,175,55,0.12)",N],["Inasubiri",today.filter(o=>o.status==="pending").length,"rgba(198,40,40,0.08)",R],["Imekamilika",today.filter(o=>o.status==="done").length,"rgba(27,107,32,0.08)",GR]].map(([l,v,bg,c])=>(
          <div key={l} style={{background:bg,borderRadius:"10px",padding:"10px",textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:"24px",fontWeight:900,color:c}}>{v}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>{l}</div></div>
        ))}
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:N,color:G,border:"none",borderRadius:"10px",padding:"12px",fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>{show?"✕ Funga":"+ Agizo Jipya"}</button>
      {show&&(
        <div style={{background:"#fff",borderRadius:"12px",padding:"1rem",marginBottom:"1rem",border:`1px solid rgba(212,175,55,0.3)`}}>
          {[["customer","Jina *",""],["phone","Simu","07xx"],["items","Chakula *","Pilau×2"],["total","Jumla (TZS)","10000"],["notes","Maelezo",""]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:"8px"}}><label style={{display:"block",fontSize:"11px",fontFamily:"sans-serif",fontWeight:700,color:"rgba(11,31,69,0.5)",marginBottom:"3px",textTransform:"uppercase"}}>{l}</label><input value={f[k]} onChange={set(k)} placeholder={p} style={{width:"100%",padding:"8px 10px",borderRadius:"8px",border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box"}}/></div>
          ))}
          <select value={f.service} onChange={set("service")} style={{width:"100%",padding:"8px",borderRadius:"8px",border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,background:"#fff",marginBottom:"10px"}}>
            <option value="pickup">Kuchukua</option><option value="delivery">Delivery</option><option value="dinein">Kula Hapa</option><option value="events">Sherehe</option>
          </select>
          <button onClick={save} style={{width:"100%",background:GR,color:"#fff",border:"none",borderRadius:"8px",padding:"10px",fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer"}}>✓ Hifadhi</button>
        </div>
      )}
      {today.map(o=>(
        <div key={o.id} style={{background:"#fff",borderRadius:"12px",padding:"12px 14px",marginBottom:"8px",boxShadow:"0 2px 8px rgba(11,31,69,0.07)",borderLeft:`4px solid ${o.status==="done"?GR:G}`,opacity:o.status==="done"?0.7:1,display:"flex",gap:"8px",alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N}}>{o.customer}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"rgba(11,31,69,0.45)",marginTop:"1px"}}>{new Date(o.time).toLocaleTimeString("sw",{hour:"2-digit",minute:"2-digit"})} · {o.service}{o.phone?` · ${o.phone}`:""}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"rgba(11,31,69,0.65)",marginTop:"4px"}}>{o.items}</div>
            {o.total>0&&<div style={{fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:G,marginTop:"4px"}}>{fmt(o.total)}</div>}
          </div>
          <button onClick={()=>updateOrderStatus(o.id,o.status==="done"?"pending":"done")} style={{background:o.status==="done"?"rgba(11,31,69,0.08)":GR,color:o.status==="done"?"rgba(11,31,69,0.4)":"#fff",border:"none",borderRadius:"8px",padding:"6px 10px",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>
            {o.status==="done"?"✓ Imekamilika":"Maliza"}
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
    {key:"leo",   icon:"ti-chart-bar",    label:"Leo"},
    {key:"menu",  icon:"ti-tools-kitchen-2",label:"Menyu"},
    {key:"orders",icon:"ti-clipboard-list",label:"Maagizo"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"#F9F3E8",paddingBottom:"80px"}}>
      <div style={{background:N2,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
        <button onClick={onExit} style={{background:"none",border:"none",color:"rgba(253,245,228,0.5)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"13px",display:"flex",alignItems:"center",gap:"6px"}}><i className="ti ti-arrow-left"/>Rudi</button>
        <span style={{fontFamily:"Georgia,serif",fontSize:"15px",fontWeight:700,color:G}}>Msimamizi 🔐</span>
        <button onClick={()=>setAuthed(false)} style={{background:"none",border:"none",color:"rgba(253,245,228,0.4)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"11px"}}>Toka</button>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid rgba(212,175,55,0.2)",display:"flex"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,padding:"10px 4px",border:"none",background:"none",cursor:"pointer",color:tab===t.key?N:"rgba(11,31,69,0.4)",borderBottom:tab===t.key?`2px solid ${G}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
            <i className={`ti ${t.icon}`} style={{fontSize:"18px"}}/>
            <span style={{fontFamily:"sans-serif",fontSize:"10px",fontWeight:tab===t.key?700:400}}>{t.label}</span>
          </button>
        ))}
      </div>
      {tab==="leo"   &&<LeoTab/>}
      {tab==="menu"  &&<MenuTab/>}
      {tab==="orders"&&<OrdersTab/>}
    </div>
  );
}
