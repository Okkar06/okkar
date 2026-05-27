function HeroSection() {
  return (
    <section id="about" className="flex min-h-screen items-center px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-accent">Welcome</p>
        <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">Okkar</h1>
        <p className="mt-4 text-lg text-gray-300 md:text-xl">Full-stack developer building clean and modern web experiences.</p>
        <p className="mt-4 text-gray-400">
          I craft responsive interfaces, robust APIs, and scalable systems with a focus on performance and maintainability.
        </p>
        <a
          href="#projects"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          View My Work
        </a>
      </div>
    </section>
  )
}

export default HeroSection
