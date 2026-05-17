// ============================================================
//  UTILITIES  —  money formatting + WhatsApp order message
// ============================================================
import { business } from "../data/businessConfig";

// Format a number as Tanzanian Shillings, e.g. 7500 -> "TZS 7,500"
export function formatMoney(amount) {
  return "TZS " + Number(amount).toLocaleString("en-US");
}

// Build the order text that gets sent to the restaurant on WhatsApp.
// `lang` is "sw" or "en". `details` holds the checkout form values.
export function buildWhatsAppMessage(cart, total, details, lang = "sw") {
  const L = lang === "sw";
  const lines = [];

  lines.push(L ? "*ODA MPYA — Jiko La Bibi JJJ*" : "*NEW ORDER — Jiko La Bibi JJJ*");
  lines.push("");

  // Each cart line
  cart.forEach((line, i) => {
    const name = line.name[lang] || line.name.sw;
    let label = `${i + 1}. ${name}`;
    if (line.sizeLabel) label += ` (${line.sizeLabel[lang] || line.sizeLabel.sw})`;
    if (line.choiceLabel) label += ` - ${line.choiceLabel[lang] || line.choiceLabel.sw}`;
    label += ` x${line.qty}`;
    lines.push(label);
    lines.push(`   ${formatMoney(line.unitPrice * line.qty)}`);
  });

  lines.push("");
  lines.push((L ? "*JUMLA:* " : "*TOTAL:* ") + formatMoney(total));
  lines.push("");

  // Customer details
  lines.push(L ? "*Maelezo ya Mteja*" : "*Customer Details*");
  lines.push((L ? "Jina: " : "Name: ") + details.name);
  lines.push((L ? "Simu: " : "Phone: ") + details.phone);

  const serviceNames = {
    pickup: L ? "Kuchukua Mwenyewe" : "Pickup",
    delivery: L ? "Kuletewa" : "Delivery",
    dinein: L ? "Kula Hapa Hapa" : "Dine In",
    events: L ? "Sherehe / Tukio" : "Event / Party",
  };
  lines.push((L ? "Huduma: " : "Service: ") + serviceNames[details.service]);

  if (details.service === "delivery" && details.address)
    lines.push((L ? "Mahali: " : "Address: ") + details.address);
  if (details.service === "dinein" && details.dineTime)
    lines.push((L ? "Muda: " : "Time: ") + details.dineTime);
  if ((details.service === "dinein" || details.service === "events") && details.guests)
    lines.push((L ? "Watu: " : "Guests: ") + details.guests);
  if (details.notes)
    lines.push((L ? "Maelezo: " : "Notes: ") + details.notes);

  lines.push("");
  lines.push(
    L
      ? `_Malipo: Lipa Namba ${business.lipaNamba} (${business.lipaName})_`
      : `_Payment: Lipa Namba ${business.lipaNamba} (${business.lipaName})_`
  );

  return encodeURIComponent(lines.join("\n"));
}

// Full wa.me link for a finished order
export function whatsappOrderLink(cart, total, details, lang) {
  return `https://wa.me/${business.whatsapp}?text=${buildWhatsAppMessage(cart, total, details, lang)}`;
}

// Simple wa.me link for a general enquiry (no order)
export function whatsappEnquiryLink(lang = "sw") {
  const text =
    lang === "sw"
      ? "Habari Jiko La Bibi JJJ, ningependa kuuliza..."
      : "Hello Jiko La Bibi JJJ, I would like to ask...";
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
}
