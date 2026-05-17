import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../utils/order";
import { CloseIcon, PlusIcon, MinusIcon } from "./Icons";

export default function CartDrawer({ onClose, onCheckout }) {
  const { lang, t } = useLang();
  const { cart, total, setQty, removeLine, keyOf } = useCart();

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-navy-deep/70"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md animate-slide-in flex-col bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-navy px-5 py-4">
          <h2 className="font-display text-xl font-bold text-cream">
            {t("cart")}
          </h2>
          <button
            onClick={onClose}
            className="text-cream/70 hover:text-gold"
            aria-label={t("close")}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cart.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-5xl">🍽️</p>
              <p className="mt-4 font-display text-lg font-semibold text-navy/60">
                {t("emptyCart")}
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-gold px-6 py-2.5 font-bold text-navy hover:bg-gold-light"
              >
                {t("continueOrdering")}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {cart.map((line) => {
              const key = keyOf(line);
              const subLabel = [
                line.sizeLabel?.[lang],
                line.choiceLabel?.[lang],
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-snug text-navy">
                      {line.name[lang]}
                    </p>
                    {subLabel && (
                      <p className="text-xs text-navy/50">{subLabel}</p>
                    )}
                    <p className="mt-1 text-sm font-bold text-gold-deep">
                      {formatMoney(line.unitPrice * line.qty)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        line.qty <= 1
                          ? removeLine(key)
                          : setQty(key, line.qty - 1)
                      }
                      className="grid h-7 w-7 place-items-center rounded-full bg-navy/10 text-navy hover:bg-navy hover:text-gold"
                    >
                      <MinusIcon width={14} height={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-navy">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => setQty(key, line.qty + 1)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-navy/10 text-navy hover:bg-navy hover:text-gold"
                    >
                      <PlusIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-navy/15 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-navy">{t("total")}</span>
              <span className="font-display text-xl font-black text-gold-deep">
                {formatMoney(total)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full rounded-xl bg-navy py-3.5 font-bold text-gold transition hover:bg-navy-light"
            >
              {t("checkout")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
