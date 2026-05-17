// Small inline SVG icons — no library needed (keeps the site light & fast).
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

export const WhatsAppIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.47-.01-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.42.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const PhoneIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
