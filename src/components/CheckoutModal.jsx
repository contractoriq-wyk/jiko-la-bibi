import { useState } from "react";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { business } from "../data/businessConfig";
import { formatMoney, whatsappOrderLink } from "../utils/order";
import { CloseIcon, WhatsAppIcon } from "./Icons";

const SERVICES = [
  { key: "pickup",   icon: "🥡" },
  { key: "delivery", icon: "🛵" },
  { key: "dinein",   icon: "🍽️" },
  { key: "events",   icon: "🎉" },
];

export default function CheckoutModal({ onClose }) {
  const { lang, t } = useLang();
  const { cart, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "", phone: "", service: "pickup",
    address: "", dineTime: "", guests: "", notes: "",
  });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError(t("requiredFields"));
      return;
    }
    const link = whatsappOrderLink(cart, total, form, lang);
    window.open(link, "_blank");
    setSent(true);
    clearCart();
  }

  const activeServices = SERVICES.filter((s) => business.services[s.key]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-cream sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-navy px-5 py-4">
          <h2 className="font-display text-xl font-bold text-cream">
            {sent ? (lang === "sw" ? "Asante! 🎉" : "Thank you! 🎉") : t("checkout")}
          </h2>
          <button onClick={onClose} className="text-cream/70 hover:text-gold">
            <CloseIcon />
          </button>
        </div>

        {/* Sent confirmation */}
        {sent ? (
          <div className="px-5 py-8 text-center">
            <p className="text-5xl">✅</p>
            <p className="mt-4 font-display text-lg font-bold text-navy">
              {lang === "sw"
                ? "Oda yako imetumwa WhatsApp!"
                : "Your order was sent on WhatsApp!"}
            </p>
            <p className="mt-2 text-sm text-navy/70">
              {lang === "sw"
                ? `Scan QR code au ingiza Lipa Namba ${business.lipaNamba} — ${business.lipaName}. Tutakuthibitishia mapema.`
                : `Scan QR code or enter Lipa Namba ${business.lipaNamba} — ${business.lipaName}. We'll confirm shortly.`}
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-gold px-8 py-3 font-bold text-navy hover:bg-gold-light"
            >
              {t("continueOrdering")}
            </button>
          </div>
        ) : (
          <div className="max-h-[72vh] overflow-y-auto">
            {/* Order summary */}
            <div className="mx-4 mt-4 rounded-xl border border-navy/10 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy/50">
                {lang === "sw" ? "Muhtasari wa Oda" : "Order Summary"}
              </p>
              {cart.map((line, i) => {
                const sub = [line.sizeLabel?.[lang], line.choiceLabel?.[lang]].filter(Boolean).join(" · ");
                return (
                  <div key={i} className="flex justify-between gap-2 text-sm">
                    <span className="text-navy">
                      {line.name[lang]}
                      {sub && <span className="text-navy/50"> · {sub}</span>}
                      {" "}×{line.qty}
                    </span>
                    <span className="font-semibold text-gold-deep whitespace-nowrap">
                      {formatMoney(line.unitPrice * line.qty)}
                    </span>
                  </div>
                );
              })}
              <div className="mt-2 flex justify-between border-t border-navy/10 pt-2 font-bold">
                <span className="text-navy">{t("total")}</span>
                <span className="text-gold-deep">{formatMoney(total)}</span>
              </div>
            </div>

            {/* Payment info — QR code + Lipa Namba */}
            <div className="mx-4 mt-3 rounded-xl border-2 border-gold/40 bg-gold/5 px-4 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-navy/60 mb-3">
                {lang === "sw" ? "Lipa kwa Scan au Namba" : "Pay by Scan or Number"}
              </p>

              {/* Scannable QR code */}
              <div className="flex justify-center mb-3">
                <div style={{
                  background:"#fff", borderRadius:"12px",
                  padding:"8px", border:"2px solid rgba(212,175,55,0.4)",
                  display:"inline-block",
                }}>
                  <img
                    src="/qr-lipa.jpg"
                    alt="Lipa QR code — scan to pay"
                    width={180}
                    height={157}
                    style={{ display:"block", borderRadius:"6px" }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-navy/50 mb-1 font-medium uppercase tracking-wider">
                {lang === "sw" ? "Au ingiza namba" : "Or enter number"}
              </p>

              <p className="font-display text-3xl font-black tracking-widest text-navy">
                {business.lipaNamba}
              </p>
              <p className="text-xs text-navy/60 mt-0.5">{business.lipaName}</p>

              <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                {["Mixx by Yas","Airtel Money","M-Pesa","Benki"].map((n,i) => (
                  <span key={i} style={{
                    background:"rgba(11,31,69,0.07)",
                    borderRadius:"99px", padding:"2px 10px",
                    fontSize:"10px", color:"rgba(11,31,69,0.55)",
                    fontFamily:"sans-serif", fontWeight:600,
                  }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="px-4 py-4 space-y-3">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  {t("name")} *
                </label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  placeholder={lang === "sw" ? "Jina lako kamili" : "Your full name"}
                  className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  {t("phone")} *
                </label>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="0700 000 000"
                  type="tel"
                  className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </div>

              {/* Service type */}
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  {t("serviceType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activeServices.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setForm((f) => ({ ...f, service: s.key }))}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                        form.service === s.key
                          ? "border-gold bg-gold/15 text-navy"
                          : "border-navy/15 bg-white text-navy/70"
                      }`}
                    >
                      <span>{s.icon}</span>
                      {t(s.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              {form.service === "delivery" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    {t("address")}
                  </label>
                  <input
                    value={form.address}
                    onChange={set("address")}
                    placeholder={t("addressHint")}
                    className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Dine-in time */}
              {form.service === "dinein" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    {t("dineTime")}
                  </label>
                  <input
                    value={form.dineTime}
                    onChange={set("dineTime")}
                    type="datetime-local"
                    className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Guest count */}
              {(form.service === "dinein" || form.service === "events") && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    {t("guests")}
                  </label>
                  <input
                    value={form.guests}
                    onChange={set("guests")}
                    type="number"
                    min="1"
                    placeholder="2"
                    className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  {t("notes")}
                </label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={2}
                  placeholder={t("notesHint")}
                  className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none resize-none"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="border-t border-navy/10 bg-white px-4 py-4">
              <button
                onClick={submit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] py-3.5 font-bold text-white transition hover:bg-[#1db954]"
              >
                <WhatsAppIcon width={22} height={22} />
                {t("sendOrder")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
