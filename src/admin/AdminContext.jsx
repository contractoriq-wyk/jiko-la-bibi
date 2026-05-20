import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? def; }
  catch { return def; }
}

export function AdminProvider({ children }) {
  const [prices,   setPrices]   = useState(() => load("jiko-prices",  {}));
  const [stock,    setStock]    = useState(() => load("jiko-stock",   {}));
  const [orders,   setOrders]   = useState(() => load("jiko-orders",  []));

  function overridePrice(id, price) {
    const next = { ...prices, [id]: price };
    setPrices(next);
    localStorage.setItem("jiko-prices", JSON.stringify(next));
  }

  function toggleStock(id) {
    const next = { ...stock, [id]: !stock[id] };
    setStock(next);
    localStorage.setItem("jiko-stock", JSON.stringify(next));
  }

  function addOrder(order) {
    const next = [order, ...orders].slice(0, 200); // keep last 200
    setOrders(next);
    localStorage.setItem("jiko-orders", JSON.stringify(next));
  }

  function updateOrderStatus(id, status) {
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(next);
    localStorage.setItem("jiko-orders", JSON.stringify(next));
  }

  function getPrice(item) {
    if (prices[item.id] !== undefined) return prices[item.id];
    if (item.sizes) return Math.min(...item.sizes.map(s => s.price));
    return item.price;
  }

  return (
    <Ctx.Provider value={{
      prices, stock, orders,
      overridePrice, toggleStock, addOrder, updateOrderStatus, getPrice,
      isOutOfStock: (id) => !!stock[id],
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin outside AdminProvider");
  return ctx;
}
