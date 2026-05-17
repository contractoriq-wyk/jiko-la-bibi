// ============================================================
//  THE MENU  —  Unyamwezini Jiko La Bibi JJJ
// ============================================================
//  >>> THIS IS THE FILE YOU EDIT TO CHANGE PRICES OR DISHES <<<
//
//  HOW IT WORKS — three kinds of items:
//
//  1) SIMPLE ITEM (one fixed price):
//        { id, section, name, price }
//
//  2) SIZED ITEM (customer picks a size, price comes from the size):
//        { id, section, name, sizes: [ {label, price}, ... ] }
//
//  3) CHOICE ITEM (customer picks an option that does NOT change price,
//     e.g. which protein):
//        { id, section, name, price, choices: [ ... ] }
//
//  An item can have BOTH `sizes` and `choices` (e.g. Pilau).
//
//  TO CHANGE A PRICE: find the dish, change the number. Save. Done.
//  Prices are in Tanzanian Shillings (TZS). No commas, no symbols.
// ============================================================

// The 7 menu sections, in display order.
export const sections = [
  { id: "vitafunwa", name: { sw: "Vitafunwa & Vinywaji vya Moto", en: "Hot Drinks & Snacks" } },
  { id: "mchele",    name: { sw: "Vyakula vya Mchana na Jioni",    en: "Lunch & Dinner" } },
  { id: "standard",  name: { sw: "Sahani za Kawaida",             en: "Standard Plates" } },
  { id: "pilau",     name: { sw: "Pilau",                          en: "Pilau" } },
  { id: "specials",  name: { sw: "Spesheli",                       en: "Specials" } },
  { id: "vinywaji",  name: { sw: "Vinywaji Baridi",                en: "Cold Drinks" } },
  { id: "jioni",     name: { sw: "Supu na Vitafunwa vya Jioni",    en: "Evening Soups & Snacks" } },
];

export const menu = [
  // ---------- 1. VITAFUNWA — Hot Drinks & Snacks ----------
  { id: "chai-maziwa", section: "vitafunwa",
    name: { sw: "Chai ya Maziwa (kikombe)", en: "Milk Tea (cup)" }, price: 1000 },
  { id: "chai-rangi", section: "vitafunwa",
    name: { sw: "Chai ya Rangi (kikombe)", en: "Black Tea (cup)" }, price: 500 },
  { id: "chapati-vitafunwa", section: "vitafunwa",
    name: { sw: "Chapati Raini yenye Maziwa na Siagi", en: "Plain Chapati with Milk & Butter" }, price: 1000 },
  { id: "maandazi", section: "vitafunwa",
    name: { sw: "Maandazi (1)", en: "Maandazi (1 pc)" }, price: 500 },
  { id: "vitumbua", section: "vitafunwa",
    name: { sw: "Vitumbua (1)", en: "Rice Cake (1 pc)" }, price: 500 },
  { id: "viazi", section: "vitafunwa",
    name: { sw: "Viazi Vitamu vya Kuchemsha (1)", en: "Boiled Sweet Potato (1)" }, price: 500 },
  { id: "mhogo", section: "vitafunwa",
    name: { sw: "Mhogo wa Kuchemsha (1)", en: "Boiled Cassava (1)" }, price: 500 },

  // ---------- 2. VYAKULA VYA MCHELE — Lunch & Dinner (sized) ----------
  { id: "wali-combo", section: "mchele",
    name: { sw: "Wali, Nyama, Maharage na Mboga za Majani", en: "Rice, Meat, Beans & Greens" },
    sizes: [
      { label: { sw: "Ndogo", en: "Small" }, price: 3000 },
      { label: { sw: "Wastani", en: "Medium" }, price: 5000 },
      { label: { sw: "Kubwa", en: "Large" }, price: 7500 },
    ] },
  { id: "ugali-combo", section: "mchele",
    name: { sw: "Ugali, Nyama, Maharage na Mboga za Majani", en: "Ugali, Meat, Beans & Greens" },
    sizes: [
      { label: { sw: "Ndogo", en: "Small" }, price: 3000 },
      { label: { sw: "Wastani", en: "Medium" }, price: 5000 },
      { label: { sw: "Kubwa", en: "Large" }, price: 7500 },
    ] },

  // ---------- 3. STANDARD PLATES — flat price, choose protein ----------
  { id: "plate-wali", section: "standard",
    name: { sw: "Wali + Protini + Mboga za Majani", en: "Rice + Protein + Greens" },
    price: 7500,
    choices: [
      { sw: "Kuku", en: "Chicken" },
      { sw: "Samaki", en: "Fish" },
      { sw: "Maini", en: "Liver" },
      { sw: "Maharage", en: "Beans" },
    ] },
  { id: "plate-ugali", section: "standard",
    name: { sw: "Ugali + Protini + Mboga za Majani", en: "Ugali + Protein + Greens" },
    price: 7500,
    choices: [
      { sw: "Kuku", en: "Chicken" },
      { sw: "Samaki", en: "Fish" },
      { sw: "Maini", en: "Liver" },
      { sw: "Maharage", en: "Beans" },
    ] },

  // ---------- 4. PILAU — choose protein + size ----------
  { id: "pilau-nyama", section: "pilau",
    name: { sw: "Pilau ya Nyama", en: "Pilau with Meat" },
    sizes: [
      { label: { sw: "Wastani", en: "Medium" }, price: 5000 },
      { label: { sw: "Kubwa", en: "Large" }, price: 7500 },
    ] },
  { id: "pilau-choice", section: "pilau",
    name: { sw: "Pilau ya Kuku / Samaki / Maini", en: "Pilau with Chicken / Fish / Liver" },
    choices: [
      { sw: "Kuku", en: "Chicken" },
      { sw: "Samaki", en: "Fish" },
      { sw: "Maini", en: "Liver" },
    ],
    sizes: [
      { label: { sw: "Wastani", en: "Medium" }, price: 5000 },
      { label: { sw: "Kubwa", en: "Large" }, price: 7500 },
    ] },

  // ---------- 5. SPECIALS ----------
  { id: "chips-zege", section: "specials",
    name: { sw: "Chips Zege", en: "Chips with Egg" }, price: 5000 },
  { id: "chips-robo-kuku", section: "specials",
    name: { sw: "Chips Robo Kuku", en: "Chips with Quarter Chicken" }, price: 6000 },
  { id: "ndizi-mzuzu", section: "specials",
    name: { sw: "Ndizi Mzuzu ya Kukaanga", en: "Fried Sweet Plantain" }, price: 1000 },

  // ---------- 6. VINYWAJI — Cold Drinks ----------
  { id: "maji-1l", section: "vinywaji",
    name: { sw: "Maji (Lita 1)", en: "Water (1 Litre)" }, price: 1200 },
  { id: "maji-nusu", section: "vinywaji",
    name: { sw: "Maji (Nusu Lita)", en: "Water (Half Litre)" }, price: 700 },
  { id: "soda", section: "vinywaji",
    name: { sw: "Soda", en: "Soda" }, price: 1000 },
  { id: "juice", section: "vinywaji",
    name: { sw: "Juice Freshi", en: "Fresh Juice" },
    sizes: [
      { label: { sw: "Ndogo", en: "Small" }, price: 1000 },
      { label: { sw: "Wastani", en: "Medium" }, price: 1500 },
      { label: { sw: "Kubwa", en: "Large" }, price: 2500 },
    ] },

  // ---------- 7. JIONI — Evening Soups & Snacks ----------
  { id: "supu-kongoro", section: "jioni",
    name: { sw: "Supu ya Kongoro", en: "Cow Trotter Soup" }, price: 3000 },
  { id: "chapati-jioni", section: "jioni",
    name: { sw: "Chapati Raini yenye Maziwa na Siagi (1)", en: "Plain Chapati with Milk & Butter (1)" }, price: 1000 },
  { id: "ndizi-kuchemsha", section: "jioni",
    name: { sw: "Ndizi ya Kuchemsha (1)", en: "Boiled Plantain (1)" }, price: 500 },
];

// Helper: lowest price of an item (used for "from TZS ..." labels)
export function itemFromPrice(item) {
  if (item.sizes) return Math.min(...item.sizes.map((s) => s.price));
  return item.price;
}
