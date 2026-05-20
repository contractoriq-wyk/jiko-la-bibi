import { useState } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

const G="#D4AF37", N="#0B1F45", N2="#06132E", GR="#1B6B20", R="#C62828";
const fmt = n => "TZS " + Number(n).toLocaleString();

/* ─── PIN GATE ─────────────────────────────────────── */
function PinGate({ onAuth }) {
  const [pin, setPin] = useState(""), [err, setErr] = useState(false);
  const PAD = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  function tap(k) {
    if (k === "") return;
    if (k === "⌫") { setPin(p => p.slice(0,-1)); return; }
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === (business.adminPin || "5566")) { onAuth(); }
      else { setErr(true); setPin(""); setTimeout(() => setErr(false), 1400); }
    }
  }
  return (
    <div style={{minHeight:"100vh",background:N2,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <img src="/logo.png" alt="" width={80} height={80} style={{borderRadius:"50%",border:`2px solid ${G}`,objectFit:"cover",marginBottom:"1.2rem"}} onError={e=>e.target.style.display="none"}/>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"20px",fontWeight:900,color:"#FDF5E4",margin:"0 0 4px"}}>Jiko La Bibi JJJ</h1>
      <p style={{color:"rgba(253,245,228,0.5)",fontSize:"12px",fontFamily:"sans-serif",margin:"0 0 1.8rem"}}>Eneo la Msimamizi</p>
      <div style={{display:"flex",gap:"12px",marginBottom:"1.2rem"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?G:"rgba(253,245,228,0.2)",border:`2px solid ${pin.length>i?G:"rgba(253,245,228,0.3)"}`,transition:"all 0.15s"}}/>
        ))}
      </div>
      {err && <p style={{color:"#ff6b6b",fontFamily:"sans-serif",fontSize:"13px",marginBottom:"1rem"}}>PIN si sahihi.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:"10px"}}>
        {PAD.map((k,i)=>(
          <button key={i} onClick={()=>tap(k)} style={{height:72,borderRadius:"12px",fontSize:"22px",fontWeight:700,fontFamily:"sans-serif",background:k===""?"transparent":"rgba(253,245,228,0.08)",color:k==="⌫"?"rgba(253,245,228,0.5)":"#FDF5E4",border:k===""?"none":"1px solid rgba(253,245,228,0.12)",cursor:k===""?"default":"pointer"}}>{k}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── MENU TAB ──────────────────────────────────────── */
function MenuTab() {
  const {prices,stock,overridePrice,toggleStock} = useAdmin();
  const [editing,setEditing] = useState(null);
  const [val,setVal] = useState("");
  return (
    <div style={{padding:"1rem"}}>
      {sections.map((sec,si)=>{
        const items = menu.filter(m=>m.section===sec.id);
        return (
          <div key={sec.id} style={{marginBottom:"1.2rem"}}>
            <div style={{background:N,borderRadius:"10px 10px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{background:G,color:N2,width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:900,fontFamily:"sans-serif"}}>{si+1}</div>
              <span style={{fontFamily:"Georgia,serif",fontSize:"14px",fontWeight:700,color:G}}>{sec.name.sw}</span>
            </div>
            <div style={{border:`1px solid rgba(11,31,69,0.12)`,borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
              {items.map((item,i)=>{
                const cur = prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
                const oos = !!stock[item.id];
                const ed  = editing===item.id;
                return (
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 14px",background:i%2===0?"#FFFBF3":"#FBF4E4",borderTop:i>0?"1px solid rgba(11,31,69,0.07)":"none",opacity:oos?0.6:1}}>
                    <span style={{fontSize:"20px",flexShrink:0}}>{item.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"Georgia,serif",fontSize:"13px",fontWeight:700,color:N,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name.sw}</div>
                      {oos&&<span style={{fontFamily:"sans-serif",fontSize:"10px",color:R,fontWeight:700}}>IMEISHA</span>}
                    </div>
                    {ed?(
                      <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                        <input type="number" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){overridePrice(item.id,parseInt(val));setEditing(null);}}} autoFocus style={{width:80,padding:"4px 8px",borderRadius:"6px",border:`2px solid ${G}`,fontFamily:"sans-serif",fontSize:"13px",fontWeight:700,color:N,outline:"none"}}/>
                        <button onClick={()=>{overridePrice(item.id,parseInt(val));setEditing(null);}} style={{background:GR,color:"#fff",border:"none",borderRadius:"6px",padding:"5px 10px",fontSize:"12px",cursor:"pointer",fontWeight:700}}>✓</button>
                        <button onClick={()=>setEditing(null)} style={{background:"#ccc",color:"#333",border:"none",borderRadius:"6px",padding:"5px 8px",fontSize:"12px",cursor:"pointer"}}>✕</button>
                      </div>
                    ):(
                      <button onClick={()=>{setEditing(item.id);setVal(String(cur));}} style={{background:"none",border:`1px solid rgba(11,31,69,0.2)`,borderRadius:"6px",padding:"4px 10px",fontFamily:"sans-serif",fontSize:"12px",fontWeight:700,color:prices[item.id]!==undefined?GR:N,cursor:"pointer"}}>{fmt(cur)} ✏️</button>
                    )}
                    <button onClick={()=>toggleStock(item.id)} style={{background:oos?R:"rgba(27,107,32,0.12)",color:oos?"#fff":GR,border:"none",borderRadius:"6px",padding:"4px 8px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",flexShrink:0}}>{oos?"IMEISHA":"IPO"}</button>
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

/* ─── ORDERS TAB ────────────────────────────────────── */
function OrdersTab() {
  const {orders,addOrder,updateOrderStatus} = useAdmin();
  const [show,setShow] = useState(false);
  const [f,setF] = useState({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  function save(){if(!f.customer.trim()||!f.items.trim())return;addOrder({id:Date.now(),time:new Date().toISOString(),...f,total:parseInt(f.total)||0,status:"pending"});setF({customer:"",phone:"",items:"",total:"",service:"pickup",notes:""});setShow(false);}
  const today=orders.filter(o=>new Date(o.time).toDateString()===new Date().toDateString());
  return (
    <div style={{padding:"1rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"1rem"}}>
        {[["Leo Yote",today.length,"rgba(212,175,55,0.12)",N],["Inasubiri",today.filter(o=>o.status==="pending").length,"rgba(198,40,40,0.08)",R],["Imekamilika",today.filter(o=>o.status==="done").length,"rgba(27,107,32,0.08)",GR]].map(([l,v,bg,c])=>(
          <div key={l} style={{background:bg,borderRadius:"10px",padding:"10px",textAlign:"center"}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:"24px",fontWeight:900,color:c}}>{v}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"rgba(11,31,69,0.5)",fontWeight:700}}>{l}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setShow(!show)} style={{width:"100%",background:N,color:G,border:"none",borderRadius:"10px",padding:"12px",fontFamily:"sans-serif",fontSize:"14px",fontWeight:700,cursor:"pointer",marginBottom:"1rem"}}>{show?"✕ Funga":"+ Agizo Jipya"}</button>
      {show&&(
        <div style={{background:"#fff",borderRadius:"12px",padding:"1rem",marginBottom:"1rem",border:`1px solid rgba(212,175,55,0.3)`}}>
          {[["customer","Jina *",""],["phone","Simu","07xx"],["items","Chakula *","Pilau×2"],["total","Jumla (TZS)","10000"],["notes","Maelezo",""]].map(([k,l,p])=>(
            <div key={k} style={{marginBottom:"8px"}}>
              <label style={{display:"block",fontSize:"11px",fontFamily:"sans-serif",fontWeight:700,color:"rgba(11,31,69,0.5)",marginBottom:"3px",textTransform:"uppercase"}}>{l}</label>
              <input value={f[k]} onChange={set(k)} placeholder={p} style={{width:"100%",padding:"8px 10px",borderRadius:"8px",border:"1px solid rgba(11,31,69,0.2)",fontFamily:"sans-serif",fontSize:"13px",color:N,outline:"none",boxSizing:"border-box"}}/>
            </div>
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

/* ─── MAIN ADMIN PAGE ───────────────────────────────── */
export default function AdminPage({ onExit }) {
  const [authed,setAuthed] = useState(false);
  const [tab,setTab]       = useState("menu");
  if (!authed) return <PinGate onAuth={()=>setAuthed(true)} />;
  const TABS=[{key:"menu",icon:"ti-tools-kitchen-2",label:"Menyu"},{key:"orders",icon:"ti-clipboard-list",label:"Maagizo"}];
  return (
    <div style={{minHeight:"100vh",background:"#F9F3E8",paddingBottom:"80px"}}>
      <div style={{background:N2,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
        <button onClick={onExit} style={{background:"none",border:"none",color:"rgba(253,245,228,0.5)",cursor:"pointer",fontFamily:"sans-serif",fontSize:"13px",display:"flex",alignItems:"center",gap:"6px"}}><i className="ti ti-arrow-left"/>Rudi</button>
        <span style={{fontFamily:"Georgia,serif",fontSize:"15px",fontWeight:700,color:G}}>Admin Panel 🔐</span>
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
      {tab==="menu"   && <MenuTab/>}
      {tab==="orders" && <OrdersTab/>}
    </div>
  );
}
