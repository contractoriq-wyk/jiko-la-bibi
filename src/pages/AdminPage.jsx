import { useState } from "react";
import { menu, sections } from "../data/menu";
import { business } from "../data/businessConfig";
import { useAdmin } from "../admin/AdminContext";

const GOLD  = "#D4AF37";
const NAVY  = "#0B1F45";
const NAVY2 = "#06132E";
const GREEN = "#1B6B20";
const RED   = "#C62828";

/* ── helpers ── */
function fmt(n) { return "TZS " + Number(n).toLocaleString("en-US"); }

/* ══════════════════════════════════════════════════════════
   PIN GATE
══════════════════════════════════════════════════════════ */
function PinGate({ onAuth }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  function tryPin(p) {
    if (p === business.adminPin) { onAuth(); }
    else if (p.length === 4) { setErr(true); setPin(""); setTimeout(() => setErr(false), 1500); }
  }

  const PAD = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div style={{ minHeight:"100vh", background:NAVY2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <img src="/logo.png" alt="" width={80} height={80} style={{ borderRadius:"50%", border:`2px solid ${GOLD}`, objectFit:"cover", marginBottom:"1.5rem" }} onError={e=>e.target.style.display="none"} />
      <h1 style={{ fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:900, color:"#FDF5E4", margin:"0 0 4px" }}>Jiko La Bibi JJJ</h1>
      <p style={{ color:"rgba(253,245,228,0.55)", fontSize:"13px", fontFamily:"sans-serif", margin:"0 0 2rem" }}>Eneo la Msimamizi</p>

      {/* PIN dots */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"1.5rem" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:14, height:14, borderRadius:"50%",
            background: pin.length > i ? GOLD : "rgba(253,245,228,0.2)",
            border:`2px solid ${pin.length > i ? GOLD : "rgba(253,245,228,0.3)"}`,
            transition:"all 0.15s",
          }} />
        ))}
      </div>

      {err && <p style={{ color:"#ff6b6b", fontFamily:"sans-serif", fontSize:"13px", marginBottom:"1rem" }}>PIN si sahihi. Jaribu tena.</p>}

      {/* Numpad */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 72px)", gap:"10px" }}>
        {PAD.map((k, i) => (
          <button key={i}
            onClick={() => {
              if (k === "") return;
              if (k === "⌫") { setPin(p => p.slice(0,-1)); return; }
              const next = pin + k;
              setPin(next);
              if (next.length === 4) tryPin(next);
            }}
            style={{
              height:72, borderRadius:"12px", fontSize:"22px", fontWeight:700,
              fontFamily:"sans-serif",
              background: k === "" ? "transparent" : "rgba(253,245,228,0.08)",
              color: k === "⌫" ? "rgba(253,245,228,0.5)" : "#FDF5E4",
              border: k === "" ? "none" : "1px solid rgba(253,245,228,0.12)",
              cursor: k === "" ? "default" : "pointer",
            }}
          >{k}</button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MENU TAB — price editor + stock toggle
══════════════════════════════════════════════════════════ */
function MenuTab() {
  const { prices, stock, overridePrice, toggleStock } = useAdmin();
  const [editing, setEditing] = useState(null); // item id being edited
  const [editVal, setEditVal]  = useState("");
  const [changed, setChanged]  = useState({});

  function startEdit(item) {
    const current = prices[item.id] !== undefined ? prices[item.id] : (item.price || (item.sizes ? item.sizes[0].price : 0));
    setEditing(item.id);
    setEditVal(String(current));
  }

  function saveEdit(item) {
    const n = parseInt(editVal);
    if (isNaN(n) || n < 0) return;
    overridePrice(item.id, n);
    setChanged(c => ({ ...c, [item.id]: n }));
    setEditing(null);
  }

  const hasChanges = Object.keys(changed).length > 0;

  function exportChanges() {
    const lines = Object.entries(changed).map(([id, price]) => {
      const item = menu.find(m => m.id === id);
      return `  // ${item?.name.sw || id}\n  // Change price to: ${fmt(price)}\n  { id:"${id}", ..., price:${price} },`;
    });
    const text = "// Changes to make in src/data/menu.js:\n\n" + lines.join("\n\n");
    navigator.clipboard?.writeText(text);
    alert("Maelezo yanakiliwa! Nenda GitHub → src/data/menu.js → hariri bei.");
  }

  return (
    <div style={{ padding:"1rem" }}>
      {hasChanges && (
        <div style={{ background:"rgba(212,175,55,0.12)", border:`1px solid ${GOLD}`, borderRadius:"10px", padding:"10px 14px", marginBottom:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"sans-serif", fontSize:"13px", color:NAVY }}>
            Mabadiliko {Object.keys(changed).length} — bei zimehifadhiwa kwenye kifaa
          </span>
          <button onClick={exportChanges} style={{ background:NAVY, color:GOLD, border:"none", borderRadius:"8px", padding:"6px 14px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" }}>
            📤 Toa GitHub
          </button>
        </div>
      )}

      {sections.map(sec => {
        const items = menu.filter(m => m.section === sec.id);
        return (
          <div key={sec.id} style={{ marginBottom:"1.5rem" }}>
            {/* Section header */}
            <div style={{ background:NAVY, borderRadius:"10px 10px 0 0", padding:"10px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ background:GOLD, color:NAVY2, width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:900, fontFamily:"sans-serif", flexShrink:0 }}>
                {sections.indexOf(sec)+1}
              </div>
              <span style={{ fontFamily:"Georgia,serif", fontSize:"14px", fontWeight:700, color:GOLD }}>{sec.name.sw}</span>
            </div>

            {/* Items */}
            <div style={{ border:`1px solid rgba(11,31,69,0.12)`, borderTop:"none", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
              {items.map((item, i) => {
                const currentPrice = prices[item.id] !== undefined ? prices[item.id] : (item.price || (item.sizes ? item.sizes[0].price : 0));
                const oos = !!stock[item.id];
                const isEditing = editing === item.id;

                return (
                  <div key={item.id} style={{
                    display:"flex", alignItems:"center", gap:"10px",
                    padding:"10px 14px",
                    background: i%2===0 ? "#FFFBF3" : "#FBF4E4",
                    borderTop: i>0 ? "1px solid rgba(11,31,69,0.07)" : "none",
                    opacity: oos ? 0.6 : 1,
                  }}>
                    {/* Emoji */}
                    <span style={{ fontSize:"22px", flexShrink:0 }}>{item.emoji}</span>

                    {/* Name */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", fontWeight:700, color:NAVY, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.name.sw}
                      </div>
                      {oos && <span style={{ fontFamily:"sans-serif", fontSize:"10px", color:RED, fontWeight:700 }}>IMEISHA</span>}
                      {item.sizes && <span style={{ fontFamily:"sans-serif", fontSize:"10px", color:"rgba(11,31,69,0.4)" }}>S/M/L</span>}
                    </div>

                    {/* Price / Edit */}
                    {isEditing ? (
                      <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
                        <input
                          type="number"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if(e.key==="Enter") saveEdit(item); if(e.key==="Escape") setEditing(null); }}
                          autoFocus
                          style={{ width:80, padding:"4px 8px", borderRadius:"6px", border:`2px solid ${GOLD}`, fontFamily:"sans-serif", fontSize:"13px", fontWeight:700, color:NAVY, outline:"none" }}
                        />
                        <button onClick={() => saveEdit(item)} style={{ background:GREEN, color:"#fff", border:"none", borderRadius:"6px", padding:"5px 10px", fontSize:"12px", cursor:"pointer", fontWeight:700 }}>✓</button>
                        <button onClick={() => setEditing(null)} style={{ background:"#ccc", color:"#333", border:"none", borderRadius:"6px", padding:"5px 8px", fontSize:"12px", cursor:"pointer" }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                        <button onClick={() => startEdit(item)} style={{
                          background:"none", border:`1px solid rgba(11,31,69,0.2)`,
                          borderRadius:"6px", padding:"4px 10px",
                          fontFamily:"sans-serif", fontSize:"12px", fontWeight:700,
                          color: prices[item.id] !== undefined ? GREEN : NAVY,
                          cursor:"pointer",
                        }}>
                          {fmt(currentPrice)} ✏️
                        </button>
                      </div>
                    )}

                    {/* Stock toggle */}
                    <button onClick={() => toggleStock(item.id)} style={{
                      background: oos ? RED : "rgba(27,107,32,0.12)",
                      color: oos ? "#fff" : GREEN,
                      border:"none", borderRadius:"6px",
                      padding:"4px 8px", fontSize:"10px", fontWeight:700,
                      cursor:"pointer", fontFamily:"sans-serif", flexShrink:0,
                    }}>
                      {oos ? "IMEISHA" : "IPO"}
                    </button>
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

/* ══════════════════════════════════════════════════════════
   ORDERS TAB — log and track orders
══════════════════════════════════════════════════════════ */
function OrdersTab() {
  const { orders, addOrder, updateOrderStatus } = useAdmin();
  const [form, setForm] = useState({ customer:"", phone:"", items:"", total:"", service:"pickup", notes:"" });
  const [showForm, setShowForm] = useState(false);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  function submitOrder() {
    if (!form.customer.trim() || !form.items.trim()) return;
    addOrder({
      id: Date.now(),
      time: new Date().toISOString(),
      ...form,
      total: parseInt(form.total) || 0,
      status: "pending",
    });
    setForm({ customer:"", phone:"", items:"", total:"", service:"pickup", notes:"" });
    setShowForm(false);
  }

  const today = orders.filter(o => new Date(o.time).toDateString() === new Date().toDateString());
  const pending = today.filter(o => o.status === "pending");
  const done    = today.filter(o => o.status === "done");

  const SMAP = { pickup:"Kuchukua", delivery:"Delivery", dinein:"Kula Hapa", events:"Sherehe" };

  return (
    <div style={{ padding:"1rem" }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"1rem" }}>
        {[
          { label:"Leo Yote",   val:today.length,   bg:"rgba(212,175,55,0.12)", color:NAVY },
          { label:"Inasubiri", val:pending.length, bg:"rgba(198,40,40,0.08)",   color:RED  },
          { label:"Zimekamilika", val:done.length,  bg:"rgba(27,107,32,0.08)",   color:GREEN},
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, borderRadius:"10px", padding:"10px", textAlign:"center" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"24px", fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"rgba(11,31,69,0.5)", fontWeight:700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* New order button */}
      <button onClick={() => setShowForm(!showForm)} style={{
        width:"100%", background:NAVY, color:GOLD, border:"none",
        borderRadius:"10px", padding:"12px", fontFamily:"sans-serif",
        fontSize:"14px", fontWeight:700, cursor:"pointer", marginBottom:"1rem",
      }}>
        {showForm ? "✕ Funga" : "+ Agizo Jipya"}
      </button>

      {/* New order form */}
      {showForm && (
        <div style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1rem", marginBottom:"1rem", border:`1px solid rgba(212,175,55,0.3)`, boxShadow:"0 3px 14px rgba(11,31,69,0.08)" }}>
          <h3 style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:NAVY, margin:"0 0 0.8rem" }}>Ingiza Agizo Jipya</h3>
          {[
            { key:"customer", label:"Jina la Mteja *", placeholder:"Jina kamili" },
            { key:"phone",    label:"Namba ya Simu",  placeholder:"07xx xxx xxx" },
            { key:"items",    label:"Chakula *",      placeholder:"Mf: Pilau×2, Chai×1" },
            { key:"total",    label:"Jumla (TZS)",   placeholder:"10000" },
            { key:"notes",    label:"Maelezo",        placeholder:"Mf: bila pilipili" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:"8px" }}>
              <label style={{ display:"block", fontSize:"11px", fontFamily:"sans-serif", fontWeight:700, color:"rgba(11,31,69,0.5)", marginBottom:"3px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{f.label}</label>
              <input value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder}
                style={{ width:"100%", padding:"8px 10px", borderRadius:"8px", border:"1px solid rgba(11,31,69,0.2)", fontFamily:"sans-serif", fontSize:"13px", color:NAVY, outline:"none", boxSizing:"border-box" }}
              />
            </div>
          ))}
          {/* Service */}
          <div style={{ marginBottom:"10px" }}>
            <label style={{ display:"block", fontSize:"11px", fontFamily:"sans-serif", fontWeight:700, color:"rgba(11,31,69,0.5)", marginBottom:"3px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Huduma</label>
            <select value={form.service} onChange={set("service")} style={{ width:"100%", padding:"8px", borderRadius:"8px", border:"1px solid rgba(11,31,69,0.2)", fontFamily:"sans-serif", fontSize:"13px", color:NAVY, background:"#fff" }}>
              <option value="pickup">Kuchukua</option>
              <option value="delivery">Delivery</option>
              <option value="dinein">Kula Hapa</option>
              <option value="events">Sherehe</option>
            </select>
          </div>
          <button onClick={submitOrder} style={{ width:"100%", background:GREEN, color:"#fff", border:"none", borderRadius:"8px", padding:"10px", fontFamily:"sans-serif", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
            ✓ Hifadhi Agizo
          </button>
        </div>
      )}

      {/* Orders list */}
      {today.length === 0 ? (
        <div style={{ textAlign:"center", padding:"2rem", color:"rgba(11,31,69,0.35)", fontFamily:"sans-serif", fontSize:"13px" }}>
          Hakuna maagizo leo bado.
        </div>
      ) : (
        <div>
          {today.map(o => {
            const t = new Date(o.time);
            const timeStr = t.toLocaleTimeString("sw-TZ", { hour:"2-digit", minute:"2-digit" });
            return (
              <div key={o.id} style={{
                background:"#FFFFFF", borderRadius:"12px", padding:"12px 14px",
                marginBottom:"8px", boxShadow:"0 2px 8px rgba(11,31,69,0.07)",
                borderLeft:`4px solid ${o.status === "done" ? GREEN : GOLD}`,
                opacity: o.status === "done" ? 0.7 : 1,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", fontWeight:700, color:NAVY }}>{o.customer}</div>
                    <div style={{ fontFamily:"sans-serif", fontSize:"11px", color:"rgba(11,31,69,0.45)", marginTop:"1px" }}>
                      {timeStr} · {SMAP[o.service] || o.service}
                      {o.phone && ` · ${o.phone}`}
                    </div>
                    <div style={{ fontFamily:"sans-serif", fontSize:"12px", color:"rgba(11,31,69,0.65)", marginTop:"4px" }}>{o.items}</div>
                    {o.notes && <div style={{ fontFamily:"sans-serif", fontSize:"11px", color:"rgba(11,31,69,0.4)", fontStyle:"italic", marginTop:"2px" }}>{o.notes}</div>}
                    {o.total > 0 && <div style={{ fontFamily:"sans-serif", fontSize:"13px", fontWeight:700, color:GOLD, marginTop:"4px" }}>{fmt(o.total)}</div>}
                  </div>
                  <button
                    onClick={() => updateOrderStatus(o.id, o.status === "done" ? "pending" : "done")}
                    style={{
                      background: o.status === "done" ? "rgba(11,31,69,0.08)" : GREEN,
                      color: o.status === "done" ? "rgba(11,31,69,0.4)" : "#fff",
                      border:"none", borderRadius:"8px", padding:"6px 10px",
                      fontSize:"11px", fontWeight:700, cursor:"pointer",
                      fontFamily:"sans-serif", flexShrink:0,
                    }}
                  >
                    {o.status === "done" ? "✓ Imekamilika" : "Maliza"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════════════ */
function SettingsTab({ onLogout }) {
  const { prices, stock, orders } = useAdmin();
  const priceCount = Object.keys(prices).length;
  const oos        = Object.values(stock).filter(Boolean).length;
  const totalOrders = orders.length;

  function clearData(key, label) {
    if (window.confirm(`Futa ${label}?`)) {
      localStorage.removeItem(key);
      window.location.reload();
    }
  }

  return (
    <div style={{ padding:"1rem" }}>
      {/* Business info */}
      <div style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1.25rem", marginBottom:"1rem", boxShadow:"0 2px 8px rgba(11,31,69,0.07)", borderLeft:`4px solid ${GOLD}` }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:NAVY, margin:"0 0 0.8rem" }}>📋 Maelezo ya Biashara</h3>
        {[
          ["Jina",       business.name],
          ["Simu",       business.phoneDisplay],
          ["Mahali",     `${business.area}, ${business.city}`],
          ["Lipa Namba", business.lipaNamba],
          ["Saa",        business.hours_sw],
        ].map(([k,v]) => (
          <div key={k} style={{ display:"flex", gap:"8px", marginBottom:"6px" }}>
            <span style={{ fontSize:"11px", fontFamily:"sans-serif", fontWeight:700, color:"rgba(11,31,69,0.4)", minWidth:80, textTransform:"uppercase", letterSpacing:"0.5px", paddingTop:"1px" }}>{k}</span>
            <span style={{ fontSize:"13px", fontFamily:"Georgia,serif", color:NAVY, flex:1 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Data stats */}
      <div style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1.25rem", marginBottom:"1rem", boxShadow:"0 2px 8px rgba(11,31,69,0.07)" }}>
        <h3 style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:NAVY, margin:"0 0 0.8rem" }}>📊 Takwimu</h3>
        {[
          ["Bei zilizobadilishwa", priceCount],
          ["Bidhaa zimeisha stock", oos],
          ["Jumla ya Maagizo", totalOrders],
        ].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
            <span style={{ fontFamily:"sans-serif", fontSize:"13px", color:"rgba(11,31,69,0.6)" }}>{k}</span>
            <span style={{ fontFamily:"sans-serif", fontSize:"13px", fontWeight:700, color:NAVY }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ background:"rgba(198,40,40,0.05)", borderRadius:"12px", padding:"1.25rem", border:"1px solid rgba(198,40,40,0.2)" }}>
        <h3 style={{ fontFamily:"sans-serif", fontSize:"13px", fontWeight:700, color:RED, margin:"0 0 0.8rem" }}>Eneo Hatari</h3>
        {[
          ["Futa Bei Zilizobadilishwa", "jiko-prices", "bei"],
          ["Futa Hali ya Stock",        "jiko-stock",  "stock"],
          ["Futa Historia ya Maagizo",  "jiko-orders", "maagizo"],
        ].map(([label, key, name]) => (
          <button key={key} onClick={() => clearData(key, name)} style={{
            width:"100%", background:"#fff", color:RED,
            border:`1px solid ${RED}`, borderRadius:"8px",
            padding:"8px", fontFamily:"sans-serif", fontSize:"12px",
            fontWeight:700, cursor:"pointer", marginBottom:"6px", display:"block",
          }}>
            {label}
          </button>
        ))}
      </div>

      <button onClick={onLogout} style={{
        width:"100%", background:NAVY, color:"rgba(253,245,228,0.5)",
        border:"none", borderRadius:"10px", padding:"12px",
        fontFamily:"sans-serif", fontSize:"13px", fontWeight:700,
        cursor:"pointer", marginTop:"1rem",
      }}>
        🔒 Toka (Logout)
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
══════════════════════════════════════════════════════════ */
export default function AdminPage({ onExit }) {
  const [authed, setAuthed] = useState(false);
  const [tab,    setTab]    = useState("menu");

  if (!authed) return <PinGate onAuth={() => setAuthed(true)} />;

  const TABS = [
    { key:"menu",    icon:"ti-tools-kitchen-2", label:"Menyu" },
    { key:"orders",  icon:"ti-clipboard-list",  label:"Maagizo" },
    { key:"settings",icon:"ti-settings",        label:"Mipangilio" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F9F3E8", paddingBottom:"80px" }}>
      {/* Header */}
      <div style={{ background:NAVY2, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
        <button onClick={onExit} style={{ background:"none", border:"none", color:"rgba(253,245,228,0.5)", cursor:"pointer", fontFamily:"sans-serif", fontSize:"13px", display:"flex", alignItems:"center", gap:"6px" }}>
          <i className="ti ti-arrow-left" />
          Rudi
        </button>
        <span style={{ fontFamily:"Georgia,serif", fontSize:"15px", fontWeight:700, color:GOLD }}>Admin Panel</span>
        <span style={{ fontSize:"16px" }}>🔐</span>
      </div>

      {/* Tab bar */}
      <div style={{ background:"#FFFFFF", borderBottom:"1px solid rgba(212,175,55,0.2)", display:"flex" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:"10px 4px", border:"none",
            background:"none", cursor:"pointer",
            color: tab===t.key ? NAVY : "rgba(11,31,69,0.4)",
            borderBottom: tab===t.key ? `2px solid ${GOLD}` : "2px solid transparent",
            transition:"all 0.2s",
            display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
          }}>
            <i className={`ti ${t.icon}`} style={{ fontSize:"18px" }} />
            <span style={{ fontFamily:"sans-serif", fontSize:"10px", fontWeight: tab===t.key ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "menu"     && <MenuTab />}
      {tab === "orders"   && <OrdersTab />}
      {tab === "settings" && <SettingsTab onLogout={() => setAuthed(false)} />}
    </div>
  );
}
