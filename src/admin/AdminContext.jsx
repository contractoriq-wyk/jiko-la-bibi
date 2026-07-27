import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);
function load(key, def) { try { return JSON.parse(localStorage.getItem(key)||"null")??def; } catch { return def; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
// Returns YYYY-MM-DD for the given date (default: now) in America/New_York local time.
// IMPORTANT: do not swap this back to `.toISOString()` — that returns the UTC calendar
// date, which flips to the next day at 8pm ET (since ET is UTC-4/5). That mismatch was
// silently resetting the Leo/Today tab hours before actual midnight in Baltimore.
function dateStrET(d = new Date()) { return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); }
const todayStr = () => dateStrET();

export function AdminProvider({ children }) {
  /* ─── Clean stray test values on init ─── */
  useEffect(() => {
    const p = load("jiko-prices", {});
    if (p.SECURITY_PROBE_TEST !== undefined) {
      delete p.SECURITY_PROBE_TEST;
      save("jiko-prices", p);
    }
  }, []);

  const [prices,setPrices]=useState(()=>{
    const p=load("jiko-prices",{}); delete p.SECURITY_PROBE_TEST; return p;
  });
  const [stock,setStock]=useState(()=>load("jiko-stock",{}));
  const [customItems,setCustomItems]=useState(()=>load("jiko-custom-items",[]));
  const [staff,setStaff]=useState(()=>load("jiko-staff",[]));
  const [warnings,setWarnings]=useState(()=>load("jiko-warnings",[]));
  // stockQty, goals, and includeStaffCosts are Supabase-backed only — no localStorage.
  // Multiple people monitor/input from different devices, so these must never silently
  // diverge per device. Values arrive via the init() fetch and the settings_rt/stockqty_rt
  // realtime subscriptions below. Until that first fetch resolves, these show 0/defaults —
  // `synced` tells the UI whether the real values have loaded yet.
  const [stockQty,setStockQtyState]=useState({});
  const [orders,setOrders]=useState([]);
  const [todaySales,setTodaySales]=useState([]);
  const [itemCosts,setItemCosts]=useState({});
  const [synced,setSynced]=useState(false);
  const [lastSyncedAt,setLastSyncedAt]=useState(null);
  const [allSales,setAllSales]=useState([]);
  const [allCosts,setAllCosts]=useState([]);
  const [loading,setLoading]=useState(false);
  const [goals,setGoalsState]=useState({daily:0,weekly:0,monthly:0,compassTarget:2});
  const [includeStaffCosts,setIncludeStaffCosts]=useState(true);
  async function toggleIncludeStaffCosts(){
    const next = !includeStaffCosts;
    setIncludeStaffCosts(next);
    if(supabase){
      try { await supabase.from("business_settings").update({include_staff_costs:next, updated_at:new Date().toISOString()}).eq("id","main"); }
      catch(e){ console.warn("Toggle staff-costs setting failed:", e); }
    }
  }
  // Revenue Trend "full 7-day week" vs "operating days only" view — synced like everything
  // else so every device shows the same true-to-life trend, not a per-device preference.
  const [showFullWeek,setShowFullWeek]=useState(true);
  const [closedWeekday,setClosedWeekday]=useState(0); // 0=Sunday (JS getDay convention)
  async function toggleShowFullWeek(){
    const next = !showFullWeek;
    setShowFullWeek(next);
    if(supabase){
      try { await supabase.from("business_settings").update({show_full_week:next, updated_at:new Date().toISOString()}).eq("id","main"); }
      catch(e){ console.warn("Toggle full-week setting failed:", e); }
    }
  }

  useEffect(() => {
    if (!supabase) return;
    const today = todayStr();
    async function init() {
      try {
        const [{data:pr},{data:sr},{data:sales},{data:costs},{data:ic},{data:ords},{data:cust},{data:stf},{data:warn},{data:bs},{data:sq}] = await Promise.all([
          supabase.from("price_overrides").select("item_id,price"),
          supabase.from("stock_status").select("item_id,out_of_stock"),
          supabase.from("sales").select("*").eq("sale_date",today).order("created_at",{ascending:false}),
          supabase.from("daily_costs").select("*").order("cost_date",{ascending:false}).limit(300),
          supabase.from("item_costs").select("*"),
          supabase.from("customer_orders").select("*").order("created_at",{ascending:false}).limit(100),
          supabase.from("custom_menu_items").select("*").eq("active",true).order("sort_order",{ascending:true}),
          supabase.from("staff_members").select("*").order("name",{ascending:true}),
          supabase.from("staff_warnings").select("*").order("warning_date",{ascending:false}),
          supabase.from("business_settings").select("*").eq("id","main").maybeSingle(),
          supabase.from("stock_quantities").select("item_id,qty"),
        ]);
        if(pr?.length){const p={};pr.forEach(r=>{p[r.item_id]=r.price;});setPrices(p);save("jiko-prices",p);}
        if(sr?.length){const s={};sr.forEach(r=>{s[r.item_id]=r.out_of_stock;});setStock(s);save("jiko-stock",s);}
        if(sales) setTodaySales(sales);
        if(costs) setAllCosts(costs);
        if(ic?.length){const c={};ic.forEach(r=>{c[r.item_id]=r.cost_per_unit;});setItemCosts(c);}
        if(ords) setOrders(ords);
        if(cust && cust.length > 0) {
          const formatted = cust.map(c => ({id:c.id, sw:c.sw, en:c.en, pr:c.pr, ph:c.ph, em:c.em, sectionName:c.section_name}));
          setCustomItems(formatted);
          save("jiko-custom-items", formatted);
        }
        if(stf && stf.length > 0) {
          setStaff(stf);
          save("jiko-staff", stf);
        }
        if(warn && warn.length > 0) {
          setWarnings(warn);
          save("jiko-warnings", warn);
        }
        if(bs){
          setGoalsState({daily:bs.daily_goal||0,weekly:bs.weekly_goal||0,monthly:bs.monthly_goal||0,compassTarget:bs.compass_target||2});
          setIncludeStaffCosts(bs.include_staff_costs!==false);
          setShowFullWeek(bs.show_full_week!==false);
          setClosedWeekday(bs.closed_weekday??0);
        } else {
          // First run after migration: no row yet — create the shared default row so every device starts from the same state.
          try { await supabase.from("business_settings").upsert({id:"main"}); } catch(e){ console.warn("business_settings init failed:", e); }
        }
        if(sq?.length){const q={};sq.forEach(r=>{q[r.item_id]=r.qty;});setStockQtyState(q);}
      } catch(e) {
        // A transient network failure here must not leave the app stuck showing "not synced"
        // forever — better to surface stale/default values and let realtime + retries catch up
        // than to silently freeze the whole dashboard.
        console.warn("Initial data load failed:", e);
      } finally {
        setSynced(true);
        setLastSyncedAt(new Date());
      }
    }
    init();
    const xs=supabase.channel("sales_rt").on("postgres_changes",{event:"INSERT",schema:"public",table:"sales"},p=>{
      if(p.new.sale_date===todayStr()) setTodaySales(prev=>[p.new,...prev]);
      setAllSales(prev=>[p.new,...prev]);
      setLastSyncedAt(new Date());
    }).subscribe();
    const cs=supabase.channel("costs_rt").on("postgres_changes",{event:"*",schema:"public",table:"daily_costs"},async()=>{
      const {data}=await supabase.from("daily_costs").select("*").order("cost_date",{ascending:false}).limit(300);
      if(data) setAllCosts(data);
      setLastSyncedAt(new Date());
    }).subscribe();
    const os=supabase.channel("orders_rt").on("postgres_changes",{event:"*",schema:"public",table:"customer_orders"},async()=>{
      const {data}=await supabase.from("customer_orders").select("*").order("created_at",{ascending:false}).limit(100);
      if(data) setOrders(data);
      setLastSyncedAt(new Date());
    }).subscribe();
    const bss=supabase.channel("settings_rt").on("postgres_changes",{event:"*",schema:"public",table:"business_settings"},p=>{
      const d=p.new; if(!d) return;
      setGoalsState({daily:d.daily_goal||0,weekly:d.weekly_goal||0,monthly:d.monthly_goal||0,compassTarget:d.compass_target||2});
      setIncludeStaffCosts(d.include_staff_costs!==false);
      setShowFullWeek(d.show_full_week!==false);
      setClosedWeekday(d.closed_weekday??0);
      setLastSyncedAt(new Date());
    }).subscribe();
    const sqs=supabase.channel("stockqty_rt").on("postgres_changes",{event:"*",schema:"public",table:"stock_quantities"},async()=>{
      const {data}=await supabase.from("stock_quantities").select("item_id,qty");
      if(data){const q={};data.forEach(r=>{q[r.item_id]=r.qty;});setStockQtyState(q);}
      setLastSyncedAt(new Date());
    }).subscribe();
    return()=>{supabase.removeChannel(xs);supabase.removeChannel(cs);supabase.removeChannel(os);supabase.removeChannel(bss);supabase.removeChannel(sqs);};
  },[]);

  /* ─── COMPUTED ─── */
  const todayGross = useMemo(()=>todaySales.reduce((s,r)=>s+r.total_price,0),[todaySales]);
  const todayCosts = useMemo(()=>allCosts.filter(c=>c.cost_date===todayStr()),[allCosts]);
  const todayOverhead = useMemo(()=>todayCosts.reduce((s,c)=>s+c.amount,0),[todayCosts]);
  const todayItemCost = useMemo(()=>todaySales.reduce((s,r)=>s+(itemCosts[r.item_id]||0)*r.quantity,0),[todaySales,itemCosts]);
  const todayNet = useMemo(()=>{
    if(!Object.keys(itemCosts).length&&todayOverhead===0) return null;
    return todayGross-todayItemCost-todayOverhead;
  },[todayGross,todayItemCost,todayOverhead,itemCosts]);

  const fetchRange = useCallback(async(start,end)=>{
    if(!supabase) return {sales:[], costs:[]};
    setLoading(true);
    const [{data:sales},{data:costs}]=await Promise.all([
      supabase.from("sales").select("*").gte("sale_date",start).lte("sale_date",end).order("sale_date",{ascending:false}),
      supabase.from("daily_costs").select("*").gte("cost_date",start).lte("cost_date",end).order("cost_date",{ascending:false}),
    ]);
    // Merge (don't overwrite) — a fetch for one date range must never erase data a
    // different tab already loaded for a different range. This previously caused
    // reports for specific past dates to sometimes come back empty, depending on
    // which tab's fetch happened to run last.
    if(sales) setAllSales(prev=>{
      const filtered=prev.filter(s=>s.sale_date<start||s.sale_date>end);
      return [...filtered,...sales];
    });
    if(costs) setAllCosts(prev=>{
      const filtered=prev.filter(c=>c.cost_date<start||c.cost_date>end);
      return [...filtered,...costs];
    });
    setLoading(false);
    // Return the fresh data directly — callers that need it immediately (right after
    // awaiting this) must use this return value, not re-read allSales/allCosts from
    // their own closure. React state updates aren't visible synchronously after
    // setAllSales/setAllCosts, so reading the outer allSales here would still show
    // the OLD value until the next render.
    return {sales: sales||[], costs: costs||[]};
  },[]);

  async function setStockQty(itemId,qty){
    const q=parseInt(qty)||0;
    setStockQtyState(prev=>({...prev,[itemId]:q}));
    if(supabase){
      try { await supabase.from("stock_quantities").upsert({item_id:itemId,qty:q,updated_at:new Date().toISOString()},{onConflict:"item_id"}); }
      catch(e){ console.warn("Stock qty save failed:", e); }
    }
  }
  const GOAL_COL={daily:"daily_goal",weekly:"weekly_goal",monthly:"monthly_goal"};
  async function setGoal(type,amount){
    const next={...goals,[type]:parseInt(amount)||0};
    setGoalsState(next);
    if(supabase){
      try { await supabase.from("business_settings").update({[GOAL_COL[type]]:next[type], updated_at:new Date().toISOString()}).eq("id","main"); }
      catch(e){ console.warn("Goal save failed:", e); }
    }
  }
  async function setCompassTarget(ratio){
    const next={...goals,compassTarget:parseFloat(ratio)||0};
    setGoalsState(next);
    if(supabase){
      try { await supabase.from("business_settings").update({compass_target:next.compassTarget, updated_at:new Date().toISOString()}).eq("id","main"); }
      catch(e){ console.warn("Compass target save failed:", e); }
    }
  }

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
  async function recordCost(category,description,amount,date,spendingType="daily"){
    const costDate=date||todayStr();
    const rec={cost_date:costDate,category,description:description||category,amount:parseInt(amount)||0,spending_type:spendingType};
    const newRec={...rec,id:Date.now(),created_at:new Date().toISOString()};
    setAllCosts(prev=>[newRec,...prev]);
    if(supabase) await supabase.from("daily_costs").insert(rec);
  }
  async function deleteCost(id){setAllCosts(prev=>prev.filter(c=>c.id!==id));if(supabase) await supabase.from("daily_costs").delete().eq("id",id);}
  async function deleteSale(id){setTodaySales(prev=>prev.filter(s=>s.id!==id));setAllSales(prev=>prev.filter(s=>s.id!==id));if(supabase) await supabase.from("sales").delete().eq("id",id);}
  async function updateSale(id,updates){setTodaySales(prev=>prev.map(s=>s.id===id?{...s,...updates}:s));setAllSales(prev=>prev.map(s=>s.id===id?{...s,...updates}:s));if(supabase) await supabase.from("sales").update(updates).eq("id",id);}
  async function updateCost(id,updates){setAllCosts(prev=>prev.map(c=>c.id===id?{...c,...updates}:c));if(supabase) await supabase.from("daily_costs").update(updates).eq("id",id);}
  async function overridePrice(id,price){const next={...prices,[id]:price};setPrices(next);save("jiko-prices",next);if(supabase) await supabase.from("price_overrides").upsert({item_id:id,price,updated_at:new Date().toISOString()},{onConflict:"item_id"});}
  async function toggleStock(id){const v=!stock[id],next={...stock,[id]:v};setStock(next);save("jiko-stock",next);if(supabase) await supabase.from("stock_status").upsert({item_id:id,out_of_stock:v,updated_at:new Date().toISOString()},{onConflict:"item_id"});}
  async function setCost(itemId,cost){const next={...itemCosts,[itemId]:cost};setItemCosts(next);if(supabase) await supabase.from("item_costs").upsert({item_id:itemId,cost_per_unit:cost,updated_at:new Date().toISOString()},{onConflict:"item_id"});}

  /* ─── STAFF / WAFANYAKAZI ─── */
  async function addStaff(member){
    const localId = "tmp_" + Date.now();
    const optimistic = {...member, id:localId, active:true};
    setStaff(prev => {
      const next = [...prev, optimistic];
      save("jiko-staff", next);
      return next;
    });
    if(supabase){
      try {
        const {data} = await supabase.from("staff_members").insert({
          name: member.name,
          role: member.role || "",
          type: member.type || "long_term",
          monthly_salary: parseInt(member.monthly_salary) || 0,
          phone: member.phone || "",
          notes: member.notes || "",
          active: true
        }).select().single();
        if(data) setStaff(prev => {
          const next = prev.map(s => s.id === localId ? data : s);
          save("jiko-staff", next);
          return next;
        });
      } catch(e){ console.warn("Staff add failed:", e); }
    }
  }
  async function updateStaff(id, updates){
    setStaff(prev => {
      const next = prev.map(s => s.id === id ? {...s, ...updates} : s);
      save("jiko-staff", next);
      return next;
    });
    if(supabase){
      try { await supabase.from("staff_members").update({...updates, updated_at: new Date().toISOString()}).eq("id", id); }
      catch(e){ console.warn("Staff update failed:", e); }
    }
  }
  async function deleteStaff(id){
    // Soft-delete: mark inactive but KEEP in list so employment history (incl. warnings) is preserved
    setStaff(prev => {
      const next = prev.map(s => s.id === id ? {...s, active:false} : s);
      save("jiko-staff", next);
      return next;
    });
    if(supabase){
      try { await supabase.from("staff_members").update({active:false, updated_at: new Date().toISOString()}).eq("id", id); }
      catch(e){ console.warn("Staff delete failed:", e); }
    }
  }
  async function reactivateStaff(id){
    setStaff(prev => {
      const next = prev.map(s => s.id === id ? {...s, active:true} : s);
      save("jiko-staff", next);
      return next;
    });
    if(supabase){
      try { await supabase.from("staff_members").update({active:true, updated_at: new Date().toISOString()}).eq("id", id); }
      catch(e){ console.warn("Staff reactivate failed:", e); }
    }
  }
  async function payStaff(staffMember, amount, date, period){
    const desc = staffMember.name + (period ? " — " + period : "");
    await recordCost("staff", desc, amount, date, "daily");
  }

  /* ─── STAFF WARNINGS / MAONYO — verbal or written policy violation records ─── */
  async function addWarning(staffId, staffName, type, reason, date){
    const localId = "tmp_"+Date.now();
    const rec = {id:localId, staff_id:staffId, staff_name:staffName, type:type||"verbal", reason:reason||"", warning_date:date||today()};
    setWarnings(prev => {
      const next = [rec, ...prev];
      save("jiko-warnings", next);
      return next;
    });
    if(supabase){
      try {
        const {data} = await supabase.from("staff_warnings").insert({
          staff_id: staffId, staff_name: staffName, type: type||"verbal", reason: reason||"", warning_date: date||today()
        }).select().single();
        if(data) setWarnings(prev => {
          const next = prev.map(w => w.id===localId ? data : w);
          save("jiko-warnings", next);
          return next;
        });
      } catch(e){ console.warn("Add warning failed:", e); }
    }
  }
  async function deleteWarning(id){
    setWarnings(prev => {
      const next = prev.filter(w=>w.id!==id);
      save("jiko-warnings", next);
      return next;
    });
    if(supabase){
      try { await supabase.from("staff_warnings").delete().eq("id", id); }
      catch(e){ console.warn("Delete warning failed:", e); }
    }
  }

  /* ─── CUSTOM MENU ITEMS (added from Msimamizi) ─── */
  async function addCustomItem(item){
    const id = "custom_" + Date.now();
    const rec = {id, sw:item.sw, en:item.en||"", pr:item.pr, ph:item.ph||null, em:item.em||"🍽️", section_name:item.sectionName||"Bidhaa Mpya / Specials", active:true};
    const next=[...customItems,{...item,id,sectionName:rec.section_name}];
    setCustomItems(next);
    save("jiko-custom-items",next);
    if(supabase){
      try { await supabase.from("custom_menu_items").insert(rec); } catch(e){ console.warn("Custom item cloud save failed:", e); }
    }
  }
  async function deleteCustomItem(id){
    const next=customItems.filter(c=>c.id!==id);
    setCustomItems(next);
    save("jiko-custom-items",next);
    if(supabase){
      try { await supabase.from("custom_menu_items").delete().eq("id",id); } catch(e){ console.warn("Custom item cloud delete failed:", e); }
    }
  }
  async function updateCustomItem(id,updates){
    const next=customItems.map(c=>c.id===id?{...c,...updates}:c);
    setCustomItems(next);
    save("jiko-custom-items",next);
    if(supabase){
      const sbUpdate = {};
      if(updates.sw)sbUpdate.sw=updates.sw;
      if(updates.en)sbUpdate.en=updates.en;
      if(updates.pr)sbUpdate.pr=updates.pr;
      if(updates.ph!==undefined)sbUpdate.ph=updates.ph;
      if(updates.em)sbUpdate.em=updates.em;
      if(updates.sectionName)sbUpdate.section_name=updates.sectionName;
      sbUpdate.updated_at = new Date().toISOString();
      try { await supabase.from("custom_menu_items").update(sbUpdate).eq("id",id); } catch(e){ console.warn("Custom item cloud update failed:", e); }
    }
  }

  /* ─── CUSTOMER ORDERS ─── */
  async function addOrder(o){
    const rec={customer_name:o.customer||"Customer",customer_phone:o.phone||"",items:o.items||"",total:parseInt(o.total)||0,service:o.service||"pickup",notes:o.notes||"",status:o.status||"pending",source:o.source||"manual"};
    if(supabase){const{data}=await supabase.from("customer_orders").insert(rec).select().single();if(data)setOrders(prev=>[data,...prev]);}
    else setOrders(prev=>[{...rec,id:Date.now(),created_at:new Date().toISOString()},...prev]);
  }
  async function updateOrderStatus(id,status){
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    if(supabase) await supabase.from("customer_orders").update({status,updated_at:new Date().toISOString()}).eq("id",id);
  }
  async function deleteOrder(id){setOrders(prev=>prev.filter(o=>o.id!==id));if(supabase) await supabase.from("customer_orders").delete().eq("id",id);}

  /* ─── BACKUP / RESTORE ─── */
  async function exportAll(){
    const data={
      version:1, exported_at:new Date().toISOString(),
      prices,stock,itemCosts,goals,orders,stockQty,
      sales:allSales,todaySales,costs:allCosts,
    };
    return JSON.stringify(data,null,2);
  }
  async function importAll(json){
    try{
      const d=JSON.parse(json);
      if(d.prices){setPrices(d.prices);save("jiko-prices",d.prices);}
      if(d.stock){setStock(d.stock);save("jiko-stock",d.stock);}
      if(d.itemCosts) setItemCosts(d.itemCosts);
      if(d.goals){
        setGoalsState(d.goals);
        if(supabase){
          try {
            await supabase.from("business_settings").update({
              daily_goal:d.goals.daily||0, weekly_goal:d.goals.weekly||0, monthly_goal:d.goals.monthly||0,
              compass_target:d.goals.compassTarget||2, updated_at:new Date().toISOString()
            }).eq("id","main");
          } catch(e){ console.warn("Goals restore failed:", e); }
        }
      }
      if(d.stockQty){
        setStockQtyState(d.stockQty);
        if(supabase){
          try {
            const rows=Object.entries(d.stockQty).map(([item_id,qty])=>({item_id,qty:parseInt(qty)||0,updated_at:new Date().toISOString()}));
            if(rows.length) await supabase.from("stock_quantities").upsert(rows,{onConflict:"item_id"});
          } catch(e){ console.warn("Stock qty restore failed:", e); }
        }
      }
      if(d.orders) setOrders(d.orders);
      return {ok:true,msg:"Imported successfully"};
    }catch(e){return {ok:false,msg:e.message};}
  }

  return (
    <Ctx.Provider value={{
      prices,stock,orders,todaySales,allSales,allCosts,todayCosts,itemCosts,synced,lastSyncedAt,loading,goals,
      todayGross,todayNet,todayOverhead,todayItemCost,
      setGoal,setCompassTarget,recordSale,recordCost,deleteCost,deleteSale,updateSale,updateCost,
      includeStaffCosts,toggleIncludeStaffCosts,
      showFullWeek,toggleShowFullWeek,closedWeekday,
      overridePrice,toggleStock,setCost,addOrder,updateOrderStatus,deleteOrder,
      customItems,addCustomItem,deleteCustomItem,updateCustomItem,
      staff,addStaff,updateStaff,deleteStaff,payStaff,reactivateStaff,
      warnings,addWarning,deleteWarning,
      stockQty,setStockQty,
      fetchRange,exportAll,importAll,
      isOutOfStock:(id)=>!!stock[id],
    }}>
      {children}
    </Ctx.Provider>
  );
}
export function useAdmin(){const c=useContext(Ctx);if(!c)throw new Error("useAdmin outside AdminProvider");return c;}
