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

export default function App() {
  const { lang } = useLang();

  const [configItem, setConfigItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function openCheckout() {
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  return (
    <div className="min-h-screen">
      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />
      <ServiceBar />

      <main id="menu" className="mx-auto max-w-5xl px-4 pb-16">
        <MenuNav />

        {sections.map((sec) => {
          const items = menu.filter((m) => m.section === sec.id);
          if (!items.length) return null;
          return (
            <section
              key={sec.id}
              id={sec.id}
              className="section-anchor mt-10 animate-fade-up"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex-1 border-t border-gold/30" />
                <h2 className="font-display text-xl font-bold text-navy">
                  {sec.name[lang]}
                </h2>
                <div className="flex-1 border-t border-gold/30" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
