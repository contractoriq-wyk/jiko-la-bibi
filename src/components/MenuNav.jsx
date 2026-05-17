import { useEffect, useState } from "react";
import { sections } from "../data/menu";
import { useLang } from "../lang/LanguageContext";

export default function MenuNav() {
  const { lang } = useLang();
  const [active, setActive] = useState(sections[0].id);

  // Highlight the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-[68px] z-30 border-y border-gold/25 bg-cream/95 backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              active === s.id
                ? "bg-navy text-gold"
                : "bg-navy/5 text-navy/70 hover:bg-navy/10"
            }`}
          >
            {s.name[lang]}
          </a>
        ))}
      </div>
    </nav>
  );
}
