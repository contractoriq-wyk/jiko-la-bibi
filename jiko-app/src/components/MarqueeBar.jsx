const TEXT =
  "VYAKULA VYA NYUMBANI ✦ BEI NAFUU ✦ HUDUMA BORA ✦ PICKUP · DELIVERY · DINE-IN · EVENTS ✦ ";

export default function MarqueeBar() {
  return (
    <div className="bg-gold overflow-hidden py-2" aria-hidden="true">
      <div className="marquee-track">
        <span className="px-4 text-navy-deep font-body text-[11px] font-bold tracking-[2.5px]">
          {TEXT.repeat(4)}
        </span>
        <span className="px-4 text-navy-deep font-body text-[11px] font-bold tracking-[2.5px]">
          {TEXT.repeat(4)}
        </span>
      </div>
    </div>
  );
}
