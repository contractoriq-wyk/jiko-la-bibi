const GOLD  = "#D4AF37";
const NAVY2 = "#06132E";

const NAV = [
  { key:"home",   icon:"ti-home",         sw:"Nyumbani" },
  { key:"menu",   icon:"ti-flame",        sw:"Menyu"    },
  { key:"about",  icon:"ti-users",        sw:"Kuhusu"   },
  { key:"policy", icon:"ti-shield-check", sw:"Sera"     },
];

export default function BottomNav({ page, setPage, onCartClick, cartCount }) {
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:50,
      background:NAVY2, borderTop:`2px solid ${GOLD}`,
      display:"flex", height:"65px",
      boxShadow:"0 -4px 20px rgba(6,19,46,0.35)",
    }}>
      {NAV.map(item => {
        const active = page === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:"2px",
              background:"none", border:"none", cursor:"pointer",
              color: active ? GOLD : "rgba(253,245,228,0.42)",
              transition:"color 0.2s",
            }}
          >
            {active && (
              <div style={{
                position:"absolute", top:0,
                width:"32px", height:"3px",
                background:GOLD, borderRadius:"0 0 3px 3px",
              }} />
            )}
            <i className={`ti ${item.icon}`} style={{ fontSize:"22px" }} aria-hidden="true" />
            <span style={{ fontSize:"10px", fontFamily:"sans-serif", fontWeight: active ? 700 : 400, letterSpacing:"0.3px" }}>
              {item.sw}
            </span>
          </button>
        );
      })}

      {/* Cart button */}
      <button
        onClick={onCartClick}
        style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:"2px",
          background:"none", border:"none", cursor:"pointer",
          color:"rgba(253,245,228,0.42)", position:"relative",
        }}
      >
        <i className="ti ti-shopping-cart" style={{ fontSize:"22px" }} aria-hidden="true" />
        <span style={{ fontSize:"10px", fontFamily:"sans-serif" }}>Oda</span>
        {cartCount > 0 && (
          <span style={{
            position:"absolute", top:"8px", left:"54%",
            background:GOLD, color:"#06132E",
            borderRadius:"50%", width:"17px", height:"17px",
            fontSize:"9px", fontWeight:900,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
