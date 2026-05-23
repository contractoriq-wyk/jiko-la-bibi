import { useState } from "react";

const SECTIONS = [
  {
    num: 1, icon: "☕", color: "#C15A00",
    sw: "Vinywaji vya Moto & Vitafunwa", en: "Hot Drinks & Snacks",
    items: [
      { sw: "Chai ya maziwa (kikombe)", price: "1,000" },
      { sw: "Chai ya rangi (kikombe)", price: "500" },
      { sw: "Chapati raini yenye maziwa na siagi", price: "1,000" },
      { sw: "Maandazi (1)", price: "500" },
      { sw: "Vitumbua (1)", price: "500" },
      { sw: "Viazi vitamu vya kuchemsha (1)", price: "500" },
      { sw: "Mihogo ya kuchemsha (1)", price: "500" },
    ],
    photos: ["/food/chai.jpg", "/food/chapati.jpg", "/food/maandazi.jpg"],
  },
  {
    num: 2, icon: "🍛", color: "#1B6B20",
    sw: "Vyakula vya Mchana na Jioni", en: "Lunch & Dinner",
    items: [
      { sw: "Wali, Nyama, Maharage na Mboga za Majani", sizes: "Ndogo / Wastani / Kubwa", price: "3,000 / 5,000 / 7,500" },
      { sw: "Ugali, Nyama, Maharage na Mboga za Majani", sizes: "Ndogo / Wastani / Kubwa", price: "3,000 / 5,000 / 7,500" },
    ],
    photos: ["/food/wali-combo.jpg", "/food/ugali-combo.jpg"],
  },
  {
    num: 3, icon: "🍽️", color: "#1565C0",
    sw: "Vyakula Visivyo na Kipimo", en: "Standard Plates",
    items: [
      { sw: "Wali + Kuku / Samaki / Maini / Maharage + Mboga za Majani", price: "7,500" },
      { sw: "Ugali + Kuku / Samaki / Maini / Maharage + Mboga za Majani", price: "7,500" },
    ],
    photos: ["/food/wali-combo.jpg", "/food/ugali-combo.jpg"],
  },
  {
    num: 4, icon: "🫕", color: "#C62828",
    sw: "Pilau", en: "Pilau",
    items: [
      { sw: "Pilau + Nyama", sizes: "Wastani / Kubwa", price: "5,000 / 7,500" },
      { sw: "Pilau + Kuku / Samaki / Maini", sizes: "Wastani / Kubwa", price: "5,000 / 7,500" },
    ],
    photos: ["/food/pilau.jpg"],
  },
  {
    num: 5, icon: "⭐", color: "#E65100",
    sw: "Specials", en: "Specials",
    items: [
      { sw: "Chips Zege", price: "5,000" },
      { sw: "Chips Robo Koku", price: "6,000" },
      { sw: "Ndizi Mzuzu ya Kukaanga", price: "1,000" },
    ],
    photos: ["/food/chips.jpg", "/food/ndizi-mzuzu.jpg"],
  },
  {
    num: 6, icon: "🥤", color: "#00695C",
    sw: "Vinywaji", en: "Drinks",
    items: [
      { sw: "Maji (1 Lita)", price: "1,200" },
      { sw: "Maji (Nusu Lita)", price: "700" },
      { sw: "Soda", price: "1,000" },
      { sw: "Juice Freshi", sizes: "Ndogo / Wastani / Kubwa", price: "1,000 / 1,500 / 2,500" },
    ],
    photos: ["/food/maji-litre.jpg", "/food/soda.jpg", "/food/juice-freshi.jpg"],
  },
  {
    num: 7, icon: "🌙", color: "#6A1B9A",
    sw: "Supu na Vitafunwa kwa Jioni", en: "Evening Soups & Snacks",
    items: [
      { sw: "Supu ya Kongoro", price: "3,000" },
      { sw: "Chapati raini yanya maziwa na siagi (1)", price: "1,000" },
      { sw: "Ndizi ya kuchemsha (1)", price: "500" },
    ],
    photos: ["/food/kongoro.jpg", "/food/chapati.jpg"],
  },
];

const SERVICES = [
  { icon: "📶", title: "WiFi ya Mauzo na WiFi ya Bure", desc: "Free WiFi available for all guests" },
  { icon: "🎮", title: "Huduma za Entertainment", desc: "Michezo na Burudani kwa Wateja wote" },
  { icon: "🤝", title: "Karibu!", desc: "Kama una uhitaji maalum, tafadhali tufahamishe ili tujue kukuhudumia kifasha" },
];

export default function JikoLaBibiMenu() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a0f05",
      fontFamily: "'Georgia', serif",
      color: "#f0ddb0",
    }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "linear-gradient(135deg, #1a0f05 0%, #2d1a08 50%, #1a0f05 100%)",
        borderBottom: "2px solid #D4AF37",
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Gold corner decorations */}
        <div style={{ position:"absolute", top:8, left:8, color:"#D4AF37", opacity:0.4, fontSize:20 }}>✦</div>
        <div style={{ position:"absolute", top:8, right:8, color:"#D4AF37", opacity:0.4, fontSize:20 }}>✦</div>

        <div style={{ display:"flex", flexDirection:"row", minHeight:140 }}>

          {/* LEFT — Logo */}
          <div style={{
            flex:"0 0 45%",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"16px 8px",
            borderRight:"1px solid rgba(212,175,55,0.3)",
            gap:8,
          }}>
            <img
              src="/food/chai-rangi.jpg"
              alt="Jiko La Bibi"
              style={{
                width:72, height:72, borderRadius:"50%",
                border:"2px solid #D4AF37",
                objectFit:"cover",
              }}
              onError={e => { e.target.style.display="none"; }}
            />
            <div style={{ textAlign:"center" }}>
              <div style={{
                fontSize:9, letterSpacing:"0.3em", color:"#D4AF37",
                textTransform:"uppercase", marginBottom:2,
              }}>Unyamwezini</div>
              <div style={{
                fontSize:18, fontWeight:"bold", lineHeight:1.1,
                background:"linear-gradient(135deg,#D4AF37,#F5E6A0,#C8960C)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>Jiko La Bibi</div>
              <div style={{
                fontSize:22, fontWeight:"bold", lineHeight:1,
                background:"linear-gradient(135deg,#D4AF37,#F5E6A0,#C8960C)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>JJJ</div>
              <div style={{ fontSize:9, color:"#8a6a3a", marginTop:3, letterSpacing:"0.15em" }}>
                ✦ Taste of Tanzania in DAR ✦
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Info */}
          <div style={{
            flex:1,
            display:"flex", flexDirection:"column",
            justifyContent:"center",
            padding:"16px 14px",
            gap:10,
          }}>
            <div style={{ textAlign:"center", marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ddb0", lineHeight:1.2 }}>
                UNYAMWEZINI
              </div>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ddb0", lineHeight:1.2 }}>
                JIKO LA BIBI J J J
              </div>
              <div style={{ fontSize:9, color:"#D4AF37", letterSpacing:"0.1em", marginTop:2 }}>
                Taste of Tanzania in DAR
              </div>
            </div>

            {[
              { icon:"📱", label:"WhatsApp / Order", val:"+255-655-709-024" },
              { icon:"💳", label:"Lipa Namba", val:"18873261" },
              { icon:"🌐", label:"Website", val:"jikolabibijjj.com" },
            ].map((c,i) => (
              <div key={i} style={{
                background:"rgba(212,175,55,0.08)",
                border:"1px solid rgba(212,175,55,0.25)",
                borderRadius:8, padding:"6px 10px",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:14 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize:8, color:"#8a7050", letterSpacing:"0.1em", textTransform:"uppercase" }}>{c.label}</div>
                  <div style={{ fontSize:11, color:"#D4AF37", fontWeight:"bold" }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── MENU SECTIONS ── */}
      <main style={{ padding:"12px 10px", display:"flex", flexDirection:"column", gap:10 }}>
        {SECTIONS.map(sec => {
          const isOpen = expandedSection === sec.num;
          return (
            <div key={sec.num} style={{
              borderRadius:12,
              border:`1px solid ${sec.color}55`,
              overflow:"hidden",
              background:"linear-gradient(135deg,rgba(255,255,255,0.03),rgba(0,0,0,0.2))",
            }}>
              {/* Section Header — tappable */}
              <button
                onClick={() => setExpandedSection(isOpen ? null : sec.num)}
                style={{
                  width:"100%", background:"transparent", border:"none",
                  cursor:"pointer", padding:"10px 14px",
                  display:"flex", alignItems:"center", gap:10,
                  borderBottom: isOpen ? `1px solid ${sec.color}44` : "none",
                }}
              >
                <div style={{
                  width:32, height:32, borderRadius:"50%",
                  background:`${sec.color}33`,
                  border:`1px solid ${sec.color}66`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, flexShrink:0,
                }}>
                  {sec.icon}
                </div>
                <div style={{ flex:1, textAlign:"left" }}>
                  <div style={{
                    fontSize:8, color:"#8a7050", letterSpacing:"0.2em",
                    textTransform:"uppercase",
                  }}>Section {sec.num} · {sec.en}</div>
                  <div style={{ fontSize:13, color:"#f0ddb0", fontWeight:"bold", lineHeight:1.2 }}>
                    {sec.sw}
                  </div>
                </div>
                <div style={{
                  fontSize:16, color:"#D4AF37", transition:"transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▾</div>
              </button>

              {/* Expanded Content */}
              {isOpen && (
                <div style={{ padding:"10px 14px 14px" }}>
                  {/* Photos row */}
                  {sec.photos?.length > 0 && (
                    <div style={{
                      display:"flex", gap:8, marginBottom:12,
                      overflowX:"auto", scrollbarWidth:"none",
                    }}>
                      {sec.photos.map((p,i) => (
                        <img key={i} src={p} alt="" style={{
                          width:70, height:70, borderRadius:8,
                          objectFit:"cover", flexShrink:0,
                          border:`1px solid ${sec.color}44`,
                        }} />
                      ))}
                    </div>
                  )}
                  {/* Items */}
                  {sec.items.map((item, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                      padding:"7px 0",
                      borderBottom: i < sec.items.length-1 ? "1px solid rgba(212,175,55,0.1)" : "none",
                      gap:8,
                    }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:"#f0ddb0", lineHeight:1.3 }}>{item.sw}</div>
                        {item.sizes && (
                          <div style={{ fontSize:10, color:"#8a7050", marginTop:2 }}>{item.sizes}</div>
                        )}
                      </div>
                      <div style={{
                        fontSize:12, color:"#D4AF37", fontWeight:"bold",
                        whiteSpace:"nowrap", flexShrink:0,
                      }}>
                        Tsh {item.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* ── SERVICES FOOTER ── */}
      <footer style={{
        margin:"10px 10px 20px",
        borderRadius:12,
        border:"1px solid rgba(212,175,55,0.3)",
        background:"linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,0,0,0.3))",
        overflow:"hidden",
      }}>
        <div style={{
          padding:"10px 14px",
          borderBottom:"1px solid rgba(212,175,55,0.2)",
          fontSize:9, letterSpacing:"0.3em", color:"#D4AF37",
          textAlign:"center", textTransform:"uppercase",
        }}>
          ✦ Huduma Zetu · Our Services ✦
        </div>
        {SERVICES.map((s,i) => (
          <div key={i} style={{
            display:"flex", alignItems:"flex-start", gap:12,
            padding:"10px 14px",
            borderBottom: i < SERVICES.length-1 ? "1px solid rgba(212,175,55,0.1)" : "none",
          }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:12, color:"#D4AF37", fontWeight:"bold", lineHeight:1.3 }}>{s.title}</div>
              <div style={{ fontSize:11, color:"#8a7060", marginTop:2, lineHeight:1.4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
        <div style={{
          padding:"12px",
          textAlign:"center",
          fontSize:11,
          background:"linear-gradient(135deg,rgba(212,175,55,0.1),transparent)",
          color:"#D4AF37",
          letterSpacing:"0.1em",
          fontStyle:"italic",
        }}>
          ✦ Karibu Unyamwezini Jiko La Bibi JJJ ✦
        </div>
      </footer>

    </div>
  );
}
