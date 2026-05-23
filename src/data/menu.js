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
  { id:"ndizi-mzuzu",     section:"specials", emoji:"🥘",
    name:{ sw:"Ndizi Mzuzu ya Kukaanga", en:"Fried Sweet Plantain" },       price:1000 },

  /* ── VINYWAJI ── */
  { id:"maji-1l",   section:"vinywaji", emoji:"🍾",
    name:{ sw:"Maji Baridi (Lita 1)",    en:"Cold Water (1 Litre)" },    price:1200 },
  { id:"maji-nusu", section:"vinywaji", emoji:"🧴",
    name:{ sw:"Maji Baridi (Nusu Lita)", en:"Cold Water (Half Litre)" }, price:700  },
  { id:"soda",      section:"vinywaji", emoji:"🥤",
    name:{ sw:"Soda",                    en:"Soda" },                    price:1000 },
  { id:"juice",     section:"vinywaji", emoji:"🧃",
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
