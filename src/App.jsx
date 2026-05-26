import React, { useState, useEffect } from "react";
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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Cinzel+Decorative:wght@700;900&family=Great+Vibes&display=swap');
  @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .mq-run{animation:mq 30s linear infinite;display:flex;white-space:nowrap;width:max-content}
  .mq-run:hover{animation-play-state:paused}
  @keyframes goldShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 10px rgba(212,175,55,0.2),0 4px 20px rgba(11,31,69,0.15)}50%{box-shadow:0 0 22px rgba(212,175,55,0.45),0 6px 30px rgba(11,31,69,0.2)}}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmerSweep{0%{left:-100%}100%{left:160%}}
  .l99-card{transition:transform 0.22s cubic-bezier(.4,0,.2,1),box-shadow 0.22s cubic-bezier(.4,0,.2,1),border-color 0.22s;animation:glowPulse 4s ease-in-out infinite;position:relative;overflow:hidden}
  .l99-card::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.07),transparent);transition:left 0s;pointer-events:none}
  .l99-card:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 12px 36px rgba(11,31,69,0.18), 0 0 0 1px rgba(212,175,55,0.4) !important}
  .l99-card:hover::after{animation:shimmerSweep 0.55s ease forwards}
  .l99-card:active{transform:scale(0.98)!important}
  .l99-btn{position:relative;overflow:hidden;transition:transform 0.18s,box-shadow 0.18s,background 0.18s !important}
  .l99-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);pointer-events:none}
  .l99-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,31,69,0.25)!important}
  .l99-btn:hover::after{animation:shimmerSweep 0.5s ease forwards}
  .l99-btn:active{transform:scale(0.96)!important}
  .shimmer-gold{background:linear-gradient(135deg,#c8a830 0%,#f7e8a0 35%,#D4AF37 55%,#8B6209 100%);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:goldShimmer 5s linear infinite}
  .l99-section-heading{font-family:'Cinzel Decorative','Cinzel',Georgia,serif !important;letter-spacing:0.06em}
  .page-enter{animation:fadeSlideUp 0.4s ease both}
`;

function BottomBanner() {
  return (
    <div style={{ position:"relative", overflow:"hidden", marginTop:"2.5rem" }}>
      <div style={{ backgroundImage:"url(/banner.jpg)", backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(0.38)", position:"absolute", inset:0 }} />
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(212,175,55,0.06) 0%,transparent 50%,rgba(212,175,55,0.04) 100%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,#6b4e0a,#D4AF37,#f7e8a0,#D4AF37,#6b4e0a,transparent)" }} />
      <div style={{ position:"relative", zIndex:1, padding:"3.5rem 1.5rem 4rem", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:"8px" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.35em", color:"#D4AF37", textTransform:"uppercase", opacity:0.7, fontFamily:"sans-serif" }}>Unyamwezini</div>
        <h2 className="shimmer-gold" style={{ fontFamily:"'Cinzel Decorative','Cinzel',Georgia,serif", fontSize:"clamp(18px,4.5vw,26px)", fontWeight:900, margin:"0 0 4px", letterSpacing:"0.04em" }}>Jiko La Bibi JJJ</h2>
        <p style={{ fontFamily:"'Great Vibes',Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.7)", fontSize:"clamp(15px,4vw,20px)", margin:"0 0 1.4rem" }}>Taste of Tanzania in DAR</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"14px", justifyContent:"center" }}>
          {[
            { icon:"ti-map-pin", text:"Mbezi Luis, Goba Road, Dar es Salaam" },
            { icon:"ti-brand-whatsapp", text:"+255 655 709 024" },
            { icon:"ti-clock", text:"Kila siku: 7:00 - 21:00" },
          ].map((r,i) => (
            <div key={i} className="l99-btn" style={{ color:"#FDF5E4", fontFamily:"sans-serif", fontSize:"13px", display:"flex", alignItems:"center", gap:"7px", background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.25)", borderRadius:"99px", padding:"7px 14px", cursor:"default" }}>
              <i className={"ti "+r.icon} style={{ color:GOLD, fontSize:"15px" }} />
              {r.text}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,#6b4e0a,#D4AF37,#6b4e0a,transparent)" }} />
    </div>
  );
}

function MenuEmbed() {
  const [height, setHeight] = useState(900);
  const lastH = React.useRef(0);
  useEffect(() => {
    function onMsg(e) {
      if (e.data && e.data.jikoMenuHeight) {
        const incoming = e.data.jikoMenuHeight;
        if (lastH.current === 0 || Math.abs(incoming - lastH.current) < 1200) {
          lastH.current = incoming;
          setHeight(incoming);
        }
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (
    <iframe src="/menu.html" title="Menyu - Jiko La Bibi JJJ"
      style={{ width:"100%", height:height+"px", border:"none", display:"block" }}
      scrolling="no" />
  );
}

function HomePage() {
  return (
    <div className="page-enter">
      <Hero />
      <div style={{ background:"linear-gradient(90deg,#b8900a,#D4AF37,#f7e8a0,#D4AF37,#b8900a)", overflow:"hidden", padding:"10px 0", boxShadow:"0 2px 12px rgba(212,175,55,0.3)" }}>
        <div className="mq-run">
          {[1,2].map(n => (
            <span key={n} style={{ color:NAVY2, fontSize:"14px", fontWeight:700, letterSpacing:"2.5px", padding:"0 24px", fontFamily:"'Cinzel',sans-serif" }}>
              {MQ.repeat(3)}
            </span>
          ))}
        </div>
      </div>
      <ServiceBar />
      <div style={{ padding:"2rem 0 0" }}>
        <div style={{ textAlign:"center", marginBottom:"1.2rem", padding:"0 1rem" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.4em", color:GOLD, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:"6px", opacity:0.8 }}>Unyamwezini Jiko La Bibi JJJ</div>
          <h2 className="shimmer-gold l99-section-heading" style={{ fontSize:"clamp(20px,5vw,28px)", fontWeight:900, margin:0 }}>Menyu Yetu</h2>
          <div style={{ width:"60px", height:"2px", background:"linear-gradient(to right,transparent,#D4AF37,transparent)", margin:"10px auto 0" }} />
        </div>
        <MenuEmbed />
      </div>
      <BottomBanner />
    </div>
  );
}

function MenuPage() {
  return (<div className="page-enter"><MenuEmbed /></div>);
}

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
    <div className="page-enter">
      <div style={{ background:"linear-gradient(160deg,#2d1808,#1a0d03 40%,#0B1F45 100%)", padding:"3.5rem 1.5rem 2.5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.1),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,#D4AF37,#f7e8a0,#D4AF37,transparent)" }} />
        <img src="/logo.png" alt="logo" width={110} height={110} style={{ borderRadius:"50%", border:"3px solid "+GOLD, objectFit:"cover", marginBottom:"1rem", boxShadow:"0 0 0 1px #8B6209, 0 0 30px rgba(212,175,55,0.3)", display:"block", margin:"0 auto 1rem" }} onError={e => { e.target.style.display="none"; }} />
        <h1 className="shimmer-gold l99-section-heading" style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:900, margin:"0 0 6px" }}>Kuhusu Sisi</h1>
        <p style={{ fontFamily:"'Great Vibes',Georgia,serif", color:"rgba(253,245,228,0.7)", fontSize:"clamp(15px,4vw,20px)", margin:0 }}>Taste of Tanzania in DAR</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"2rem 1rem" }}>
        <div className="l99-card" style={{ background:"#FFFFFF", borderRadius:"16px", padding:"2rem", marginBottom:"1.5rem", boxShadow:"0 3px 14px rgba(11,31,69,0.08)", borderLeft:"5px solid "+GOLD }}>
          <h2 className="l99-section-heading" style={{ fontSize:"18px", color:NAVY, margin:"0 0 1rem", display:"flex", alignItems:"center", gap:"8px" }}><span>🏡</span> Hadithi Yetu</h2>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>Karibu kwenye mkusanyiko wa familia - mahali ambapo chakula halisi cha Tanzania kinaandaliwa kwa upendo na mikono ya Bibi wetu.</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>Jiko La Bibi JJJ si mkahawa tu - ni nyumbani. Tunaamini kwamba chakula bora kinatoka moyoni, kikipikwa na malighafi ya asili ya Tanzania.</p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:0 }}>Bibi Veneranda ndiye moyo wa jiko letu. Mapishi yake yamepitishwa kutoka kizazi hadi kizazi - tangu Unyamwezini hadi Dar es Salaam.</p>
        </div>
        <div style={{ display:"grid", gap:"12px", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
          {info.map((item,i) => (
            <div key={i} className="l99-card" style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1rem 1.25rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", display:"flex", gap:"12px", alignItems:"flex-start", border:"1px solid rgba(212,175,55,0.15)" }}>
              <i className={"ti "+item.icon} style={{ fontSize:"22px", color:GOLD, flexShrink:0, marginTop:"2px" }} />
              <div>
                <div style={{ fontSize:"10px", fontFamily:"sans-serif", fontWeight:700, color:"rgba(11,31,69,0.4)", letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"3px" }}>{item.label}</div>
                <div style={{ fontSize:"14px", fontFamily:"Georgia,serif", color:NAVY, fontWeight:600 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomBanner />
    </div>
  );
}

function PolicyPage() {
  const policies = [
    { icon:"ti-clipboard-list", title:"1. Sera ya Maagizo", body:"Maagizo yanakubaliwa kupitia WhatsApp, simu, au tovuti yetu\nChakula cha kawaida hutayarishwa ndani ya dakika 15-30\nMaagizo ya matukio (Events) yanahitaji siku 2-3 za mapema\nTunashughulikia: Kuchukua, Delivery, Kula Hapa, na Matukio" },
    { icon:"ti-credit-card", title:"2. Sera ya Malipo", body:"Tunakubali: Lipa Namba (18873261), Mixx by Yas, Airtel Money, Pesa Taslimu\nMalipo yanaweza fanywa kabla au wakati wa kupokea chakula\nRisiti hutolewa kwa maombi yoyote" },
    { icon:"ti-bike", title:"3. Sera ya Delivery", body:"Tunahudumia maeneo ya Dar es Salaam\nGharama ya delivery inategemea umbali - wasiliana nasi\nMuda wa delivery: ndani ya saa 1 baada ya chakula kutayarishwa" },
    { icon:"ti-refresh", title:"4. Sera ya Kurejesha", body:"Kurejesha pesa kunafanyika ikiwa agizo halikutimizwa kwa sababu yetu\nKanselo baada ya dakika 15 linaweza kulipishwa asilimia 30\nMalalamiko yashughulikiwe haraka kupitia WhatsApp" },
    { icon:"ti-shield-check", title:"5. Kanuni ya Chakula", body:"Chakula chetu kinapikwa kwa viungo vya asili, bila kemikali za ziada\nHatuna dhamana kamili ya kukosa alerji - tafadhali tuambie mapema\nBei zinaweza kubadilika bila taarifa ya awali" },
    { icon:"ti-lock", title:"6. Sera ya Faragha", body:"Habari zako za kibinafsi (jina, simu) zinakingwa na sisi\nTunatumia maelezo yako kwa mawasiliano ya agizo lako pekee\nHatutashiriki taarifa zako bila ruhusa yako wazi" },
  ];
  return (
    <div className="page-enter">
      <div style={{ background:"linear-gradient(160deg,#06132E,#0B1F45)", padding:"2.5rem 1.5rem 2rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(to right,transparent,#D4AF37,#f7e8a0,#D4AF37,transparent)" }} />
        <h1 className="shimmer-gold l99-section-heading" style={{ fontSize:"clamp(20px,5vw,28px)", fontWeight:900, margin:"0 0 6px" }}>Sera na Kanuni</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.55)", fontSize:"14px", margin:0 }}>Unyamwezini Jiko La Bibi JJJ</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"1.5rem 1rem" }}>
        {policies.map((p,i) => (
          <div key={i} className="l99-card" style={{ background:"#FFFFFF", borderRadius:"14px", padding:"1.5rem", marginBottom:"1rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", borderLeft:"5px solid "+GOLD, border:"1px solid rgba(212,175,55,0.15)", borderLeftWidth:"5px", borderLeftColor:GOLD }}>
            <h3 className="l99-section-heading" style={{ fontSize:"15px", fontWeight:700, color:NAVY, margin:"0 0 0.8rem", display:"flex", alignItems:"center", gap:"8px" }}>
              <i className={"ti "+p.icon} style={{ color:GOLD, fontSize:"18px" }} />
              {p.title}
            </h3>
            <p style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(11,31,69,0.72)", lineHeight:1.85, margin:0, whiteSpace:"pre-line" }}>{p.body}</p>
          </div>
        ))}
        <div className="l99-card" style={{ background:"linear-gradient(135deg,rgba(212,175,55,0.08),rgba(212,175,55,0.04))", border:"1px solid rgba(212,175,55,0.35)", borderRadius:"12px", padding:"1.25rem", textAlign:"center" }}>
          <p style={{ fontFamily:"sans-serif", fontSize:"13px", color:"rgba(11,31,69,0.65)", margin:0 }}>
            Maswali - WhatsApp: <strong style={{ color:NAVY }}>+255 655 709 024</strong>
          </p>
        </div>
      </div>
      <BottomBanner />
    </div>
  );
}

export default function App() {
  const { count } = useCart();
  const [page, setPage] = useState("home");
  const [configItem, setConfigItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function navigate(p) { setPage(p); window.scrollTo(0,0); }

  // Secret admin access — 5 rapid taps on logo
  useEffect(() => {
    let taps = 0, timer;
    function onTap(e) {
      const logo = e.target.closest('img[src*="logo"]') || e.target.closest('header img');
      if (!logo) return;
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 2000);
      if (taps >= 5) { taps = 0; navigate("admin"); }
    }
    document.addEventListener("click", onTap);
    return () => document.removeEventListener("click", onTap);
  }, []);

  // ═══ LISTEN FOR ITEMS FROM MENU IFRAME ═══
  // When customer taps "+" in menu.html, iframe posts the item to us.
  // We open the ItemModal to let them pick size/qty, then add to cart.
  useEffect(() => {
    function onMessage(e) {
      if (e.data && e.data.jikoAddToCart && e.data.item) {
        setConfigItem(e.data.item);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#F9F3E8", paddingBottom:"70px" }}>
      <style>{GLOBAL_CSS}</style>

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
