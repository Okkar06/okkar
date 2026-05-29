function Marquee({ items }) {
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="flex w-[200%] gap-3 py-3 will-change-transform animate-marquee">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="whitespace-nowrap rounded-full border border-white/10 bg-bg px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-neutral-200/90"
            aria-hidden={index >= items.length}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Marquee
