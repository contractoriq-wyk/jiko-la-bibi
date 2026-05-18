import { useState } from "react";
import { sections, menu } from "./data/menu";
import { useLang } from "./lang/LanguageContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ServiceBar from "./components/ServiceBar";
import MenuNav from "./components/MenuNav";
import MenuItemCard from "./components/MenuItemCard";
import ItemModal from "./components/ItemModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Footer from "./components/Footer";

const NAVY  = "#0B1F45";
const NAVY2 = "#06132E";
const GOLD  = "#D4AF37";
const MQ    = "VYAKULA VYA NYUMBANI ✦ BEI NAFUU ✦ HUDUMA BORA ✦ PICKUP · DELIVERY · MATUKIO ✦ ";

export default function App() {
  const { lang } = useLang();
  const [configItem,   setConfigItem]   = useState(null);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div style={{ minHeight:"100vh", background:"#F9F3E8" }}>
      <style>{`
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-run{animation:mq 30s linear infinite;display:flex;white-space:nowrap;width:max-content}
        .mq-run:hover{animation-play-state:paused}
      `}</style>

      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />

      {/* ── Gold marquee — larger text ── */}
      <div style={{ background:GOLD, overflow:"hidden", padding:"9px 0" }}>
        <div className="mq-run">
          {[1,2].map(n => (
            <span key={n} style={{
              color:NAVY2, fontSize:"15px", fontWeight:700,
              letterSpacing:"2px", padding:"0 24px", fontFamily:"sans-serif",
            }}>
              {MQ.repeat(3)}
            </span>
          ))}
        </div>
      </div>

      <ServiceBar />

      {/* ── Menu ── */}
      <main id="menu" style={{ maxWidth:"900px", margin:"0 auto", padding:"0 1rem 4rem" }}>
        <MenuNav />

        {sections.map((sec, idx) => {
          const items = menu.filter(m => m.section === sec.id);
          if (!items.length) return null;
          return (
            <section key={sec.id} id={sec.id}
              style={{ marginTop:"2.5rem", borderRadius:"16px", overflow:"hidden", scrollMarginTop:"100px" }}>

              {/* ALL section headers: same deep navy + gold — professional, unified */}
              <div style={{
                background: NAVY,
                padding:"14px 20px",
                display:"flex", alignItems:"center", gap:"12px",
              }}>
                <div style={{
                  background:GOLD, color:NAVY2,
                  width:"30px", height:"30px", borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:900, fontSize:"13px", flexShrink:0, fontFamily:"sans-serif",
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex:1 }}>
                  <h2 style={{
                    fontFamily:"Georgia, serif",
                    fontSize:"17px", fontWeight:700, color:GOLD,
                    lineHeight:1.2, margin:0,
                  }}>
                    {sec.name.sw}
                  </h2>
                  <p style={{
                    fontSize:"11px", fontStyle:"italic",
                    color:"rgba(253,245,228,0.60)", margin:"2px 0 0",
                  }}>
                    {sec.name.en}
                  </p>
                </div>
                <i className={`ti ${sec.icon}`}
                  style={{ fontSize:"22px", color:"rgba(212,175,55,0.75)", flexShrink:0 }}
                  aria-hidden="true" />
              </div>

              {/* Items */}
              <div style={{
                background: idx % 2 === 0 ? "#FFFBF3" : "#FBF4E4",
                padding:"16px", display:"grid", gap:"10px",
                gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
              }}>
                {items.map(item => (
                  <MenuItemCard key={item.id} item={item} onConfigure={setConfigItem} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />

      {configItem   && <ItemModal    item={configItem} onClose={() => setConfigItem(null)} />}
      {cartOpen     && <CartDrawer   onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
