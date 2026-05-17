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

const MQ = "VYAKULA VYA NYUMBANI ✦ BEI NAFUU ✦ HUDUMA BORA ✦ PICKUP · DELIVERY · DINE-IN · EVENTS ✦ ";
const BG = ["#FDF5E4","#F0E3C4","#FDF5E4","#F0E3C4","#FDF5E4","#F0E3C4","#FDF5E4"];

export default function App() {
  const { lang } = useLang();
  const [configItem, setConfigItem] = useState(null);
  const [cartOpen, setCartOpen]     = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-run{animation:mq 28s linear infinite;display:flex;white-space:nowrap;width:max-content}
        .mq-run:hover{animation-play-state:paused}
      `}</style>

      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />

      {/* ── Gold marquee ── */}
      <div style={{background:"#D4AF37",overflow:"hidden",padding:"7px 0"}}>
        <div className="mq-run">
          {[1,2].map(n => (
            <span key={n} style={{color:"#06132E",fontSize:"11px",fontWeight:"bold",letterSpacing:"2.5px",padding:"0 16px",fontFamily:"sans-serif"}}>
              {MQ.repeat(4)}
            </span>
          ))}
        </div>
      </div>

      <ServiceBar />

      {/* ── Menu ── */}
      <main id="menu" className="mx-auto max-w-5xl px-4 pb-16">
        <MenuNav />

        {sections.map((sec, idx) => {
          const items = menu.filter(m => m.section === sec.id);
          if (!items.length) return null;

          return (
            <section key={sec.id} id={sec.id}
              style={{marginTop:"2.5rem",borderRadius:"16px",overflow:"hidden",scrollMarginTop:"100px"}}>

              {/* Coloured header */}
              <div style={{background:sec.color,padding:"14px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{background:"#D4AF37",color:"#06132E",width:"28px",height:"28px",borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"900",fontSize:"13px",flexShrink:0}}>
                  {idx + 1}
                </div>
                <div style={{flex:1}}>
                  <h2 style={{fontFamily:"Georgia,serif",fontSize:"17px",fontWeight:"700",color:"#D4AF37",lineHeight:1.2,margin:0}}>
                    {sec.name[lang]}
                  </h2>
                  <p style={{fontSize:"11px",fontStyle:"italic",color:"rgba(253,245,228,0.65)",margin:"2px 0 0"}}>
                    {sec.name[lang === "sw" ? "en" : "sw"]}
                  </p>
                </div>
                <i className={`ti ${sec.icon}`}
                  style={{fontSize:"22px",color:"rgba(212,175,55,0.8)",flexShrink:0}} aria-hidden="true" />
              </div>

              {/* Items grid */}
              <div style={{background:BG[idx],padding:"16px",
                display:"grid",gap:"10px",
                gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
                {items.map(item => (
                  <MenuItemCard key={item.id} item={item} onConfigure={setConfigItem} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />

      {configItem  && <ItemModal    item={configItem} onClose={() => setConfigItem(null)} />}
      {cartOpen    && <CartDrawer   onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
