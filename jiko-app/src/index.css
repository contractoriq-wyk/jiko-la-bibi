@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
body { @apply font-body bg-cream text-navy antialiased; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f0e3c4; }
::-webkit-scrollbar-thumb { background: #b8941f; border-radius: 8px; }

/* Marquee */
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-track { animation: marquee 28s linear infinite; display: flex; white-space: nowrap; width: max-content; }
.marquee-track:hover { animation-play-state: paused; }

/* Kanga diagonal stripe pattern */
.kanga-stripe {
  background-image: repeating-linear-gradient(
    45deg, #d4af37 0, #d4af37 7px, #06132e 7px, #06132e 14px
  );
}

/* Fade-up reveal */
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp 0.55s ease both; }
.fade-up-1 { animation-delay: 0.05s; }
.fade-up-2 { animation-delay: 0.12s; }
.fade-up-3 { animation-delay: 0.22s; }
.fade-up-4 { animation-delay: 0.34s; }

/* Slide-in (cart) */
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.slide-in { animation: slideIn 0.3s ease both; }

/* Food-strip pulse */
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
.food-ball:hover { animation: pulse 0.4s ease; }

/* Section-anchor */
.section-anchor { scroll-margin-top: 100px; }

/* Hide scrollbar on nav strip */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Gold shimmer on card hover */
.menu-card { transition: border-color 0.2s, box-shadow 0.2s; }
.menu-card:hover { border-color: #d4af37 !important; box-shadow: 0 4px 18px -8px rgba(180,130,20,0.35); }

/* Size box active ring */
.size-box-active { outline: 2px solid #d4af37; outline-offset: 2px; }
