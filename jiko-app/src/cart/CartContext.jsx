// ============================================================
//  CART STATE  —  shared shopping-cart logic for the whole app.
// ============================================================
import { createContext, useContext, useEffect, useReducer } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "jiko-cart-v1";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// A cart "line" is uniquely identified by item + chosen size + chosen choice.
function lineKey(line) {
  return [line.itemId, line.sizeId || "", line.choiceId || ""].join("|");
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const incoming = action.line;
      const key = lineKey(incoming);
      const existing = state.find((l) => lineKey(l) === key);
      if (existing) {
        return state.map((l) =>
          lineKey(l) === key ? { ...l, qty: l.qty + incoming.qty } : l
        );
      }
      return [...state, incoming];
    }
    case "SET_QTY": {
      return state
        .map((l) => (lineKey(l) === action.key ? { ...l, qty: action.qty } : l))
        .filter((l) => l.qty > 0);
    }
    case "REMOVE":
      return state.filter((l) => lineKey(l) !== action.key);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore storage errors */
    }
  }, [cart]);

  const total = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const count = cart.reduce((sum, l) => sum + l.qty, 0);

  const value = {
    cart,
    total,
    count,
    addLine: (line) => dispatch({ type: "ADD", line }),
    setQty: (key, qty) => dispatch({ type: "SET_QTY", key, qty }),
    removeLine: (key) => dispatch({ type: "REMOVE", key }),
    clearCart: () => dispatch({ type: "CLEAR" }),
    keyOf: lineKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
