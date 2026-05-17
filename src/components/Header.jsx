import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { CartIcon } from "./Icons";

export default function Header({ onCartClick }) {
  const { lang, toggle } = useLang();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40">
      <div style={{height:"6px",background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)"}} />
      <div style={{background:"rgba(6,19,46,0.97)",backdropFilter:"blur(8px)"}}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">

          <a href="#top" className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="Jiko La Bibi JJJ"
              width={40} height={40}
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
              style={{borderRadius:"50%",border:"2px solid #D4AF37",objectFit:"cover",flexShrink:0}}
            />
            <span style={{display:"none",width:40,height:40,borderRadius:"50%",border:"2px solid #D4AF37",
              background:"#0B1F45",color:"#D4AF37",fontWeight:"900",fontSize:"12px",
              alignItems:"center",justifyContent:"center",flexShrink:0}}>
              JJJ
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display font-bold text-cream" style={{fontSize:"15px",lineHeight:1.2}}>
                {business.shortName}
              </span>
              <span className="block truncate italic text-gold/80" style={{fontSize:"10px"}}>
                {business.tagline_en}
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button onClick={toggle}
              style={{border:"1px solid rgba(212,175,55,0.5)",color:"#D4AF37",borderRadius:"16px",
                padding:"4px 12px",fontSize:"11px",fontWeight:"bold",background:"transparent",cursor:"pointer"}}>
              {lang === "sw" ? "EN" : "SW"}
            </button>
            <button onClick={onCartClick} aria-label="Open cart"
              style={{background:"#D4AF37",borderRadius:"50%",width:38,height:38,
                display:"grid",placeItems:"center",border:"none",cursor:"pointer",position:"relative"}}>
              <CartIcon style={{color:"#0B1F45"}} />
              {count > 0 && (
                <span style={{position:"absolute",top:-4,right:-4,background:"#0B1F45",color:"#D4AF37",
                  borderRadius:"50%",minWidth:18,height:18,fontSize:10,fontWeight:"bold",
                  display:"grid",placeItems:"center",border:"2px solid #06132E"}}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
