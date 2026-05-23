export const sections = [
  { id:"vitafunwa", icon:"ti-coffee",  color:"#C15A00", name:{ sw:"Vitafunwa & Vinywaji vya Moto", en:"Hot Drinks & Snacks" } },
  { id:"mchele",   icon:"ti-flame",   color:"#1B6B20", name:{ sw:"Vyakula vya Mchana na Jioni",   en:"Lunch & Dinner" } },
  { id:"standard", icon:"ti-chef-hat",color:"#1565C0", name:{ sw:"Sahani za Kawaida",             en:"Standard Plates" } },
  { id:"pilau",    icon:"ti-flame",   color:"#C62828", name:{ sw:"Pilau",                          en:"Pilau" } },
  { id:"specials", icon:"ti-star",    color:"#E65100", name:{ sw:"Spesheli",                       en:"Specials" } },
  { id:"vinywaji", icon:"ti-glass",   color:"#00695C", name:{ sw:"Vinywaji Baridi",                en:"Cold Drinks" } },
  { id:"jioni",    icon:"ti-moon",    color:"#4A235A", name:{ sw:"Supu na Vitafunwa vya Jioni",    en:"Evening Soups & Snacks" } },
];

export const menu = [
  /* ── VITAFUNWA ── */
  { id:"chai-maziwa",   section:"vitafunwa", emoji:"☕", photo:"/food/chai.jpg",
    name:{ sw:"Chai ya Maziwa (kikombe)", en:"Milk Tea (cup)" }, price:1000 },
  { id:"chai-rangi",    section:"vitafunwa", emoji:"🫖", photo:"/food/chai-rangi.jpg",
    name:{ sw:"Chai ya Rangi (kikombe)",  en:"Black Tea (cup)" }, price:500 },
  { id:"chapati-vit",   section:"vitafunwa", emoji:"🫓", photo:"/food/chapati.jpg",
    name:{ sw:"Chapati Raini + Maziwa na Siagi", en:"Plain Chapati with Milk & Butter" }, price:1000 },
  { id:"maandazi",      section:"vitafunwa", emoji:"🍩", photo:"/food/maandazi.jpg",
    name:{ sw:"Maandazi (1)",  en:"Maandazi — 1 piece" }, price:500 },
  { id:"vitumbua",      section:"vitafunwa", emoji:"🍡", photo:"/food/vitumbua.jpg",
    name:{ sw:"Vitumbua (1)", en:"Rice Cake — 1 piece" }, price:500 },
  { id:"viazi",         section:"vitafunwa", emoji:"🍠", photo:"/food/viazi-vitamu.jpg",
    name:{ sw:"Viazi Vitamu vya Kuchemsha (1)", en:"Boiled Sweet Potato" }, price:500 },
  { id:"mhogo",         section:"vitafunwa", emoji:"🌿", photo:"/food/mihogo.jpg",
    name:{ sw:"Mhogo wa Kuchemsha (1)", en:"Boiled Cassava" }, price:500 },

  /* ── MCHELE ── */
  { id:"wali-combo",  section:"mchele", emoji:"🍛", photo:"/food/wali.jpg",
    name:{ sw:"Wali, Nyama, Maharage na Mboga za Majani", en:"Rice, Meat, Beans & Greens" },
    sizes:[ { label:{ sw:"Ndogo", en:"Small" }, price:3000 }, { label:{ sw:"Wastani", en:"Medium" }, price:5000 }, { label:{ sw:"Kubwa", en:"Large" }, price:7500 } ] },
  { id:"ugali-combo", section:"mchele", emoji:"🍚", photo:"/food/wali.jpg",
    name:{ sw:"Ugali, Nyama, Maharage na Mboga za Majani", en:"Ugali, Meat, Beans & Greens" },
    sizes:[ { label:{ sw:"Ndogo", en:"Small" }, price:3000 }, { label:{ sw:"Wastani", en:"Medium" }, price:5000 }, { label:{ sw:"Kubwa", en:"Large" }, price:7500 } ] },

  /* ── STANDARD ── */
  { id:"plate-wali",  section:"standard", emoji:"🍗", photo:"/food/wali.jpg",
    name:{ sw:"Wali + Protini + Mboga za Majani", en:"Rice + Protein + Greens" }, price:7500,
    choices:[ { sw:"Kuku", en:"Chicken" }, { sw:"Samaki", en:"Fish" }, { sw:"Maini", en:"Liver" }, { sw:"Maharage", en:"Beans" } ] },
  { id:"plate-ugali", section:"standard", emoji:"🐟", photo:"/food/wali.jpg",
    name:{ sw:"Ugali + Protini + Mboga za Majani", en:"Ugali + Protein + Greens" }, price:7500,
    choices:[ { sw:"Kuku", en:"Chicken" }, { sw:"Samaki", en:"Fish" }, { sw:"Maini", en:"Liver" }, { sw:"Maharage", en:"Beans" } ] },

  /* ── PILAU ── */
  { id:"pilau-nyama",  section:"pilau", emoji:"🫕", photo:"/food/pilau.jpg",
    name:{ sw:"Pilau ya Nyama", en:"Pilau with Meat" },
    sizes:[ { label:{ sw:"Wastani", en:"Medium" }, price:5000 }, { label:{ sw:"Kubwa", en:"Large" }, price:7500 } ] },
  { id:"pilau-choice", section:"pilau", emoji:"🍗", photo:"/food/pilau.jpg",
    name:{ sw:"Pilau ya Kuku / Samaki / Maini", en:"Pilau with Chicken / Fish / Liver" },
    choices:[ { sw:"Kuku", en:"Chicken" }, { sw:"Samaki", en:"Fish" }, { sw:"Maini", en:"Liver" } ],
    sizes:[ { label:{ sw:"Wastani", en:"Medium" }, price:5000 }, { label:{ sw:"Kubwa", en:"Large" }, price:7500 } ] },

  /* ── SPECIALS ── */
  { id:"chips-zege",      section:"specials", emoji:"🍟", photo:"/food/chips.jpg",
    name:{ sw:"Chips Zege",              en:"Chips with Egg" },             price:5000 },
  { id:"chips-robo-kuku", section:"specials", emoji:"🍗", photo:"/food/chips.jpg",
    name:{ sw:"Chips Robo Kuku",         en:"Chips with Quarter Chicken" }, price:6000 },
  { id:"ndizi-mzuzu",     section:"specials", emoji:"🥘", photo:"/food/ndizi-mzuzu.jpg",
    name:{ sw:"Ndizi Mzuzu ya Kukaanga", en:"Fried Sweet Plantain" },       price:1000 },

  /* ── VINYWAJI ── */
  { id:"maji-1l",   section:"vinywaji", emoji:"🍾", photo:"/food/maji-litre.jpg",
    name:{ sw:"Maji Baridi (Lita 1)",    en:"Cold Water (1 Litre)" },    price:1200 },
  { id:"maji-nusu", section:"vinywaji", emoji:"🧴", photo:"/food/maji-nusu.jpg",
    name:{ sw:"Maji Baridi (Nusu Lita)", en:"Cold Water (Half Litre)" }, price:700  },
  { id:"soda",      section:"vinywaji", emoji:"🥤", photo:"/food/soda.jpg",
    name:{ sw:"Soda",                    en:"Soda" },                    price:1000 },
  { id:"juice",     section:"vinywaji", emoji:"🧃", photo:"/food/juice-freshi.jpg",
    name:{ sw:"Juice Freshi", en:"Fresh Juice" },
    sizes:[ { label:{ sw:"Ndogo", en:"Small" }, price:1000 }, { label:{ sw:"Wastani", en:"Medium" }, price:1500 }, { label:{ sw:"Kubwa", en:"Large" }, price:2500 } ] },

  /* ── JIONI ── */
  { id:"supu-kongoro",  section:"jioni", emoji:"🍲", photo:"/food/kongoro.jpg",
    name:{ sw:"Supu ya Kongoro",                     en:"Cow Trotter Soup" },                price:3000 },
  { id:"chapati-jioni", section:"jioni", emoji:"🫓", photo:"/food/chapati.jpg",
    name:{ sw:"Chapati Raini + Maziwa na Siagi (1)", en:"Plain Chapati with Milk & Butter" },price:1000 },
  { id:"ndizi-jioni",   section:"jioni", emoji:"🌾",
    name:{ sw:"Ndizi ya Kuchemsha (1)",              en:"Boiled Plantain" },                 price:500  },
];

export function itemFromPrice(item) {
  if (item.sizes) return Math.min(...item.sizes.map(s => s.price));
  return item.price;
}

export function sectionMeta(sectionId) {
  return sections.find(s => s.id === sectionId) || sections[0];
}
