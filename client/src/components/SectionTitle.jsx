function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-gray-400">{subtitle}</p> : null}
    </div>
  )
}

export default SectionTitle
