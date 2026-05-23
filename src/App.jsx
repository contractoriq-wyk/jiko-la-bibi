import { useState, useRef } from "react";
import { sections, menu } from "./data/menu";
import { useLang } from "./lang/LanguageContext";
import { useCart } from "./cart/CartContext";
import { business } from "./data/businessConfig";
import Header      from "./components/Header";
import Hero        from "./components/Hero";
import ServiceBar   from "./components/ServiceBar";
import BottomNav    from "./components/BottomNav";
import MenuItemCard  from "./components/MenuItemCard";
import ItemModal     from "./components/ItemModal";
import CartDrawer    from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AdminPage     from "./pages/AdminPage";
import JikoLaBibiMenu from "./components/JikoLaBibiMenu";

const GOLD  = "#D4AF37";
const NAVY  = "#0B1F45";
const NAVY2 = "#06132E";
const MQ    = "VYAKULA VYA NYUMBANI âœ¦ BEI NAFUU âœ¦ HUDUMA BORA âœ¦ PICKUP Â· DELIVERY Â· MATUKIO âœ¦ ";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BOTTOM BANNER â€” Kilimanjaro + contact info
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function BottomBanner() {
  return (
    <div style={{ position:"relative", overflow:"hidden", marginTop:"2.5rem" }}>
      <div style={{
        backgroundImage:"url(/banner.jpg)",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(0.45)",
        position:"absolute", inset:0,
      }} />
      <div style={{
        position:"relative", zIndex:1,
        background:"rgba(6,19,46,0.68)",
        padding:"3.5rem 1.5rem 4rem",          /* extra bottom padding so text isn't cut */
        display:"flex", flexDirection:"column",
        alignItems:"center", textAlign:"center",
      }}>
        <h2 style={{
          fontFamily:"Georgia,serif", fontSize:"22px",
          fontWeight:900, color:"#FDF5E4", margin:"0 0 6px",
        }}>
          Karibu <span style={{ color:GOLD }}>Unyamwezini Jiko La Bibi JJJ</span>
        </h2>
        <p style={{
          fontFamily:"Georgia,serif", fontStyle:"italic",
          color:"rgba(253,245,228,0.72)", fontSize:"14px", margin:"0 0 1.6rem",
        }}>
          Taste of Tanzania in DAR ðŸ‡¹ðŸ‡¿
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"18px", justifyContent:"center" }}>
          {[
            { icon:"ti-map-pin",        text:"Mbezi Luis, Goba Road, Dar es Salaam" },
            { icon:"ti-brand-whatsapp", text:"+255 655 709 024" },
            { icon:"ti-clock",          text:"Kila siku: 7:00 â€“ 21:00" },
          ].map((r,i) => (
            <div key={i} style={{
              color:"#FDF5E4", fontFamily:"sans-serif",
              fontSize:"13px", display:"flex", alignItems:"center", gap:"7px",
            }}>
              <i className={`ti ${r.icon}`} style={{ color:GOLD, fontSize:"15px" }} />
              {r.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HOME PAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function HomePage({ setPage, setSectionIdx }) {
  return (
    <div>
      <Hero />

      {/* Marquee */}
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

      {/* â”€â”€ Section preview cards â€” the WOW â”€â”€ */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"2rem 1rem 1.5rem" }}>
        <h2 style={{
          fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:700,
          color:NAVY, margin:"0 0 1.2rem", textAlign:"center",
        }}>
          Menyu Yetu ðŸ½ï¸
        </h2>

        <div style={{
          display:"grid", gap:"12px",
          gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
        }}>
          {sections.map((sec, i) => {
            const count = menu.filter(m => m.section === sec.id).length;
            return (
              <button
                key={sec.id}
                onClick={() => { setSectionIdx(i); setPage("menu"); }}
                style={{
                  background:"#FFFFFF",
                  border:`1.5px solid rgba(212,175,55,0.25)`,
                  borderRadius:"14px",
                  padding:"1.2rem 1rem",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                  cursor:"pointer", textAlign:"center",
                  boxShadow:"0 3px 12px rgba(11,31,69,0.07)",
                  transition:"transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 22px rgba(11,31,69,0.14)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 3px 12px rgba(11,31,69,0.07)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.25)"; }}
              >
                {/* Emoji in coloured circle */}
                <div style={{
                  width:"54px", height:"54px", borderRadius:"50%",
                  background: sec.color + "22",
                  border:`2px solid ${sec.color}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"26px",
                }}>
                  {menu.find(m => m.section === sec.id)?.emoji || "ðŸ½ï¸"}
                </div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", fontWeight:700, color:NAVY, lineHeight:1.3 }}>
                  {sec.name.sw}
                </div>
                <div style={{
                  fontFamily:"sans-serif", fontSize:"11px",
                  color:"rgba(11,31,69,0.45)",
                }}>
                  {count} {count === 1 ? "bidhaa" : "bidhaa"}
                </div>
                <div style={{
                  background:NAVY, color:GOLD,
                  borderRadius:"99px", padding:"4px 14px",
                  fontSize:"11px", fontFamily:"sans-serif", fontWeight:700,
                }}>
                  Angalia â†’
                </div>
              </button>
            );
          })}
        </div>

        {/* â”€â”€ Digital Menu Poster Button â”€â”€ */}
        <div style={{ textAlign:"center", marginTop:"1.5rem" }}>
          <button
            onClick={() => setPage("poster")}
            style={{
              background:`linear-gradient(135deg, ${NAVY2}, ${NAVY})`,
              color:GOLD,
              border:`1.5px solid ${GOLD}55`,
              borderRadius:"99px",
              padding:"12px 28px",
              fontFamily:"Georgia,serif",
              fontSize:"14px",
              fontWeight:700,
              cursor:"pointer",
              letterSpacing:"0.03em",
              boxShadow:"0 4px 16px rgba(11,31,69,0.2)",
              display:"inline-flex",
              alignItems:"center",
              gap:"8px",
            }}
          >
            ðŸ“‹ Tazama Menyu Kamili
          </button>
        </div>
      </div>

      <BottomBanner />
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MENU PAGE â€” swipeable sections, proper max-width
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function MenuPage({ sectionIdx, setSectionIdx, setConfigItem }) {
  const touchStartX = useRef(null);
  const sec   = sections[sectionIdx];
  const items = menu.filter(m => m.section === sec.id);

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta >  60) setSectionIdx(i => Math.min(sections.length - 1, i + 1));
    if (delta < -60) setSectionIdx(i => Math.max(0, i - 1));
    touchStartX.current = null;
  }

  return (
    <div>
      {/* Section tabs */}
      <nav style={{
        position:"sticky", top:"60px", zIndex:30,
        background:"rgba(249,243,232,0.97)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid rgba(212,175,55,0.22)",
        overflowX:"auto", padding:"10px 12px",
        display:"flex", gap:"6px", scrollbarWidth:"none",
      }}>
        {sections.map((s,i) => (
          <button key={s.id} onClick={() => setSectionIdx(i)} style={{
            background: i===sectionIdx ? NAVY : "transparent",
            color:       i===sectionIdx ? GOLD : "rgba(11,31,69,0.5)",
            border:`1.5px solid ${i===sectionIdx ? NAVY : "rgba(11,31,69,0.18)"}`,
            borderRadius:"99px", padding:"6px 14px", whiteSpace:"nowrap",
            fontFamily:"sans-serif", fontSize:"12px",
            fontWeight: i===sectionIdx ? 700 : 400,
            cursor:"pointer", transition:"all 0.2s",
          }}>
            {s.name.sw.split(" ")[0]}
          </button>
        ))}
      </nav>

      {/* Swipeable area â€” MAX WIDTH 900px centred */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ maxWidth:"900px", margin:"0 auto" }}
      >
        {/* Section header â€” unified navy + gold */}
        <div style={{
          background:NAVY, padding:"14px 20px",
          display:"flex", alignItems:"center", gap:"12px",
        }}>
          <div style={{
            background:GOLD, color:NAVY2, width:"30px", height:"30px",
            borderRadius:"50%", display:"flex", alignItems:"center",
            justifyContent:"center", fontWeight:900, fontSize:"13px",
            flexShrink:0, fontFamily:"sans-serif",
          }}>
            {sectionIdx + 1}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:"17px", fontWeight:700, color:GOLD, lineHeight:1.2, margin:0 }}>
              {sec.name.sw}
            </h2>
            <p style={{ fontSize:"11px", fontStyle:"italic", color:"rgba(253,245,228,0.60)", margin:"2px 0 0" }}>
              {sec.name.en}
            </p>
          </div>
          <i className={`ti ${sec.icon}`} style={{ fontSize:"22px", color:"rgba(212,175,55,0.75)", flexShrink:0 }} aria-hidden="true" />
        </div>

        {/* Items â€” 2-column grid, centred, proper sizing */}
        <div style={{
          background: sectionIdx % 2 === 0 ? "#FFFBF3" : "#FBF4E4",
          padding:"18px",
          display:"grid", gap:"12px",
          gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
          minHeight:"220px",
        }}>
          {items.map(item => (
            <MenuItemCard key={item.id} item={item} onConfigure={setConfigItem} />
          ))}
        </div>

        {/* Prev / dots / Next */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 20px", background:"#F9F3E8",
          maxWidth:"900px", margin:"0 auto",
        }}>
          <button
            onClick={() => setSectionIdx(i => Math.max(0, i-1))}
            disabled={sectionIdx === 0}
            style={{
              background: sectionIdx===0 ? "rgba(11,31,69,0.07)" : NAVY,
              color:       sectionIdx===0 ? "rgba(11,31,69,0.28)" : GOLD,
              border:"none", borderRadius:"99px", padding:"10px 22px",
              fontFamily:"sans-serif", fontSize:"13px", fontWeight:700,
              cursor: sectionIdx===0 ? "default" : "pointer",
            }}
          >
            {sectionIdx > 0 ? `â† ${sections[sectionIdx-1].name.sw.split(" ")[0]}` : "â†"}
          </button>

          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
            {sections.map((_,i) => (
              <div key={i} onClick={() => setSectionIdx(i)} style={{
                width: i===sectionIdx ? "22px" : "8px",
                height:"8px", borderRadius:"4px",
                background: i===sectionIdx ? GOLD : "rgba(11,31,69,0.18)",
                cursor:"pointer", transition:"all 0.3s",
              }} />
            ))}
          </div>

          <button
            onClick={() => setSectionIdx(i => Math.min(sections.length-1, i+1))}
            disabled={sectionIdx === sections.length-1}
            style={{
              background: sectionIdx===sections.length-1 ? "rgba(11,31,69,0.07)" : NAVY,
              color:       sectionIdx===sections.length-1 ? "rgba(11,31,69,0.28)" : GOLD,
              border:"none", borderRadius:"99px", padding:"10px 22px",
              fontFamily:"sans-serif", fontSize:"13px", fontWeight:700,
              cursor: sectionIdx===sections.length-1 ? "default" : "pointer",
            }}
          >
            {sectionIdx < sections.length-1 ? `${sections[sectionIdx+1].name.sw.split(" ")[0]} â†’` : "â†’"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ABOUT US
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function AboutPage() {
  const info = [
    { icon:"ti-map-pin",        label:"Mahali",     value:"Mbezi Luis, Goba Road (Chingwalu St), Dar es Salaam" },
    { icon:"ti-brand-whatsapp", label:"WhatsApp",   value:"+255 655 709 024" },
    { icon:"ti-clock",          label:"Saa za Kazi",value:"Kila siku: 7:00 asubuhi â€“ 9:00 usiku" },
    { icon:"ti-credit-card",    label:"Lipa Namba", value:`${business.lipaNamba} â€” ${business.lipaName}` },
    { icon:"ti-wifi",           label:"WiFi",       value:"WiFi ya Bure kwa Wateja wote" },
    { icon:"ti-device-tv",      label:"Burudani",   value:"Michezo na Entertainment kwa Wateja" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"3rem 1.5rem 2rem", textAlign:"center" }}>
        <img src="/logo.png" alt="logo" width={120} height={120}
          style={{ borderRadius:"50%", border:`3px solid ${GOLD}`, objectFit:"cover", marginBottom:"1rem" }}
          onError={e => { e.target.style.display="none"; }} />
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Kuhusu Sisi</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.70)", fontSize:"15px", margin:0 }}>Taste of Tanzania in DAR</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"2rem 1rem" }}>
        <div style={{ background:"#FFFFFF", borderRadius:"16px", padding:"2rem", marginBottom:"1.5rem", boxShadow:"0 3px 14px rgba(11,31,69,0.08)", borderLeft:`5px solid ${GOLD}` }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:"20px", color:NAVY, margin:"0 0 1rem" }}>ðŸ¡ Hadithi Yetu</h2>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>
            Karibu kwenye mkusanyiko wa familia â€” mahali ambapo chakula halisi cha Tanzania kinaandaliwa kwa upendo na mikono ya Bibi wetu.
          </p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>
            <strong>Jiko La Bibi JJJ</strong> si mkahawa tu â€” ni nyumbani. Tunaamini kwamba chakula bora kinatoka moyoni, kikipikwa na malighafi ya asili ya Tanzania.
          </p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:0 }}>
            Bibi <strong>Veneranda</strong> ndiye moyo wa jiko letu. Mapishi yake yamepitishwa kutoka kizazi hadi kizazi â€” tangu Unyamwezini hadi Dar es Salaam. Leo, tunaleta ladha hiyo kwenye meza yako.
          </p>
        </div>
        <div style={{ display:"grid", gap:"12px", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
          {info.map((item,i) => (
            <div key={i} style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1rem 1.25rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <i className={`ti ${item.icon}`} style={{ fontSize:"20px", color:GOLD, flexShrink:0, marginTop:"2px" }} />
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   POLICY PAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function PolicyPage() {
  const policies = [
    { icon:"ti-clipboard-list", title:"1. Sera ya Maagizo",    body:"â€¢ Maagizo yanakubaliwa kupitia WhatsApp, simu, au tovuti yetu\nâ€¢ Chakula cha kawaida hutayarishwa ndani ya dakika 15â€“30\nâ€¢ Maagizo ya matukio (Events) yanahitaji siku 2â€“3 za mapema\nâ€¢ Tunashughulikia: Kuchukua, Delivery, Kula Hapa, na Matukio" },
    { icon:"ti-credit-card",    title:"2. Sera ya Malipo",     body:"â€¢ Tunakubali: Lipa Namba (18873261), Mixx by Yas, Airtel Money, Pesa Taslimu\nâ€¢ Malipo yanaweza fanywa kabla au wakati wa kupokea chakula\nâ€¢ Risiti hutolewa kwa maombi yoyote" },
    { icon:"ti-bike",           title:"3. Sera ya Delivery",   body:"â€¢ Tunahudumia maeneo ya Dar es Salaam\nâ€¢ Gharama ya delivery inategemea umbali â€” wasiliana nasi\nâ€¢ Muda wa delivery: ndani ya saa 1 baada ya chakula kutayarishwa" },
    { icon:"ti-refresh",        title:"4. Sera ya Kurejesha",  body:"â€¢ Kurejesha pesa kunafanyika ikiwa agizo halikutimizwa kwa sababu yetu\nâ€¢ Kanselo baada ya dakika 15 (chakula kikiandaliwa) linaweza kulipishwa asilimia 30\nâ€¢ Malalamiko yashughulikiwe haraka kupitia WhatsApp" },
    { icon:"ti-shield-check",   title:"5. Kanuni ya Chakula",  body:"â€¢ Chakula chetu kinapikwa kwa viungo vya asili, bila kemikali za ziada\nâ€¢ Hatuna dhamana kamili ya kukosa alerji â€” tafadhali tuambie mapema\nâ€¢ Bei zinaweza kubadilika bila taarifa ya awali\nâ€¢ Tunafuata Sheria ya Chakula, Dawa na Vipodozi (Cap 219)\nâ€¢ Leseni: BL01396922025-2605162556 | TIN: 192-791-243" },
    { icon:"ti-lock",           title:"6. Sera ya Faragha",    body:"â€¢ Habari zako za kibinafsi (jina, simu) zinakingwa na sisi\nâ€¢ Tunatumia maelezo yako kwa mawasiliano ya agizo lako pekee\nâ€¢ Hatutashiriki taarifa zako bila ruhusa yako wazi" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"2.5rem 1.5rem", textAlign:"center" }}>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Sera na Kanuni</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.65)", fontSize:"14px", margin:0 }}>Unyamwezini Jiko La Bibi JJJ â€” Dar es Salaam</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"1.5rem 1rem" }}>
        {policies.map((p,i) => (
          <div key={i} style={{ background:"#FFFFFF", borderRadius:"14px", padding:"1.5rem", marginBottom:"1rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", borderLeft:`5px solid ${GOLD}` }}>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:"16px", fontWeight:700, color:NAVY, margin:"0 0 0.8rem", display:"flex", alignItems:"center", gap:"8px" }}>
              <i className={`ti ${p.icon}`} style={{ color:GOLD, fontSize:"18px" }} />
              {p.title}
            </h3>
            <p style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(11,31,69,0.72)", lineHeight:1.85, margin:0, whiteSpace:"pre-line" }}>{p.body}</p>
          </div>
        ))}
        <div style={{ background:"rgba(212,175,55,0.10)", border:`1px solid rgba(212,175,55,0.40)`, borderRadius:"12px", padding:"1.25rem", textAlign:"center" }}>
          <p style={{ fontFamily:"sans-serif", fontSize:"13px", color:"rgba(11,31,69,0.65)", margin:0 }}>
            Maswali kuhusu sera hizi â€” WhatsApp: <strong style={{ color:NAVY }}>+255 655 709 024</strong>
          </p>
        </div>
      </div>
      <BottomBanner />
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN APP
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function App() {
  const { count } = useCart();
  const [page,         setPage]         = useState("home");
  const [sectionIdx,   setSectionIdx]   = useState(0);
  const [configItem,   setConfigItem]   = useState(null);
  const [cartOpen,     setCartOpen]     = useState(false);
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

      {page==="home"   && <HomePage   setPage={navigate} setSectionIdx={setSectionIdx} />}
      {page==="menu"   && <MenuPage   sectionIdx={sectionIdx} setSectionIdx={setSectionIdx} setConfigItem={setConfigItem} />}
      {page==="about"  && <AboutPage  />}
      {page==="policy" && <PolicyPage />}
      {page==="poster" && <JikoLaBibiMenu />}
      {page==="admin"  && <AdminPage  onExit={() => navigate("home")} />}

      <BottomNav
        page={page}
        setPage={navigate}
        onCartClick={() => setCartOpen(true)}
        cartCount={count}
      />

      {configItem    && <ItemModal    item={configItem} onClose={() => setConfigItem(null)} />}
      {cartOpen      && <CartDrawer   onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen  && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}        display:"flex", flexDirection:"column",
        alignItems:"center", textAlign:"center",
      }}>
        <h2 style={{
          fontFamily:"Georgia,serif", fontSize:"22px",
          fontWeight:900, color:"#FDF5E4", margin:"0 0 6px",
        }}>
          Karibu <span style={{ color:GOLD }}>Unyamwezini Jiko La Bibi JJJ</span>
        </h2>
        <p style={{
          fontFamily:"Georgia,serif", fontStyle:"italic",
          color:"rgba(253,245,228,0.72)", fontSize:"14px", margin:"0 0 1.6rem",
        }}>
          Taste of Tanzania in DAR 🇹🇿
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"18px", justifyContent:"center" }}>
          {[
            { icon:"ti-map-pin",        text:"Mbezi Luis, Goba Road, Dar es Salaam" },
            { icon:"ti-brand-whatsapp", text:"+255 655 709 024" },
            { icon:"ti-clock",          text:"Kila siku: 7:00 – 21:00" },
          ].map((r,i) => (
            <div key={i} style={{
              color:"#FDF5E4", fontFamily:"sans-serif",
              fontSize:"13px", display:"flex", alignItems:"center", gap:"7px",
            }}>
              <i className={`ti ${r.icon}`} style={{ color:GOLD, fontSize:"15px" }} />
              {r.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════ */
function HomePage({ setPage, setSectionIdx }) {
  return (
    <div>
      <Hero />

      {/* Marquee */}
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

      {/* ── Section preview cards — the WOW ── */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"2rem 1rem 1.5rem" }}>
        <h2 style={{
          fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:700,
          color:NAVY, margin:"0 0 1.2rem", textAlign:"center",
        }}>
          Menyu Yetu 🍽️
        </h2>

        <div style={{
          display:"grid", gap:"12px",
          gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
        }}>
          {sections.map((sec, i) => {
            const count = menu.filter(m => m.section === sec.id).length;
            return (
              <button
                key={sec.id}
                onClick={() => { setSectionIdx(i); setPage("menu"); }}
                style={{
                  background:"#FFFFFF",
                  border:`1.5px solid rgba(212,175,55,0.25)`,
                  borderRadius:"14px",
                  padding:"1.2rem 1rem",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                  cursor:"pointer", textAlign:"center",
                  boxShadow:"0 3px 12px rgba(11,31,69,0.07)",
                  transition:"transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 22px rgba(11,31,69,0.14)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 3px 12px rgba(11,31,69,0.07)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.25)"; }}
              >
                {/* Emoji in coloured circle */}
                <div style={{
                  width:"54px", height:"54px", borderRadius:"50%",
                  background: sec.color + "22",
                  border:`2px solid ${sec.color}55`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"26px",
                }}>
                  {menu.find(m => m.section === sec.id)?.emoji || "🍽️"}
                </div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", fontWeight:700, color:NAVY, lineHeight:1.3 }}>
                  {sec.name.sw}
                </div>
                <div style={{
                  fontFamily:"sans-serif", fontSize:"11px",
                  color:"rgba(11,31,69,0.45)",
                }}>
                  {count} {count === 1 ? "bidhaa" : "bidhaa"}
                </div>
                <div style={{
                  background:NAVY, color:GOLD,
                  borderRadius:"99px", padding:"4px 14px",
                  fontSize:"11px", fontFamily:"sans-serif", fontWeight:700,
                }}>
                  Angalia →
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <BottomBanner />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MENU PAGE — swipeable sections, proper max-width
══════════════════════════════════════════════════════ */
function MenuPage({ sectionIdx, setSectionIdx, setConfigItem }) {
  const touchStartX = useRef(null);
  const sec   = sections[sectionIdx];
  const items = menu.filter(m => m.section === sec.id);

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta >  60) setSectionIdx(i => Math.min(sections.length - 1, i + 1));
    if (delta < -60) setSectionIdx(i => Math.max(0, i - 1));
    touchStartX.current = null;
  }

  return (
    <div>
      {/* Section tabs */}
      <nav style={{
        position:"sticky", top:"60px", zIndex:30,
        background:"rgba(249,243,232,0.97)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid rgba(212,175,55,0.22)",
        overflowX:"auto", padding:"10px 12px",
        display:"flex", gap:"6px", scrollbarWidth:"none",
      }}>
        {sections.map((s,i) => (
          <button key={s.id} onClick={() => setSectionIdx(i)} style={{
            background: i===sectionIdx ? NAVY : "transparent",
            color:       i===sectionIdx ? GOLD : "rgba(11,31,69,0.5)",
            border:`1.5px solid ${i===sectionIdx ? NAVY : "rgba(11,31,69,0.18)"}`,
            borderRadius:"99px", padding:"6px 14px", whiteSpace:"nowrap",
            fontFamily:"sans-serif", fontSize:"12px",
            fontWeight: i===sectionIdx ? 700 : 400,
            cursor:"pointer", transition:"all 0.2s",
          }}>
            {s.name.sw.split(" ")[0]}
          </button>
        ))}
      </nav>

      {/* Swipeable area — MAX WIDTH 900px centred */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ maxWidth:"900px", margin:"0 auto" }}
      >
        {/* Section header — unified navy + gold */}
        <div style={{
          background:NAVY, padding:"14px 20px",
          display:"flex", alignItems:"center", gap:"12px",
        }}>
          <div style={{
            background:GOLD, color:NAVY2, width:"30px", height:"30px",
            borderRadius:"50%", display:"flex", alignItems:"center",
            justifyContent:"center", fontWeight:900, fontSize:"13px",
            flexShrink:0, fontFamily:"sans-serif",
          }}>
            {sectionIdx + 1}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:"17px", fontWeight:700, color:GOLD, lineHeight:1.2, margin:0 }}>
              {sec.name.sw}
            </h2>
            <p style={{ fontSize:"11px", fontStyle:"italic", color:"rgba(253,245,228,0.60)", margin:"2px 0 0" }}>
              {sec.name.en}
            </p>
          </div>
          <i className={`ti ${sec.icon}`} style={{ fontSize:"22px", color:"rgba(212,175,55,0.75)", flexShrink:0 }} aria-hidden="true" />
        </div>

        {/* Items — 2-column grid, centred, proper sizing */}
        <div style={{
          background: sectionIdx % 2 === 0 ? "#FFFBF3" : "#FBF4E4",
          padding:"18px",
          display:"grid", gap:"12px",
          gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
          minHeight:"220px",
        }}>
          {items.map(item => (
            <MenuItemCard key={item.id} item={item} onConfigure={setConfigItem} />
          ))}
        </div>

        {/* Prev / dots / Next */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 20px", background:"#F9F3E8",
          maxWidth:"900px", margin:"0 auto",
        }}>
          <button
            onClick={() => setSectionIdx(i => Math.max(0, i-1))}
            disabled={sectionIdx === 0}
            style={{
              background: sectionIdx===0 ? "rgba(11,31,69,0.07)" : NAVY,
              color:       sectionIdx===0 ? "rgba(11,31,69,0.28)" : GOLD,
              border:"none", borderRadius:"99px", padding:"10px 22px",
              fontFamily:"sans-serif", fontSize:"13px", fontWeight:700,
              cursor: sectionIdx===0 ? "default" : "pointer",
            }}
          >
            {sectionIdx > 0 ? `← ${sections[sectionIdx-1].name.sw.split(" ")[0]}` : "←"}
          </button>

          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
            {sections.map((_,i) => (
              <div key={i} onClick={() => setSectionIdx(i)} style={{
                width: i===sectionIdx ? "22px" : "8px",
                height:"8px", borderRadius:"4px",
                background: i===sectionIdx ? GOLD : "rgba(11,31,69,0.18)",
                cursor:"pointer", transition:"all 0.3s",
              }} />
            ))}
          </div>

          <button
            onClick={() => setSectionIdx(i => Math.min(sections.length-1, i+1))}
            disabled={sectionIdx === sections.length-1}
            style={{
              background: sectionIdx===sections.length-1 ? "rgba(11,31,69,0.07)" : NAVY,
              color:       sectionIdx===sections.length-1 ? "rgba(11,31,69,0.28)" : GOLD,
              border:"none", borderRadius:"99px", padding:"10px 22px",
              fontFamily:"sans-serif", fontSize:"13px", fontWeight:700,
              cursor: sectionIdx===sections.length-1 ? "default" : "pointer",
            }}
          >
            {sectionIdx < sections.length-1 ? `${sections[sectionIdx+1].name.sw.split(" ")[0]} →` : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ABOUT US
══════════════════════════════════════════════════════ */
function AboutPage() {
  const info = [
    { icon:"ti-map-pin",        label:"Mahali",     value:"Mbezi Luis, Goba Road (Chingwalu St), Dar es Salaam" },
    { icon:"ti-brand-whatsapp", label:"WhatsApp",   value:"+255 655 709 024" },
    { icon:"ti-clock",          label:"Saa za Kazi",value:"Kila siku: 7:00 asubuhi – 9:00 usiku" },
    { icon:"ti-credit-card",    label:"Lipa Namba", value:`${business.lipaNamba} — ${business.lipaName}` },
    { icon:"ti-wifi",           label:"WiFi",       value:"WiFi ya Bure kwa Wateja wote" },
    { icon:"ti-device-tv",      label:"Burudani",   value:"Michezo na Entertainment kwa Wateja" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"3rem 1.5rem 2rem", textAlign:"center" }}>
        <img src="/logo.png" alt="logo" width={120} height={120}
          style={{ borderRadius:"50%", border:`3px solid ${GOLD}`, objectFit:"cover", marginBottom:"1rem" }}
          onError={e => { e.target.style.display="none"; }} />
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Kuhusu Sisi</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.70)", fontSize:"15px", margin:0 }}>Taste of Tanzania in DAR</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"2rem 1rem" }}>
        <div style={{ background:"#FFFFFF", borderRadius:"16px", padding:"2rem", marginBottom:"1.5rem", boxShadow:"0 3px 14px rgba(11,31,69,0.08)", borderLeft:`5px solid ${GOLD}` }}>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:"20px", color:NAVY, margin:"0 0 1rem" }}>🏡 Hadithi Yetu</h2>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>
            Karibu kwenye mkusanyiko wa familia — mahali ambapo chakula halisi cha Tanzania kinaandaliwa kwa upendo na mikono ya Bibi wetu.
          </p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:"0 0 1rem" }}>
            <strong>Jiko La Bibi JJJ</strong> si mkahawa tu — ni nyumbani. Tunaamini kwamba chakula bora kinatoka moyoni, kikipikwa na malighafi ya asili ya Tanzania.
          </p>
          <p style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"rgba(11,31,69,0.78)", lineHeight:1.85, margin:0 }}>
            Bibi <strong>Veneranda</strong> ndiye moyo wa jiko letu. Mapishi yake yamepitishwa kutoka kizazi hadi kizazi — tangu Unyamwezini hadi Dar es Salaam. Leo, tunaleta ladha hiyo kwenye meza yako.
          </p>
        </div>
        <div style={{ display:"grid", gap:"12px", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
          {info.map((item,i) => (
            <div key={i} style={{ background:"#FFFFFF", borderRadius:"12px", padding:"1rem 1.25rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <i className={`ti ${item.icon}`} style={{ fontSize:"20px", color:GOLD, flexShrink:0, marginTop:"2px" }} />
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
    { icon:"ti-clipboard-list", title:"1. Sera ya Maagizo",    body:"• Maagizo yanakubaliwa kupitia WhatsApp, simu, au tovuti yetu\n• Chakula cha kawaida hutayarishwa ndani ya dakika 15–30\n• Maagizo ya matukio (Events) yanahitaji siku 2–3 za mapema\n• Tunashughulikia: Kuchukua, Delivery, Kula Hapa, na Matukio" },
    { icon:"ti-credit-card",    title:"2. Sera ya Malipo",     body:"• Tunakubali: Lipa Namba (18873261), Mixx by Yas, Airtel Money, Pesa Taslimu\n• Malipo yanaweza fanywa kabla au wakati wa kupokea chakula\n• Risiti hutolewa kwa maombi yoyote" },
    { icon:"ti-bike",           title:"3. Sera ya Delivery",   body:"• Tunahudumia maeneo ya Dar es Salaam\n• Gharama ya delivery inategemea umbali — wasiliana nasi\n• Muda wa delivery: ndani ya saa 1 baada ya chakula kutayarishwa" },
    { icon:"ti-refresh",        title:"4. Sera ya Kurejesha",  body:"• Kurejesha pesa kunafanyika ikiwa agizo halikutimizwa kwa sababu yetu\n• Kanselo baada ya dakika 15 (chakula kikiandaliwa) linaweza kulipishwa asilimia 30\n• Malalamiko yashughulikiwe haraka kupitia WhatsApp" },
    { icon:"ti-shield-check",   title:"5. Kanuni ya Chakula",  body:"• Chakula chetu kinapikwa kwa viungo vya asili, bila kemikali za ziada\n• Hatuna dhamana kamili ya kukosa alerji — tafadhali tuambie mapema\n• Bei zinaweza kubadilika bila taarifa ya awali\n• Tunafuata Sheria ya Chakula, Dawa na Vipodozi (Cap 219)\n• Leseni: BL01396922025-2605162556 | TIN: 192-791-243" },
    { icon:"ti-lock",           title:"6. Sera ya Faragha",    body:"• Habari zako za kibinafsi (jina, simu) zinakingwa na sisi\n• Tunatumia maelezo yako kwa mawasiliano ya agizo lako pekee\n• Hatutashiriki taarifa zako bila ruhusa yako wazi" },
  ];
  return (
    <div>
      <div style={{ background:NAVY2, padding:"2.5rem 1.5rem", textAlign:"center" }}>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:900, color:"#FDF5E4", margin:"0 0 6px" }}>Sera na Kanuni</h1>
        <p style={{ fontFamily:"Georgia,serif", fontStyle:"italic", color:"rgba(253,245,228,0.65)", fontSize:"14px", margin:0 }}>Unyamwezini Jiko La Bibi JJJ — Dar es Salaam</p>
      </div>
      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"1.5rem 1rem" }}>
        {policies.map((p,i) => (
          <div key={i} style={{ background:"#FFFFFF", borderRadius:"14px", padding:"1.5rem", marginBottom:"1rem", boxShadow:"0 2px 10px rgba(11,31,69,0.07)", borderLeft:`5px solid ${GOLD}` }}>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:"16px", fontWeight:700, color:NAVY, margin:"0 0 0.8rem", display:"flex", alignItems:"center", gap:"8px" }}>
              <i className={`ti ${p.icon}`} style={{ color:GOLD, fontSize:"18px" }} />
              {p.title}
            </h3>
            <p style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(11,31,69,0.72)", lineHeight:1.85, margin:0, whiteSpace:"pre-line" }}>{p.body}</p>
          </div>
        ))}
        <div style={{ background:"rgba(212,175,55,0.10)", border:`1px solid rgba(212,175,55,0.40)`, borderRadius:"12px", padding:"1.25rem", textAlign:"center" }}>
          <p style={{ fontFamily:"sans-serif", fontSize:"13px", color:"rgba(11,31,69,0.65)", margin:0 }}>
            Maswali kuhusu sera hizi — WhatsApp: <strong style={{ color:NAVY }}>+255 655 709 024</strong>
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
  const [page,         setPage]         = useState("home");
  const [sectionIdx,   setSectionIdx]   = useState(0);
  const [configItem,   setConfigItem]   = useState(null);
  const [cartOpen,     setCartOpen]     = useState(false);
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

      {page==="home"   && <HomePage   setPage={navigate} setSectionIdx={setSectionIdx} />}
      {page==="menu"   && <MenuPage   sectionIdx={sectionIdx} setSectionIdx={setSectionIdx} setConfigItem={setConfigItem} />}
      {page==="about"  && <AboutPage  />}
      {page==="policy" && <PolicyPage />}
      {page==="admin"  && <AdminPage  onExit={() => navigate("home")} />}

      <BottomNav
        page={page}
        setPage={navigate}
        onCartClick={() => setCartOpen(true)}
        cartCount={count}
      />

      {configItem    && <ItemModal    item={configItem} onClose={() => setConfigItem(null)} />}
      {cartOpen      && <CartDrawer   onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen  && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </div>
  );
}
