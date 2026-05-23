import { useState, useRef } from "react";
import { sections, menu } from "./data/menu";
import { useCart } from "./cart/CartContext";
import { business } from "./data/businessConfig";
import Header      from "./components/Header";
import Hero        from "./components/Hero";
import ServiceBar  from "./components/ServiceBar";
import BottomNav   from "./components/BottomNav";
import ItemModal    from "./components/ItemModal";
import CartDrawer   from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AdminPage    from "./pages/AdminPage";

const GOLD  = "#D4AF37";
const NAVY  = "#0B1F45";
const NAVY2 = "#06132E";
const MQ    = "VYAKULA VYA NYUMBANI  *  BEI NAFUU  *  HUDUMA BORA  *  PICKUP  *  DELIVERY  *  MATUKIO  *  ";

function BottomBanner() {
  return (
    <div style={{ position:"relative", overflow:"hidden", marginTop:"2.5rem" }}>
      <div style={{ backgroundImage:"url(/banner.jpg)", backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(0.45)", position:"absolute", inset:0 }} />
      <div style={{ position:"relative", zIndex:1, background:"rgba(6,19,46,0.68)", padding:"3.5rem 1.5rem 4rem", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>
          Karibu <span style={{ color:GOLD }}>Unyamwezini Jiko La Bibi JJJ</span>
        </h2>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.72)", fontSize:"14px", margin:"0 0 1.6rem" }}>
          Taste of Tanzania in DAR
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"18px", justifyContent:"center" }}>
          {[
            { icon:"ti-map-pin", text:"Mbezi Luis, Goba Road, Dar es Salaam" },
            { icon:"ti-brand-whatsapp", text:"+255 655 709 024" },
            { icon:"ti-clock", text:"Kila siku: 7:00 - 21:00" },
          ].map((r,i) => (
            <div key={i} style={{ color:"#FDF5E4", fontFamily:"sans-serif", fontSize:"13px", display:"flex", alignItems:"center", gap:"7px" }}>
              <i className={"ti " + r.icon} style={{ color:GOLD, fontSize:"15px" }} />
              {r.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HOME PAGE — poster menu replaces section cards
══════════════════════════════════════════════════════ */
function HomePage() {
  return (
    <div>
      <Hero />

      <div style={{ background:GOLD, overflow:"hidden", padding:"9px 0" }}>
        <div className="mq-run">
          {[1,2].map(n => (
            <span key={n} style={{ color:NAVY2, fontSize:"15px", fontWeight:700, letterSpacing:"2px", padding:"0 24px", fontFamily:"sans-serif" }}>
              {MQ.repeat(3)}
            </span>
          ))}
        </div>
      </div>

      <ServiceBar />

      {/* ── POSTER MENU EMBEDDED ── */}
      <div style={{ padding:"1.2rem 0 0" }}>
        <h2 style={{
          fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:700,
          color:NAVY, margin:"0 0 1rem", textAlign:"center", padding:"0 1rem",
        }}>
          Menyu Yetu
        </h2>
        <iframe
          src="/menu.html"
          title="Menyu - Jiko La Bibi JJJ"
          style={{
            width:"100%",
            height:"2200px",
            border:"none",
            display:"block",
          }}
          scrolling="no"
        />
      </div>

      <BottomBanner />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MENU PAGE — full screen poster
══════════════════════════════════════════════════════ */
function MenuPage() {
  return (
    <iframe
      src="/menu.html"
      title="Menyu - Jiko La Bibi JJJ"
      style={{
        width:"100%",
        height:"calc(100vh - 130px)",
        border:"none",
        display:"block",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════ */
function AboutPage() {
  const info = [
    { icon:"ti-map-pin", label:"Mahali", value:"Mbezi Luis, Goba Road (Chingwalu St), Dar es Salaam" },
    { icon:"ti-brand-whatsapp", label:"WhatsApp", value:"+255 655 709 024" },
    { icon:"ti-clock", label:"Saa za Kazi", value:"Kila siku: 7:00 asubuhi - 9:00 usiku" },
    { icon:"ti-credit-card", label:"Lipa Namba", value:business.lipaNamba + " - " + business.lipaName },
    { icon:"ti-wifi", label:"WiFi", value:"WiFi ya Bure kwa Wateja wote" },
    { icon:"ti-device-tv", label:"Burudani", value:"Michezo na Entertainment kwa Wateja" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"3rem 1.5rem 2rem", textAlign:"center" }}>
        <img src="/logo.png" alt="logo" width={120} height={120} style={{ borderRadius:"50%", border:"3px solid "+GOLD, objectFit:"cover", marginBottom:"1rem" }} onError={e => { e.target.style.display="none"; }} />
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Kuhusu Sisi</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.70)", fontSize:"15px", margin:0 }}>Taste of Tanzania in DAR</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"2rem 1rem" }}>
        <div style={{ background:"#FFFFFF", borderRadius:"16px", padding:"2rem", marginBottom:"1.5rem", boxShadow:"0 3px 14px rgba(11,31,69,0.08)", borderLeft:"5px solid "+GOLD }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:"20px", color:NAVY, margin:"0 0 1rem" }}>Hadithi Yetu</h2>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>Karibu kwenye mkusanyiko wa familia - mahali ambapo chakula halisi cha Tanzania kinaandaliwa kwa upendo na mikono ya Bibi wetu.</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>Jiko La Bibi JJJ si mkahawa tu - ni nyumbani. Tunaamini kwamba chakula bora kinatoka moyoni, kikipikwa na malighafi ya asili ya Tanzania.</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:0 }}>Bibi Veneranda ndiye moyo wa jiko letu. Mapishi yake yamepitishwa kutoka kizazi hadi kizazi - tangu Unyamwezini hadi Dar es Salaam.</p>
        </div>
        <div style={{ display:"grid", gap:"12px", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
          {info.map((item,i) => (
            <div key={i} style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1rem 1.25rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <i className={"ti "+item.icon} style={{ fontSize:"20px", color:GOLD, flexShrink:0, marginTop:"2px" }} />
              <div>
                <div style={{ fontSize:"10px", fontFamily:"sans-serif", fontWeight:700, color:"rgba(11,31,69,0.4)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"3px" }}>{item.label}</div>
                <div style={{ fontSize:"14px", fontFamily:"Georgia,serif", color:NAVY }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomBanner />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   POLICY PAGE
══════════════════════════════════════════════════════ */
function PolicyPage() {
  const policies = [
    { icon:"ti-clipboard-list", title:"1. Sera ya Maagizo", body:"Maagizo yanakubaliwa kupitia WhatsApp, simu, au tovuti yetu\nChakula cha kawaida hutayarishwa ndani ya dakika 15-30\nMaagizo ya matukio (Events) yanahitaji siku 2-3 za mapema\nTunashughulikia: Kuchukua, Delivery, Kula Hapa, na Matukio" },
    { icon:"ti-credit-card", title:"2. Sera ya Malipo", body:"Tunakubali: Lipa Namba (18873261), Mixx by Yas, Airtel Money, Pesa Taslimu\nMalipo yanaweza fanywa kabla au wakati wa kupokea chakula\nRisiti hutolewa kwa maombi yoyote" },
    { icon:"ti-bike", title:"3. Sera ya Delivery", body:"Tunahudumia maeneo ya Dar es Salaam\nGharama ya delivery inategemea umbali - wasiliana nasi\nMuda wa delivery: ndani ya saa 1 baada ya chakula kutayarishwa" },
    { icon:"ti-refresh", title:"4. Sera ya Kurejesha", body:"Kurejesha pesa kunafanyika ikiwa agizo halikutimizwa kwa sababu yetu\nKanselo baada ya dakika 15 linaweza kulipishwa asilimia 30\nMalalamiko yashughulikiwe haraka kupitia WhatsApp" },
    { icon:"ti-shield-check", title:"5. Kanuni ya Chakula", body:"Chakula chetu kinapikwa kwa viungo vya asili, bila kemikali za ziada\nHatuna dhamana kamili ya kukosa alerji - tafadhali tuambie mapema\nBei zinaweza kubadilika bila taarifa ya awali\nLeseni: BL01396922025-2605162556 | TIN: 192-791-243" },
    { icon:"ti-lock", title:"6. Sera ya Faragha", body:"Habari zako za kibinafsi (jina, simu) zinakingwa na sisi\nTunatumia maelezo yako kwa mawasiliano ya agizo lako pekee\nHatutashiriki taarifa zako bila ruhusa yako wazi" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"2.5rem 1.5rem", textAlign:"center" }}>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Sera na Kanuni</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.65)", fontSize:"14px", margin:0 }}>Unyamwezini Jiko La Bibi JJJ - Dar es Salaam</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"1.5rem 1rem" }}>
        {policies.map((p,i) => (
          <div key={i} style={{ background:"#FFFFFF", borderRadius:"14px", padding:"1.5rem", marginBottom:"1rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", borderLeft:"5px solid "+GOLD }}>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:"16px", fontWeight:700, color:NAVY, margin:"0 0 0.8rem", display:"flex", alignItems:"center", gap:"8px" }}>
              <i className={"ti "+p.icon} style={{ color:GOLD, fontSize:"18px" }} />
              {p.title}
            </h3>
            <p style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(11,31,69,0.72)", lineHeight:1.85, margin:0, whiteSpace:"pre-line" }}>{p.body}</p>
          </div>
        ))}
        <div style={{ background:"rgba(212,175,55,0.10)", border:"1px solid rgba(212,175,55,0.40)", borderRadius:"12px", padding:"1.25rem", textAlign:"center" }}>
          <p style={{ fontFamily:"sans-serif", fontSize:"13px", color:"rgba(11,31,69,0.65)", margin:0 }}>
            Maswali - WhatsApp: <strong style={{ color:NAVY }}>+255 655 709 024</strong>
          </p>
        </div>
      </div>
      <BottomBanner />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function App() {
  const { count } = useCart();
  const [page, setPage] = useState("home");
  const [configItem, setConfigItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function navigate(p) { setPage(p); window.scrollTo(0,0); }

  return (
    <div style={{ minHeight:"100vh", background:"#F9F3E8", paddingBottom:"70px" }}>
      <style>{`
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-run{animation:mq 30s linear infinite;display:flex;white-space:nowrap;width:max-content}
        .mq-run:hover{animation-play-state:paused}
      `}</style>

      <Header onCartClick={() => setCartOpen(true)} />

      {page==="home"   && <HomePage />}
      {page==="menu"   && <MenuPage />}
      {page==="about"  && <AboutPage />}
      {page==="policy" && <PolicyPage />}
      {page==="admin"  && <AdminPage onExit={() => navigate("home")} />}

      <BottomNav page={page} setPage={navigate} onCartClick={() => setCartOpen(true)} cartCount={count} />

      {configItem   && <ItemModal item={configItem} onClose={() => setConfigItem(null)} />}
      {cartOpen     && <CartDrawer onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
