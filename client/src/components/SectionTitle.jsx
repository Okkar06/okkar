function SectionTitle({ label, title, subtitle, align = 'left' }) {
  const base = align === 'center' ? 'text-center' : 'text-left'
  const subClass = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-10 ${base}`}>
      {label ? <p className="section-label">{label}</p> : null}
      <h2 className="section-heading mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className={`section-subtext mt-3 max-w-2xl ${subClass}`}>{subtitle}</p>
      ) : null}
    </div>
  )
}

export default SectionTitle
