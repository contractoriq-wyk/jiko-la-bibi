import { useEffect, useState } from "react";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../utils/order";
import { CloseIcon, PlusIcon, MinusIcon } from "./Icons";

export default function ItemModal({ item, onClose }) {
  const { lang, t } = useLang();
  const { addLine } = useCart();

  const [sizeIdx, setSizeIdx] = useState(0);
  const [choiceIdx, setChoiceIdx] = useState(0);
  const [qty, setQty] = useState(1);

  // Reset when a new item opens
  useEffect(() => {
    setSizeIdx(0);
    setChoiceIdx(0);
    setQty(1);
  }, [item]);

  if (!item) return null;

  const unitPrice = item.sizes ? item.sizes[sizeIdx].price : item.price;

  function confirm() {
    const line = {
      itemId: item.id,
      name: item.name,
      unitPrice,
      qty,
    };
    if (item.sizes) {
      line.sizeId = String(sizeIdx);
      line.sizeLabel = item.sizes[sizeIdx].label;
    }
    if (item.choices) {
      line.choiceId = String(choiceIdx);
      line.choiceLabel = item.choices[choiceIdx];
    }
    addLine(line);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-up overflow-hidden rounded-t-2xl bg-cream sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 bg-navy px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-cream">
              {item.name[lang]}
            </h2>
            <p className="text-xs italic text-gold/80">
              {item.name[lang === "sw" ? "en" : "sw"]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-cream/70 hover:text-gold"
            aria-label={t("close")}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {/* Sizes */}
          {item.sizes && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-bold text-navy">
                {t("chooseSize")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {item.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSizeIdx(i)}
                    className={`rounded-xl border-2 p-2.5 text-center transition ${
                      sizeIdx === i
                        ? "border-gold bg-gold/15"
                        : "border-navy/15 bg-white"
                    }`}
                  >
                    <span className="block text-sm font-bold text-navy">
                      {s.label[lang]}
                    </span>
                    <span className="block text-xs font-semibold text-gold-deep">
                      {formatMoney(s.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Choices (protein, etc.) */}
          {item.choices && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-bold text-navy">
                {t("chooseOption")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setChoiceIdx(i)}
                    className={`rounded-xl border-2 p-2.5 text-sm font-semibold transition ${
                      choiceIdx === i
                        ? "border-gold bg-gold/15 text-navy"
                        : "border-navy/15 bg-white text-navy/80"
                    }`}
                  >
                    {c[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-navy">{t("quantity")}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-navy text-gold disabled:opacity-40"
                disabled={qty <= 1}
              >
                <MinusIcon />
              </button>
              <span className="w-6 text-center text-lg font-bold text-navy">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-navy text-gold"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Footer / confirm */}
        <div className="border-t border-navy/10 bg-white px-5 py-4">
          <button
            onClick={confirm}
            className="flex w-full items-center justify-between rounded-xl bg-gold px-5 py-3.5 font-bold text-navy transition hover:bg-gold-light"
          >
            <span>{t("add")}</span>
            <span>{formatMoney(unitPrice * qty)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
