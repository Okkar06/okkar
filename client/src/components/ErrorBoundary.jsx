import { Component } from 'react'

/**
 * Keeps one broken section from blanking the whole cabinet. Shows an arcade
 * "GAME OVER" style panel instead of an empty page.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      // Development aid only — nothing is reported anywhere in production.
      console.error(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-16 max-w-xl px-6">
          <div className="maze-wall p-8 text-center">
            <p className="hud-label">GAME OVER</p>
            <p className="mt-4 font-pixel text-xs leading-relaxed text-ink">
              THIS PANEL CRASHED
            </p>
            <p className="mt-4 text-sm text-ink-dim">
              Something went wrong here. Reloading the page usually clears it.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
