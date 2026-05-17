import { useEffect, useState } from "react";
import { sections } from "../data/menu";
import { useLang } from "../lang/LanguageContext";

export default function MenuNav() {
  const { lang } = useLang();
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="sticky top-[60px] z-30 border-y border-gold/20 bg-cream/95 backdrop-blur"
      aria-label="Menu sections"
    >
      <div className="no-scrollbar mx-auto flex max-w-5xl gap-1.5 overflow-x-auto px-3 py-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
              active === s.id
                ? "text-cream shadow-sm"
                : "bg-navy/6 text-navy/65 hover:bg-navy/12 hover:text-navy"
            }`}
            style={active === s.id ? { background: s.color } : {}}
          >
            <i className={`ti ${s.icon} text-[13px]`} aria-hidden="true" />
            <span>{s.name[lang].split(" ")[0]}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
