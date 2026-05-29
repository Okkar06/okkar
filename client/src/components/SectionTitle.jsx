function SectionTitle({ label, title, subtitle, align = 'left' }) {
  const alignmentClassName = align === 'center' ? 'text-center' : 'text-left'
  const subtitleClassName = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-10 ${alignmentClassName}`}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">{label}</p>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-100 md:text-4xl">{title}</h2>
      {subtitle ? <p className={`mt-3 max-w-2xl text-neutral-400 ${subtitleClassName}`}>{subtitle}</p> : null}
    </div>
  )
}

export default SectionTitle
