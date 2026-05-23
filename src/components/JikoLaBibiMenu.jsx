import { useState } from "react";

const MENU = {
  vitafunwa: {
    label: "Vitafunwa & Vinywaji vya Moto",
    sublabel: "Hot Drinks & Snacks",
    icon: "☕",
    color: "#C15A00",
    bg: "from-amber-950 to-orange-950",
    items: [
      { name: "Chai ya Maziwa", sub: "Milk Tea — kikombe", price: "Tsh 1,000", photo: "/food/chai.jpg" },
      { name: "Chai ya Rangi", sub: "Black Tea — kikombe", price: "Tsh 500", photo: "/food/chai-rangi.jpg" },
      { name: "Chapati Raini", sub: "With Milk & Butter", price: "Tsh 1,000", photo: "/food/chapati.jpg" },
      { name: "Maandazi", sub: "1 piece", price: "Tsh 500", photo: "/food/maandazi.jpg" },
      { name: "Vitumbua", sub: "Rice Cake — 1 piece", price: "Tsh 500", photo: "/food/vitumbua.jpg" },
      { name: "Viazi Vitamu", sub: "Boiled Sweet Potato", price: "Tsh 500", photo: "/food/viazi-vitamu.jpg" },
      { name: "Mhogo wa Kuchemsha", sub: "Boiled Cassava", price: "Tsh 500", photo: "/food/mihogo.jpg" },
    ]
  },
  mchele: {
    label: "Vyakula vya Mchana na Jioni",
    sublabel: "Lunch & Dinner",
    icon: "🍛",
    color: "#1B6B20",
    bg: "from-green-950 to-emerald-950",
    items: [
      { name: "Wali + Nyama + Maharage + Mboga", sub: "Ndogo / Wastani / Kubwa", price: "3,000 / 5,000 / 7,500", photo: "/food/wali-combo.jpg" },
      { name: "Ugali + Nyama + Maharage + Mboga", sub: "Ndogo / Wastani / Kubwa", price: "3,000 / 5,000 / 7,500", photo: "/food/ugali-combo.jpg" },
    ]
  },
  standard: {
    label: "Sahani za Kawaida",
    sublabel: "Standard Plates",
    icon: "🍽️",
    color: "#1565C0",
    bg: "from-blue-950 to-indigo-950",
    items: [
      { name: "Wali + Protini + Mboga", sub: "Kuku / Samaki / Maini / Maharage", price: "Tsh 7,500", photo: "/food/wali-combo.jpg" },
      { name: "Ugali + Protini + Mboga", sub: "Kuku / Samaki / Maini / Maharage", price: "Tsh 7,500", photo: "/food/ugali-combo.jpg" },
    ]
  },
  pilau: {
    label: "Pilau",
    sublabel: "Pilau",
    icon: "🫕",
    color: "#C62828",
    bg: "from-red-950 to-rose-950",
    items: [
      { name: "Pilau ya Nyama", sub: "Wastani / Kubwa", price: "5,000 / 7,500", photo: "/food/pilau.jpg" },
      { name: "Pilau ya Kuku / Samaki / Maini", sub: "Wastani / Kubwa", price: "5,000 / 7,500", photo: "/food/pilau.jpg" },
    ]
  },
  specials: {
    label: "Spesheli",
    sublabel: "Specials",
    icon: "⭐",
    color: "#E65100",
    bg: "from-orange-950 to-red-950",
    items: [
      { name: "Chips Zege", sub: "Chips with Egg", price: "Tsh 5,000", photo: "/food/chips.jpg" },
      { name: "Chips Robo Kuku", sub: "Chips + Quarter Chicken", price: "Tsh 6,000", photo: "/food/chips.jpg" },
      { name: "Ndizi Mzuzu ya Kukaanga", sub: "Fried Sweet Plantain", price: "Tsh 1,000", photo: "/food/ndizi-mzuzu.jpg" },
    ]
  },
  vinywaji: {
    label: "Vinywaji Baridi",
    sublabel: "Cold Drinks",
    icon: "🥤",
    color: "#00695C",
    bg: "from-teal-950 to-cyan-950",
    items: [
      { name: "Maji Baridi (Lita 1)", sub: "Cold Water 1L", price: "Tsh 1,200", photo: "/food/maji-litre.jpg" },
      { name: "Maji Baridi (Nusu Lita)", sub: "Cold Water 500ml", price: "Tsh 700", photo: "/food/maji-nusu.jpg" },
      { name: "Soda", sub: "Soda", price: "Tsh 1,000", photo: "/food/soda.jpg" },
      { name: "Juice Freshi", sub: "Ndogo / Wastani / Kubwa", price: "1,000 / 1,500 / 2,500", photo: "/food/juice-freshi.jpg" },
    ]
  },
  jioni: {
    label: "Supu na Vitafunwa vya Jioni",
    sublabel: "Evening Soups & Snacks",
    icon: "🌙",
    color: "#4A235A",
    bg: "from-purple-950 to-violet-950",
    items: [
      { name: "Supu ya Kongoro", sub: "Cow Trotter Soup", price: "Tsh 3,000", photo: "/food/kongoro.jpg" },
      { name: "Chapati Raini + Maziwa na Siagi", sub: "1 piece", price: "Tsh 1,000", photo: "/food/chapati.jpg" },
      { name: "Ndizi ya Kuchemsha", sub: "Boiled Plantain — 1 piece", price: "Tsh 500", emoji: "🌾" },
    ]
  },
};

const SECTIONS = Object.keys(MENU);

export default function JikoLaBibiMenu() {
  const [active, setActive] = useState("vitafunwa");
  const section = MENU[active];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0705",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f5e6c8",
      overflowX: "hidden",
    }}>
      {/* Decorative background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(193,90,0,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(74,35,90,0.08) 0%, transparent 60%)`,
      }} />

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        borderBottom: "1px solid rgba(212,175,55,0.3)",
        background: "linear-gradient(180deg, rgba(10,7,5,0.98) 0%, rgba(20,12,5,0.95) 100%)",
        padding: "24px 20px 16px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "11px", letterSpacing: "0.4em", color: "#D4AF37",
          textTransform: "uppercase", marginBottom: "6px", opacity: 0.8,
        }}>
          ✦ Taste of Tanzania ✦
        </div>
        <h1 style={{
          margin: 0, fontSize: "clamp(26px, 6vw, 42px)",
          fontWeight: "bold", letterSpacing: "0.05em",
          background: "linear-gradient(135deg, #D4AF37 0%, #F5E6A0 50%, #C8960C 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}>
          Jiko La Bibi JJJ
        </h1>
        <div style={{
          fontSize: "13px", color: "#b89a6a", marginTop: "4px",
          letterSpacing: "0.15em",
        }}>
          Unyamwezini · Dar es Salaam
        </div>
        <div style={{
          marginTop: "10px", display: "flex", justifyContent: "center",
          gap: "16px", fontSize: "12px", color: "#9a7a5a",
        }}>
          <span>📱 +255-655-709-024</span>
          <span>🌐 jikolabibijjj.com</span>
        </div>
      </header>

      {/* Section Tabs */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(10,7,5,0.97)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        overflowX: "auto", display: "flex", gap: "4px",
        padding: "10px 12px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {SECTIONS.map(key => {
          const s = MENU[key];
          const isActive = active === key;
          return (
            <button key={key} onClick={() => setActive(key)} style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: "24px",
              border: isActive ? `1px solid ${s.color}` : "1px solid rgba(212,175,55,0.15)",
              background: isActive
                ? `linear-gradient(135deg, ${s.color}33, ${s.color}11)`
                : "transparent",
              color: isActive ? "#f5e6c8" : "#8a7060",
              fontSize: "12px",
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "5px",
              whiteSpace: "nowrap",
            }}>
              <span>{s.icon}</span>
              <span style={{ display: isActive ? "inline" : "none" }}>{s.sublabel}</span>
              {!isActive && <span style={{ fontSize: "10px" }}>{s.sublabel.split(" ")[0]}</span>}
            </button>
          );
        })}
      </nav>

      {/* Section Content */}
      <main style={{ position: "relative", zIndex: 5, padding: "20px 16px 40px" }}>
        {/* Section Header */}
        <div style={{
          marginBottom: "20px", paddingBottom: "16px",
          borderBottom: `1px solid ${section.color}44`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>{section.icon}</span>
            <div>
              <div style={{
                fontSize: "18px", fontWeight: "bold", color: "#f0ddb0",
                lineHeight: 1.2,
              }}>{section.label}</div>
              <div style={{ fontSize: "12px", color: "#8a7060", letterSpacing: "0.1em" }}>
                {section.sublabel}
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
        }}>
          {section.items.map((item, i) => (
            <div key={i} style={{
              borderRadius: "14px",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(212,175,55,0.12)",
              display: "flex",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 32px ${section.color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Photo */}
              <div style={{
                width: "90px", flexShrink: 0,
                background: `linear-gradient(135deg, ${section.color}33, rgba(0,0,0,0.5))`,
                position: "relative", overflow: "hidden",
              }}>
                {item.photo ? (
                  <img src={item.photo} alt={item.name} style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                    filter: "brightness(0.9) saturate(1.1)",
                  }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", minHeight: "80px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "28px",
                  }}>
                    {item.emoji || section.icon}
                  </div>
                )}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(to right, transparent 60%, rgba(10,7,5,0.4))`,
                }} />
              </div>

              {/* Text */}
              <div style={{
                flex: 1, padding: "12px 14px",
                display: "flex", flexDirection: "column", justifyContent: "center",
                gap: "4px",
              }}>
                <div style={{
                  fontSize: "14px", fontWeight: "bold", color: "#f0ddb0",
                  lineHeight: 1.3,
                }}>{item.name}</div>
                <div style={{
                  fontSize: "11px", color: "#8a7060", lineHeight: 1.4,
                }}>{item.sub}</div>
                <div style={{
                  marginTop: "6px", fontSize: "13px", fontWeight: "bold",
                  color: "#D4AF37", letterSpacing: "0.02em",
                }}>{item.price}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(212,175,55,0.2)",
        padding: "20px",
        textAlign: "center",
        background: "rgba(10,7,5,0.98)",
        position: "relative", zIndex: 5,
      }}>
        <div style={{
          fontSize: "10px", letterSpacing: "0.3em",
          color: "#6a5a40", textTransform: "uppercase",
        }}>
          ✦ Karibu Unyamwezini Jiko La Bibi JJJ ✦
        </div>
        <div style={{ fontSize: "11px", color: "#5a4a30", marginTop: "6px" }}>
          WiFi ya Bure · Lipa Namba: 18873261
        </div>
      </footer>
    </div>
  );
}
