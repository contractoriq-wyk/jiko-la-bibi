# 📋 JINSI YA KUBADILISHA MENYU / HOW TO EDIT THE MENU
## No coding needed — edits live on the website in ~1 minute.

---

## KUBADILISHA BEI (Change a price)

1. Nenda kwenye GitHub repo yako / Go to your GitHub repo
2. Bonyeza faili hii / Open the file: `src/data/menu.js`
3. Bonyeza ✏️ (Edit / Pencil icon) juu kulia
4. Tafuta jina la sahani unayotaka kubadilisha (Ctrl+F / Cmd+F)
5. Badilisha nambari ya bei tu — e.g. `price: 1000` → `price: 1200`
6. Shuka chini → bonyeza **"Commit changes"** → **"Commit changes"** tena
7. Vercel inajenga upya kiotomatiki. Baada ya dakika ~1, bei mpya iko live! ✅

---

## KUBADILISHA HABARI ZA BIASHARA (Change business info)

Nambari ya simu, Lipa Namba, saa za kazi, mahali — ziko hapa:
`src/data/businessConfig.js`

Fanya mabadiliko kwa njia ile ile (Edit → Commit).

---

## KUONGEZA SAHANI MPYA (Add a new dish)

Fungua `src/data/menu.js`. Ongeza mstari mpya kwenye sehemu sahihi.

**Sahani rahisi (bei moja):**
```js
{ id: "sahani-mpya", section: "vitafunwa",
  name: { sw: "Jina la Sahani", en: "Dish Name" }, price: 1500 },
```

**Sahani yenye ukubwa (S/M/L):**
```js
{ id: "sahani-mpya", section: "mchele",
  name: { sw: "Wali Mpya", en: "New Rice Dish" },
  sizes: [
    { label: { sw: "Ndogo", en: "Small" }, price: 3000 },
    { label: { sw: "Wastani", en: "Medium" }, price: 5000 },
    { label: { sw: "Kubwa", en: "Large" }, price: 7500 },
  ] },
```

Make sure `section:` matches one of:
`vitafunwa` | `mchele` | `standard` | `pilau` | `specials` | `vinywaji` | `jioni`

---

## KUFICHA SAHANI (Hide a dish temporarily)

Add `hidden: true` to any item:
```js
{ id: "chips-zege", section: "specials", ..., hidden: true },
```
Then in `src/App.jsx`, filter: `.filter((m) => !m.hidden)` — or message Baba Wemma.

---

## NEED HELP?

WhatsApp Baba Wemma (the site manager) if anything looks wrong.
