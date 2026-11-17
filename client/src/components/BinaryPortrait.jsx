import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { buildBinaryMask } from '../lib/binaryPortrait'
import Mascot from './Mascot'
import PelletLoader from './PelletLoader'

const PIXEL_FONT = '16px "Press Start 2P"'
const RESIZE_DEBOUNCE_MS = 150

/**
 * BinaryPortrait — the photo redrawn as a figure of 0s and 1s in the pixel
 * font, glowing in the theme colours. The digits are an alpha mask over a
 * gradient of theme tokens, so a colour switch re-colours it for free.
 *
 * It "decodes" in from the top the first time it scrolls into view, and a
 * faint scan line sweeps it after that (both off under reduced motion). If
 * the photo fails to load, or the browser cannot draw to a canvas, the
 * mascot stands in. Either way it is one image with one description.
 */
function BinaryPortrait({ photo }) {
  const boxRef = useRef(null)
  const imageRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [mask, setMask] = useState(null)
  const inView = useInView(boxRef, { once: true, amount: 0.3 })

  useEffect(() => {
    if (!loaded) return undefined

    let cancelled = false
    let timer = null

    const draw = async () => {
      try {
        // The digits are drawn in the pixel font, so wait for it.
        await document.fonts?.load(PIXEL_FONT)
      } catch {
        // Draw with the fallback monospace face instead.
      }
      if (cancelled || !boxRef.current || !imageRef.current) return

      const { width, height } = boxRef.current.getBoundingClientRect()
      if (width === 0 || height === 0) return

      try {
        const url = buildBinaryMask(imageRef.current, {
          width,
          height,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
        })
        if (cancelled) return
        if (url) setMask(url)
        else setFailed(true)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    draw()

    // Redraw for the new size when the layout changes (rotation, resize).
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            clearTimeout(timer)
            timer = setTimeout(draw, RESIZE_DEBOUNCE_MS)
          })
    observer?.observe(boxRef.current)

    return () => {
      cancelled = true
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [loaded])

  if (!photo?.src || failed) {
    return (
      <div role="img" aria-label={photo?.alt ?? 'Portrait unavailable'} className="absolute inset-0 grid place-items-center">
        <Mascot size={72} chomping={false} />
      </div>
    )
  }

  const maskStyle = mask
    ? {
        maskImage: `url("${mask}")`,
        WebkitMaskImage: `url("${mask}")`,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }
    : undefined

  return (
    <div ref={boxRef} role="img" aria-label={photo.alt} className="absolute inset-0 overflow-hidden">
      {/* The source pixels. Never shown; only sampled. */}
      <img
        ref={imageRef}
        src={photo.src}
        alt=""
        aria-hidden="true"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className="hidden"
      />

      {mask ? (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink via-glow to-wall" style={maskStyle} />

          {/* Scan line: a soft band sweeping down the figure. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden motion-safe:block motion-safe:animate-scan">
            <div className="h-12 bg-gradient-to-b from-transparent via-glow/25 to-transparent" />
          </div>

          {/* Decode-in: a cover that steps away, top first, once in view. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 hidden origin-bottom bg-floor motion-safe:block ${
              inView ? 'motion-safe:animate-decode' : ''
            }`}
          />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-ink-dim">
          <PelletLoader />
        </div>
      )}

      <span aria-hidden="true" className="hud-label absolute bottom-2.5 right-2.5 rounded-sm bg-void/80 px-1.5 py-1">
        P1.BIN
      </span>
    </div>
  )
}

export default BinaryPortrait
