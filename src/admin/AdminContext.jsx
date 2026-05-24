import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);
function load(key, def) { try { return JSON.parse(localStorage.getItem(key)||"null")??def; } catch { return def; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

const todayStr = () => new Date().toISOString().split("T")[0];

export function AdminProvider({ children }) {
  const [prices,     setPrices]     = useState(()=>load("jiko-prices",{}));
  const [stock,      setStock]      = useState(()=>load("jiko-stock",{}));
  const [orders,     setOrders]     = useState(()=>load("jiko-orders",[]));
  const [itemCosts,  setItemCosts]  = useState({});
  const [goals,      setGoalsState] = useState(()=>load("jiko-goals",{daily:0,weekly:0,monthly:0}));
  const [todaySales, setTodaySales] = useState([]);
  const [allSales,   setAllSales]   = useState([]);
  const [allCosts,   setAllCosts]   = useState([]);
  const [synced,     setSynced]     = useState(false);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const today = todayStr();
    async function init() {
      const [{data:pr},{data:sr},{data:sales},{data:costs},{data:ic}] = await Promise.all([
        supabase.from("price_overrides").select("item_id,price"),
        supabase.from("stock_status").select("item_id,out_of_stock"),
        supabase.from("sales").select("*").eq("sale_date",today).order("created_at",{ascending:false}),
        supabase.from("daily_costs").select("*").order("cost_date",{ascending:false}).limit(200),
        supabase.from("item_costs").select("*"),
      ]);
      if(pr?.length){const p={};pr.forEach(r=>{p[r.item_id]=r.price;});setPrices(p);save("jiko-prices",p);}
      if(sr?.length){const s={};sr.forEach(r=>{s[r.item_id]=r.out_of_stock;});setStock(s);save("jiko-stock",s);}
      if(sales){setTodaySales(sales);}
      if(costs){setAllCosts(costs);}
      if(ic?.length){const c={};ic.forEach(r=>{c[r.item_id]=r.cost_per_unit;});setItemCosts(c);}
      setSynced(true);
    }
    init();
    const xs=supabase.channel("sales_rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"sales"},p=>{
      if(p.new.sale_date===todayStr()) setTodaySales(prev=>[p.new,...prev]);
      setAllSales(prev=>[p.new,...prev]);
    }).subscribe();
    const cs=supabase.channel("costs_rt").on("postgres_changes",{event:"*",schema:"public",table:"daily_costs"},async()=>{
      const {data}=await supabase.from("daily_costs").select("*").order("cost_date",{ascending:false}).limit(200);
      if(data) setAllCosts(data);
    }).subscribe();
    return()=>{supabase.removeChannel(xs);supabase.removeChannel(cs);};
  },[]);

  /* ── FETCH by date range ── */
  const fetchRange = useCallback(async(start,end)=>{
    if(!supabase)return;
    setLoading(true);
    const [{data:sales},{data:costs}]=await Promise.all([
      supabase.from("sales").select("*").gte("sale_date",start).lte("sale_date",end).order("sale_date",{ascending:false}),
      supabase.from("daily_costs").select("*").gte("cost_date",start).lte("cost_date",end).order("cost_date",{ascending:false}),
    ]);
    if(sales) setAllSales(sales);
    if(costs) setAllCosts(costs);
    setLoading(false);
  },[]);

  /* ── COMPUTED ── */
  const todayGross = useMemo(()=>todaySales.reduce((s,r)=>s+r.total_price,0),[todaySales]);
  const todayCosts = useMemo(()=>allCosts.filter(c=>c.cost_date===todayStr()),[allCosts]);
  const todayOverhead = useMemo(()=>todayCosts.reduce((s,c)=>s+c.amount,0),[todayCosts]);
  const todayItemCost = useMemo(()=>todaySales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0),[todaySales,itemCosts]);
  const todayNet = useMemo(()=>{
    if(!Object.keys(itemCosts).length&&todayOverhead===0) return null;
    return todayGross-todayItemCost-todayOverhead;
  },[todayGross,todayItemCost,todayOverhead,itemCosts]);

  /* ── GOALS ── */
  function setGoal(type,amount){
    const next={...goals,[type]:parseInt(amount)||0};
    setGoalsState(next); save("jiko-goals",next);
  }

  /* ── RECORD SALE (any date) ── */
  async function recordSale(item,qty,service,date){
    const saleDate=date||todayStr();
    const up=prices[item.id]??item.price??(item.sizes?item.sizes[0].price:0);
    const tp=up*qty;
    const rec={item_id:item.id,item_name:item.name.sw,section_id:item.section,quantity:qty,unit_price:up,total_price:tp,service_type:service,sale_date:saleDate};
    const newRec={...rec,id:Date.now(),created_at:new Date().toISOString()};
    if(saleDate===todayStr()) setTodaySales(prev=>[newRec,...prev]);
    setAllSales(prev=>[newRec,...prev]);
    if(supabase) await supabase.from("sales").insert(rec);
  }

  /* ── RECORD COST (any date, daily or bulk) ── */
  async function recordCost(category,description,amount,date,spendingType="daily"){
    const costDate=date||todayStr();
    const rec={cost_date:costDate,category,description:description||category,amount:parseInt(amount)||0,spending_type:spendingType};
    const newRec={...rec,id:Date.now(),created_at:new Date().toISOString()};
    setAllCosts(prev=>[newRec,...prev]);
    if(supabase) await supabase.from("daily_costs").insert(rec);
  }
  async function deleteCost(id){
    setAllCosts(prev=>prev.filter(c=>c.id!==id));
    if(supabase) await supabase.from("daily_costs").delete().eq("id",id);
  }
  async function deleteSale(id){
    setTodaySales(prev=>prev.filter(s=>s.id!==id));
    setAllSales(prev=>prev.filter(s=>s.id!==id));
    if(supabase) await supabase.from("sales").delete().eq("id",id);
  }

  /* ── EXISTING HELPERS ── */
  async function overridePrice(id,price){
    const next={...prices,[id]:price};setPrices(next);save("jiko-prices",next);
    if(supabase) await supabase.from("price_overrides").upsert({item_id:id,price,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  async function toggleStock(id){
    const v=!stock[id],next={...stock,[id]:v};setStock(next);save("jiko-stock",next);
    if(supabase) await supabase.from("stock_status").upsert({item_id:id,out_of_stock:v,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  async function setCost(itemId,cost){
    const next={...itemCosts,[itemId]:cost};setItemCosts(next);
    if(supabase) await supabase.from("item_costs").upsert({item_id:itemId,cost_per_unit:cost,updated_at:new Date().toISOString()},{onConflict:"item_id"});
  }
  function addOrder(o){const n=[o,...orders].slice(0,200);setOrders(n);save("jiko-orders",n);}
  function updateOrderStatus(id,status){const n=orders.map(o=>o.id===id?{...o,status}:o);setOrders(n);save("jiko-orders",n);}

  return (
    <Ctx.Provider value={{
      prices,stock,orders,todaySales,allSales,allCosts,todayCosts,
      itemCosts,synced,loading,goals,
      todayGross,todayNet,todayOverhead,todayItemCost,
      setGoal,recordSale,recordCost,deleteCost,deleteSale,
      overridePrice,toggleStock,setCost,addOrder,updateOrderStatus,
      fetchRange, isOutOfStock:(id)=>!!stock[id],
    }}>
      {children}
    </Ctx.Provider>
  );
}
export function useAdmin(){const c=useContext(Ctx);if(!c)throw new Error("useAdmin outside AdminProvider");return c;}
