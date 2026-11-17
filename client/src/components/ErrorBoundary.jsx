import { Component, Fragment } from 'react'
import ArcadeButton from './ArcadeButton'
import Ghost from './Ghost'

const COPY = {
  // One section broke; the rest of the page is still fine.
  section: {
    title: 'THIS STAGE CRASHED',
    message: 'Something went wrong in this part of the page. The rest still works.',
  },
  // Nothing could render at all.
  page: {
    title: 'THE CABINET CRASHED',
    message: 'Something went wrong while loading the page.',
  },
}

/**
 * ErrorBoundary — catches a render error in its children and shows an arcade
 * "GAME OVER" panel with a way out, instead of a blank screen.
 *
 * `scope="section"` wraps one part of the page: TRY AGAIN re-mounts just that
 * part. `scope="page"` wraps the whole app, where the only safe retry is a
 * reload. No error detail is ever shown to the visitor.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, attempt: 0 }
    this.retry = this.retry.bind(this)
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

  retry() {
    if (this.props.scope === 'page') {
      window.location.reload()
      return
    }
    // A new key re-mounts the children from scratch, clearing whatever
    // state led to the crash.
    this.setState((state) => ({ hasError: false, attempt: state.attempt + 1 }))
  }

  render() {
    if (!this.state.hasError) {
      return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>
    }

    const page = this.props.scope === 'page'
    const copy = page ? COPY.page : COPY.section

    return (
      <div
        role="alert"
        className={`mx-auto flex max-w-xl items-center px-6 ${page ? 'min-h-screen py-10' : 'my-16'}`}
      >
        <div className="maze-wall w-full p-8 text-center motion-safe:animate-pop">
          <div className="flex justify-center">
            <Ghost color="red" size={44} />
          </div>
          <p className="hud-label mt-5">GAME OVER</p>
          <p className="mt-4 font-pixel text-pixel-md uppercase text-ink">{copy.title}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-dim">{copy.message}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ArcadeButton variant="primary" onClick={this.retry}>
              {page ? 'RELOAD' : 'TRY AGAIN'}
            </ArcadeButton>
            {page ? null : (
              <ArcadeButton onClick={() => window.location.reload()}>RELOAD PAGE</ArcadeButton>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
