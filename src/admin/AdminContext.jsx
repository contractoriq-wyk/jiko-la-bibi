import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);
function load(key, def) { try { return JSON.parse(localStorage.getItem(key)||"null")??def; } catch { return def; } }

export function AdminProvider({ children }) {
  const [prices,     setPrices]     = useState(()=>load("jiko-prices",{}));
  const [stock,      setStock]      = useState(()=>load("jiko-stock",{}));
  const [orders,     setOrders]     = useState(()=>load("jiko-orders",[]));
  const [todaySales, setTodaySales] = useState([]);
  const [itemCosts,  setItemCosts]  = useState({});
  const [synced,     setSynced]     = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const today = new Date().toISOString().split("T")[0];

    async function init() {
      const [
        {data:pr},{data:sr},{data:sales},{data:costs}
      ] = await Promise.all([
        supabase.from("price_overrides").select("item_id,price"),
        supabase.from("stock_status").select("item_id,out_of_stock"),
        supabase.from("sales").select("*").eq("sale_date",today).order("created_at",{ascending:false}),
        supabase.from("item_costs").select("*"),
      ]);
      if (pr?.length)    { const p={}; pr.forEach(r=>{p[r.item_id]=r.price;}); setPrices(p); localStorage.setItem("jiko-prices",JSON.stringify(p)); }
      if (sr?.length)    { const s={}; sr.forEach(r=>{s[r.item_id]=r.out_of_stock;}); setStock(s); localStorage.setItem("jiko-stock",JSON.stringify(s)); }
      if (sales)         setTodaySales(sales);
      if (costs?.length) { const c={}; costs.forEach(r=>{c[r.item_id]=r.cost_per_unit;}); setItemCosts(c); }
      setSynced(true);
    }
    init();

    const ps = supabase.channel("prices").on("postgres_changes",{event:"*",schema:"public",table:"price_overrides"},p=>{
      const {item_id,price}=p.new||{}; if(!item_id)return;
      setPrices(prev=>{const next={...prev,[item_id]:price};localStorage.setItem("jiko-prices",JSON.stringify(next));return next;});
    }).subscribe();

    const ss = supabase.channel("stocks").on("postgres_changes",{event:"*",schema:"public",table:"stock_status"},p=>{
      const {item_id,out_of_stock}=p.new||{}; if(!item_id)return;
      setStock(prev=>{const next={...prev,[item_id]:out_of_stock};localStorage.setItem("jiko-stock",JSON.stringify(next));return next;});
    }).subscribe();

    const xs = supabase.channel("sales").on("postgres_changes",{event:"INSERT",schema:"public",table:"sales"},p=>{
      setTodaySales(prev=>[p.new,...prev]);
    }).subscribe();

    return ()=>{ supabase.removeChannel(ps); supabase.removeChannel(ss); supabase.removeChannel(xs); };
  },[]);

  const todayGross = useMemo(()=>todaySales.reduce((s,r)=>s+r.total_price,0),[todaySales]);
  const todayNet   = useMemo(()=>{
    if(!Object.keys(itemCosts).length) return null;
    const cost=todaySales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0);
    return todayGross-cost;
  },[todaySales,itemCosts,todayGross]);

  async function overridePrice(id,price) {
    const next={...prices,[id]:price}; setPrices(next); localStorage.setItem("jiko-prices",JSON.stringify(next));
    if(supabase) await supabase.from("price_overrides").upsert({item_id:id,price,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  async function toggleStock(id) {
    const v=!stock[id],next={...stock,[id]:v}; setStock(next); localStorage.setItem("jiko-stock",JSON.stringify(next));
    if(supabase) await supabase.from("stock_status").upsert({item_id:id,out_of_stock:v,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  async function recordSale(item,qty,service="pickup") {
    const up=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
    const tp=up*qty;
    const rec={item_id:item.id,item_name:item.name.sw,section_id:item.section,quantity:qty,unit_price:up,total_price:tp,service_type:service};
    setTodaySales(prev=>[{...rec,id:Date.now(),created_at:new Date().toISOString(),sale_date:new Date().toISOString().split("T")[0]},...prev]);
    if(supabase) await supabase.from("sales").insert(rec);
  }
  async function setCost(itemId,cost) {
    const next={...itemCosts,[itemId]:cost}; setItemCosts(next);
    if(supabase) await supabase.from("item_costs").upsert({item_id:itemId,cost_per_unit:cost,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  function addOrder(o) { const n=[o,...orders].slice(0,200); setOrders(n); localStorage.setItem("jiko-orders",JSON.stringify(n)); }
  function updateOrderStatus(id,status) { const n=orders.map(o=>o.id===id?{...o,status}:o); setOrders(n); localStorage.setItem("jiko-orders",JSON.stringify(n)); }

  return (
    <Ctx.Provider value={{
      prices,stock,orders,todaySales,itemCosts,synced,todayGross,todayNet,
      overridePrice,toggleStock,recordSale,setCost,addOrder,updateOrderStatus,
      isOutOfStock:(id)=>!!stock[id],
    }}>
      {children}
    </Ctx.Provider>
  );
}
export function useAdmin() { const c=useContext(Ctx); if(!c) throw new Error("useAdmin outside AdminProvider"); return c; }
