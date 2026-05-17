import { useState } from "react";
import { sections, menu } from "./data/menu";
import { useLang } from "./lang/LanguageContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MarqueeBar from "./components/MarqueeBar";
import ServiceBar from "./components/ServiceBar";
import MenuNav from "./components/MenuNav";
import MenuItemCard from "./components/MenuItemCard";
import ItemModal from "./components/ItemModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import Footer from "./components/Footer";

// Alternate section background colours for visual rhythm
const SEC_BG = ["bg-cream", "bg-cream-deep", "bg-cream", "bg-cream-deep", "bg-cream", "bg-cream-deep", "bg-cream"];

export default function App() {
  const { lang } = useLang();
  const [configItem, setConfigItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function openCheckout() { setCartOpen(false); setCheckoutOpen(true); }

  return (
    <div className="min-h-screen">
      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />
      <MarqueeBar />
      <ServiceBar />

      {/* ── MENU ─────────────────────────────────────── */}
      <main id="menu" className="mx-auto max-w-5xl px-4 pb-16">
        <MenuNav />

        {sections.map((sec, idx) => {
          const items = menu.filter((m) => m.section === sec.id);
          if (!items.length) return null;
          return (
            <section
              key={sec.id}
              id={sec.id}
              className={`section-anchor mt-10 fade-up rounded-2xl overflow-hidden ${SEC_BG[idx]}`}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ background: sec.color }}
              >
                {/* Numbered badge */}
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold font-body text-sm font-black text-navy-deep">
                  {idx + 1}
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-[17px] font-bold leading-tight text-gold">
                    {sec.name[lang]}
                  </h2>
                  <p className="text-[11px] italic text-cream/70">
                    {sec.name[lang === "sw" ? "en" : "sw"]}
                  </p>
                </div>

                {/* Section icon */}
                <i
                  className={`ti ${sec.icon} text-gold/80 text-2xl shrink-0`}
                  aria-hidden="true"
                />
              </div>

              {/* Items grid */}
              <div className="grid gap-2.5 p-4 sm:grid-cols-2">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onConfigure={setConfigItem}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Footer />

      {/* ── Modals ───────────────────────────────────── */}
      {configItem && (
        <ItemModal item={configItem} onClose={() => setConfigItem(null)} />
      )}
      {cartOpen && (
        <CartDrawer onClose={() => setCartOpen(false)} onCheckout={openCheckout} />
      )}
      {checkoutOpen && (
        <CheckoutModal onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  );
}
