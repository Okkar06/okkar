import { useState } from 'react'
import SectionTitle from '../components/SectionTitle'

const initialForm = { name: '', email: '', message: '' }

function ContactSection() {
  const [formData, setFormData] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${apiBaseUrl}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Unable to send message right now.')
      }

      setFormData(initialForm)
      setStatus({ type: 'success', message: 'Thanks! Your message has been sent.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <SectionTitle title="Contact" subtitle="Let’s build something together" />
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 bg-card p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-gray-200">
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white outline-none ring-accent focus:ring"
              />
            </label>
            <label className="text-sm text-gray-200">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white outline-none ring-accent focus:ring"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm text-gray-200">
            Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="mt-2 w-full rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white outline-none ring-accent focus:ring"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 rounded-full bg-accentAlt px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          {status.message ? (
            <p className={`mt-4 text-sm ${status.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {status.message}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <a href="https://github.com/Okkar06" target="_blank" rel="noreferrer" className="text-accent hover:text-blue-300">
              GitHub
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-accent hover:text-blue-300">
              LinkedIn
            </a>
            <a href="mailto:hello@example.com" className="text-accent hover:text-blue-300">
              Email
            </a>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ContactSection
