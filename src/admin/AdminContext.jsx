import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? def; }
  catch { return def; }
}

export function AdminProvider({ children }) {
  const [prices,  setPrices]  = useState(() => load("jiko-prices", {}));
  const [stock,   setStock]   = useState(() => load("jiko-stock",  {}));
  const [orders,  setOrders]  = useState(() => load("jiko-orders", []));
  const [synced,  setSynced]  = useState(false);

  /* ── On mount: pull latest prices + stock from Supabase ── */
  useEffect(() => {
    if (!supabase) return;

    async function fetchFromDB() {
      const [{ data: priceRows }, { data: stockRows }] = await Promise.all([
        supabase.from("price_overrides").select("item_id, price"),
        supabase.from("stock_status").select("item_id, out_of_stock"),
      ]);

      if (priceRows?.length) {
        const p = {};
        priceRows.forEach(r => { p[r.item_id] = r.price; });
        setPrices(p);
        localStorage.setItem("jiko-prices", JSON.stringify(p));
      }

      if (stockRows?.length) {
        const s = {};
        stockRows.forEach(r => { s[r.item_id] = r.out_of_stock; });
        setStock(s);
        localStorage.setItem("jiko-stock", JSON.stringify(s));
      }

      setSynced(true);
    }

    fetchFromDB();

    /* ── Real-time: prices update instantly for all customers ── */
    const priceSub = supabase
      .channel("price-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "price_overrides" },
        payload => {
          const { item_id, price } = payload.new || {};
          if (!item_id) return;
          setPrices(prev => {
            const next = { ...prev, [item_id]: price };
            localStorage.setItem("jiko-prices", JSON.stringify(next));
            return next;
          });
        }
      )
      .subscribe();

    const stockSub = supabase
      .channel("stock-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_status" },
        payload => {
          const { item_id, out_of_stock } = payload.new || {};
          if (!item_id) return;
          setStock(prev => {
            const next = { ...prev, [item_id]: out_of_stock };
            localStorage.setItem("jiko-stock", JSON.stringify(next));
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(priceSub);
      supabase.removeChannel(stockSub);
    };
  }, []);

  /* ── Save price — local immediately, then sync to Supabase ── */
  async function overridePrice(id, price) {
    const next = { ...prices, [id]: price };
    setPrices(next);
    localStorage.setItem("jiko-prices", JSON.stringify(next));

    if (supabase) {
      await supabase.from("price_overrides").upsert(
        { item_id: id, price, updated_at: new Date().toISOString() },
        { onConflict: "item_id" }
      );
    }
  }

  /* ── Toggle stock — local immediately, then sync to Supabase ── */
  async function toggleStock(id) {
    const newVal = !stock[id];
    const next   = { ...stock, [id]: newVal };
    setStock(next);
    localStorage.setItem("jiko-stock", JSON.stringify(next));

    if (supabase) {
      await supabase.from("stock_status").upsert(
        { item_id: id, out_of_stock: newVal, updated_at: new Date().toISOString() },
        { onConflict: "item_id" }
      );
    }
  }

  function addOrder(order) {
    const next = [order, ...orders].slice(0, 200);
    setOrders(next);
    localStorage.setItem("jiko-orders", JSON.stringify(next));
  }

  function updateOrderStatus(id, status) {
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(next);
    localStorage.setItem("jiko-orders", JSON.stringify(next));
  }

  return (
    <Ctx.Provider value={{
      prices, stock, orders, synced,
      overridePrice, toggleStock, addOrder, updateOrderStatus,
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
