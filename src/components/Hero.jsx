import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

export default function Hero({ compact = false }) {
  const { lang, t } = useLang();

  function handleWA() {
    const text = encodeURIComponent(
      lang === "sw"
        ? "Habari Jiko La Bibi JJJ, ningependa kuagiza..."
        : "Hello Jiko La Bibi JJJ, I would like to order..."
    );
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      window.location.href = `intent://send?phone=${business.whatsapp}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    } else {
      window.open(`https://wa.me/${business.whatsapp}?text=${text}`, "_blank");
    }
  }

  // Clean top banner: just the picture (it already carries the name and tagline),
  // then the two buttons customers actually use. The header above shows the logo and name.
  return (
    <section id="top" style={{ position:"relative", background:"#06132E" }}>
      <style>{`
        @keyframes jlbZoom{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.05) translate(-.8%,-.4%)}}
        @keyframes jlbSweep{0%,55%{transform:translateX(-120%) skewX(-18deg)}100%{transform:translateX(320%) skewX(-18deg)}}
        @keyframes jlbTwinkle{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
        @keyframes jlbFire{0%,100%{opacity:.35;transform:scale(.9)}35%{opacity:.8;transform:scale(1.1)}65%{opacity:.5;transform:scale(1)}}
        @keyframes jlbSteam{0%{opacity:0;transform:translate(0,0) scale(.5)}20%{opacity:.6}70%{opacity:.25}100%{opacity:0;transform:translate(var(--dx),-70px) scale(2.4)}}
        @keyframes jlbStir{0%{transform:translate(3px,0)}25%{transform:translate(0,3px)}50%{transform:translate(-3px,0)}75%{transform:translate(0,-3px)}100%{transform:translate(3px,0)}}
        @keyframes jlbNod{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
        .jlb-hero .jlb-m{pointer-events:none;position:absolute}
        .jlb-hero .jlb-layer{pointer-events:none;position:absolute;inset:0;background:url(/banner.jpg) 0 0/100% 100% no-repeat}
        @media (prefers-reduced-motion: reduce){.jlb-hero .jlb-m,.jlb-hero .jlb-layer,.jlb-hero .jlb-zoom{animation:none!important}.jlb-hero .jlb-m,.jlb-hero .jlb-layer{display:none}}
      `}</style>
      <svg width="0" height="0" style={{ position:"absolute" }} aria-hidden="true">
        <filter id="jlbWave" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="turbulence" baseFrequency="0.004 0.02" numOctaves="1" seed="3" result="n">
            <animate attributeName="baseFrequency" dur="5s" repeatCount="indefinite"
              values="0.004 0.02;0.008 0.03;0.004 0.02" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="jlb-hero" style={{ position:"relative", overflow:"hidden", lineHeight:0 }}>
        <div className="jlb-zoom" style={{ position:"relative", transformOrigin:"50% 60%", animation:"jlbZoom 14s ease-in-out infinite alternate" }}>
          <img
            src="/banner.jpg"
            alt="Unyamwezini Jiko La Bibi JJJ — Taste of Tanzania in DAR"
            style={{ display:"block", width:"100%", height:"auto" }}
          />
          {/* Wavy title: a copy of the lettering, rippled, feathered into the picture */}
          <div className="jlb-m" style={{ left:"2%", top:"14%", width:"48%", height:"48%",
            WebkitMaskImage:"radial-gradient(ellipse 50% 50% at 50% 50%,#000 70%,transparent 100%)",
            maskImage:"radial-gradient(ellipse 50% 50% at 50% 50%,#000 70%,transparent 100%)" }}>
            <div className="jlb-layer" style={{ background:"url(/banner.jpg) 3.85% 26.9%/208.33% 208.33% no-repeat", filter:"url(#jlbWave)" }} />
          </div>
          {/* Bibi stirring the pot: her hands and spoon area moves in a small circle */}
          <div className="jlb-m" style={{ inset:0,
            WebkitMaskImage:"radial-gradient(ellipse 9% 15% at 66% 64%,#000 55%,transparent 100%)",
            maskImage:"radial-gradient(ellipse 9% 15% at 66% 64%,#000 55%,transparent 100%)" }}>
            <div className="jlb-layer" style={{ animation:"jlbStir 2.2s linear infinite" }} />
          </div>
          {/* Bibi's head/shoulders: gentle nod */}
          <div className="jlb-m" style={{ inset:0,
            WebkitMaskImage:"radial-gradient(ellipse 6% 22% at 66% 40%,#000 55%,transparent 100%)",
            maskImage:"radial-gradient(ellipse 6% 22% at 66% 40%,#000 55%,transparent 100%)" }}>
            <div className="jlb-layer" style={{ animation:"jlbNod 3s ease-in-out infinite" }} />
          </div>
          {/* Gold shine sweeping across the title */}
          <div className="jlb-m" style={{ left:0, top:"18%", width:"50%", height:"48%", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, width:"28%", background:"linear-gradient(90deg,transparent,rgba(255,244,190,.55),transparent)", mixBlendMode:"screen", animation:"jlbSweep 5s ease-in-out infinite" }} />
          </div>
          {/* Sparkles */}
          {[[7,26,0],[23,20,.9],[41,33,1.8],[14,50,2.7],[33,56,3.4]].map(([x,y,d],i)=>(
            <span key={i} className="jlb-m" style={{ left:x+"%", top:y+"%", width:12, height:12, marginLeft:-6, marginTop:-6,
              background:"radial-gradient(circle,#fff 0,#ffe9a0 35%,transparent 70%)",
              clipPath:"polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)",
              animation:`jlbTwinkle 3.6s ease-in-out ${d}s infinite` }} />
          ))}
          {/* Fire glow under the pot */}
          <div className="jlb-m" style={{ left:"60%", top:"72%", width:"16%", height:"16%", borderRadius:"50%",
            background:"radial-gradient(circle,rgba(255,150,40,.75),rgba(255,90,0,.25) 50%,transparent 70%)",
            mixBlendMode:"screen", animation:"jlbFire 1.6s ease-in-out infinite" }} />
          {/* Steam rising high from the pot */}
          {[[0,-6],[.9,4],[1.8,-2],[2.7,7],[3.5,0]].map(([d,dx],i)=>(
            <span key={i} className="jlb-m" style={{ left:(62+i*2.2)+"%", top:"60%", width:20, height:20, borderRadius:"50%", "--dx":dx+"px",
              background:"radial-gradient(circle,rgba(255,255,255,.7),transparent 70%)", filter:"blur(3px)",
              animation:`jlbSteam 4.2s ease-out ${d}s infinite` }} />
          ))}
        </div>
      </div>

      {/* Gold edge */}
      <div style={{ height:"2px", background:"linear-gradient(to right,transparent,#6b4e0a,#D4AF37,#f7e8a0,#D4AF37,#6b4e0a,transparent)" }} />

      {/* Buttons (hidden on the new home screen, which has its own Order Pickup / Delivery buttons) */}
      {!compact && <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center", padding:"16px 14px 18px" }}>
        <a href="#menu" style={{
          background:"#D4AF37", color:"#06132E",
          borderRadius:"99px", padding:"12px 30px",
          fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
          textDecoration:"none", display:"inline-block",
          boxShadow:"0 4px 16px rgba(212,175,55,0.35)",
        }}>
          {lang === "sw" ? "Tazama Menyu" : "View Menu"} →
        </a>
        <button onClick={handleWA} style={{
          background:"#25d366", color:"#fff",
          border:"none", borderRadius:"99px", padding:"12px 26px",
          fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
          cursor:"pointer", display:"flex", alignItems:"center", gap:"7px",
          boxShadow:"0 4px 16px rgba(37,211,102,0.3)",
        }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize:"18px" }} />
          WhatsApp Business
        </button>
      </div>}

      {/* Kanga stripe */}
      <div style={{
        height:"6px",
        background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)",
      }} />
    </section>
  );
}
