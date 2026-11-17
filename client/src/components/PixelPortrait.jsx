import { useReducedMotion } from 'framer-motion'
import { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { anyFree, createParticles, reassemble, scatter, settle, step } from '../lib/mosaicPhysics'
import { MOSAIC_DEFAULTS, buildMosaic, gridLabels, mixColor, sampleImage } from '../lib/pixelMosaic'
import { derivePalette } from '../theme/palette'
import { DEFAULT_THEME } from '../theme/presets'
import { ThemeContext } from '../theme/ThemeContext'
import Mascot from './Mascot'
import PelletLoader from './PelletLoader'

const RESIZE_DEBOUNCE_MS = 150
const COLOR_FADE_MS = 300 // matches the theme's own cross-fade
const TOUCH_REASSEMBLE_MS = 1200
const LOW_END_TILES = 600
const TINT_AMOUNT = 0.35
const LABEL_FONT = '7px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// Built mosaics, so a remount or a return to an earlier size is free.
const cache = new Map()
const CACHE_LIMIT = 6

function cachedMosaic(key, build) {
  if (cache.has(key)) {
    const hit = cache.get(key)
    cache.delete(key)
    cache.set(key, hit)
    return hit
  }
  const mosaic = build()
  cache.set(key, mosaic)
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value)
  return mosaic
}

/** Fewer tiles on touch, few-core or low-memory devices. */
function tileBudget() {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = navigator.deviceMemory ?? 8
  return coarse || cores <= 4 || memory <= 4 ? LOW_END_TILES : MOSAIC_DEFAULTS.maxTiles
}

const channels = (triplet) => triplet.split(' ').map(Number)
const css = ([r, g, b], alpha = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`
const lerp = (a, b, t) => a + (b - a) * t

/** The colours one frame is drawn with: theme tokens plus every tile's fill. */
function themeColors(mosaic, color, mode, tint) {
  const { vars } = derivePalette(color, mode)
  const accent = channels(vars['--c-glow'])
  const tiles = new Float32Array(mosaic.tiles.length * 3)
  mosaic.tiles.forEach((tile, i) => {
    tiles.set(tint ? mixColor(tile.rgb, accent, TINT_AMOUNT) : tile.rgb, i * 3)
  })
  return {
    background: channels(vars['--c-void']),
    line: channels(vars['--c-wall']),
    label: channels(vars['--c-ink-dim']),
    tiles,
  }
}

function blendColors(from, to, t) {
  if (t >= 1 || from.tiles.length !== to.tiles.length) return to
  const mix = (a, b) => a.map((value, i) => lerp(value, b[i], t))
  const tiles = new Float32Array(to.tiles.length)
  for (let i = 0; i < tiles.length; i += 1) tiles[i] = lerp(from.tiles[i], to.tiles[i], t)
  return { background: mix(from.background, to.background), line: mix(from.line, to.line), label: mix(from.label, to.label), tiles }
}

function fillStyles(colors) {
  const styles = new Array(colors.tiles.length / 3)
  for (let i = 0; i < styles.length; i += 1) {
    styles[i] = css([colors.tiles[i * 3], colors.tiles[i * 3 + 1], colors.tiles[i * 3 + 2]])
  }
  return styles
}

/** Sizes a canvas's backing store for the device pixel ratio. */
function fitCanvas(canvas, width, height, dpr) {
  const w = Math.max(1, Math.round(width * dpr))
  const h = Math.max(1, Math.round(height * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
}

/**
 * PixelPortrait — the photo as a colourful pixel mosaic on a <canvas>.
 *
 * The mosaic (quadtree tiles, background cut away) is built once per size
 * by src/lib/pixelMosaic.js and cached. The grid, background and optional
 * tint come from the theme, and fade with it when the colour changes.
 *
 * Every tile is a particle (src/lib/mosaicPhysics.js):
 * - mode "repel": tiles flee the cursor and spring home after it.
 * - mode "scatter": hovering flings every tile across the screen (on an
 *   overlay canvas, so they can leave the box); leaving reassembles them.
 * - On touch, a tap scatters them and they come back a moment later.
 *
 * The animation loop only runs while something moves, and pauses offscreen
 * or in a hidden tab. Reduced motion gets the still mosaic. If the browser
 * can't draw to a canvas, the original photo is shown; if the photo itself
 * fails, the mascot stands in. Either way it is one image, one description.
 */
function PixelPortrait({
  src,
  alt,
  tileMin = MOSAIC_DEFAULTS.tileMin,
  tileMax = MOSAIC_DEFAULTS.tileMax,
  mode = 'repel',
  radius = 90,
  force = 1,
  showNumbers = true,
  tintWithTheme = false,
  bgThreshold = MOSAIC_DEFAULTS.bgThreshold,
  label = 'P1.PIX',
}) {
  // Works outside a ThemeProvider too (default theme), so it stays reusable.
  const { color, mode: themeMode } = useContext(ThemeContext) ?? DEFAULT_THEME
  const reduceMotion = useReducedMotion()
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const imageRef = useRef(null)
  const colorsRef = useRef(null)
  const engineRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | no-canvas | no-image
  const [mosaic, setMosaic] = useState(null)
  const [overlay, setOverlay] = useState(false)

  // 1. The photo loaded: check a canvas can be drawn on before using one.
  const handleLoad = () => {
    let drawable = false
    try {
      drawable = Boolean(canvasRef.current?.getContext('2d'))
    } catch {
      // Some locked-down browsers throw instead of returning null.
    }
    setStatus(drawable ? 'ready' : 'no-canvas')
  }

  // 2. Build (or fetch from cache) the mosaic for the box's size, and again
  //    whenever the size changes.
  useEffect(() => {
    if (status !== 'ready') return undefined
    let timer = null
    let lastKey = null

    const build = () => {
      const box = boxRef.current
      const image = imageRef.current
      if (!box || !image?.naturalWidth) return
      const { width, height } = box.getBoundingClientRect()
      if (width < 1 || height < 1) return

      const w = Math.round(width)
      const h = Math.round(height)
      const maxTiles = tileBudget()
      const key = [src, w, h, tileMin, tileMax, bgThreshold, maxTiles].join('|')
      if (key === lastKey) return
      lastKey = key

      try {
        const next = cachedMosaic(key, () => {
          // One sample per 2 CSS px is plenty for tiles of 4px and up.
          const unit = tileMin >= 4 ? 2 : 1
          const sample = sampleImage(image, Math.ceil(w / unit), Math.ceil(h / unit))
          if (!sample) throw new Error('canvas unavailable')
          return buildMosaic(sample, { unit, width: w, height: h, tileMin, tileMax, bgThreshold, maxTiles })
        })
        setMosaic(next)
      } catch {
        setStatus('no-canvas')
      }
    }

    build()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            clearTimeout(timer)
            timer = setTimeout(build, RESIZE_DEBOUNCE_MS)
          })
    observer?.observe(boxRef.current)
    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [status, src, tileMin, tileMax, bgThreshold])

  // 3. Theme colours: fade from the old set to the new, like the page does.
  useEffect(() => {
    if (!mosaic) return
    const to = themeColors(mosaic, color, themeMode, tintWithTheme)
    const previous = colorsRef.current
    const from = previous && previous.mosaic === mosaic ? previous.current() : to
    const start = performance.now()
    let settled = null

    colorsRef.current = {
      mosaic,
      current() {
        const t = Math.min(1, (performance.now() - start) / COLOR_FADE_MS)
        if (t >= 1) {
          settled ??= { ...to, styles: fillStyles(to) }
          return settled
        }
        const blended = blendColors(from, to, t)
        return { ...blended, styles: fillStyles(blended) }
      },
      fading: () => performance.now() - start < COLOR_FADE_MS,
    }
    engineRef.current?.wake()
  }, [mosaic, color, themeMode, tintWithTheme])

  // 4. The engine: particles, drawing, pointer input and the frame loop.
  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!mosaic || !box || !canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    const { tiles, width, height } = mosaic
    const particles = createParticles(tiles)
    const gridStep = Math.max(8, Math.round(tileMax / 2))
    const labels = showNumbers ? gridLabels(width, height, gridStep * 2, Math.round((width * height) / 9000)) : []
    const interactive = !reduceMotion
    let dpr = 1
    let pointer = null
    let scattered = false
    let touchTimer = null
    let rafId = 0
    let lastTime = 0
    let onScreen = true

    const drawTiles = (ctx, colors, offsetX, offsetY) => {
      const fineLine = css(colors.background, 0.55)
      for (let i = 0; i < tiles.length; i += 1) {
        const size = tiles[i].size
        const gap = size >= 12 ? 1 : 0.5
        const half = size / 2 - gap / 2
        const x = particles.x[i] + offsetX
        const y = particles.y[i] + offsetY
        const rot = particles.rot[i]
        ctx.fillStyle = colors.styles[i]

        if (Math.abs(rot) < 0.002) ctx.setTransform(dpr, 0, 0, dpr, dpr * x, dpr * y)
        else {
          const cos = Math.cos(rot) * dpr
          const sin = Math.sin(rot) * dpr
          ctx.setTransform(cos, sin, -sin, cos, dpr * x, dpr * y)
        }
        ctx.fillRect(-half, -half, half * 2, half * 2)

        if (tiles[i].fine) {
          // Decoration: a fine 4×4 grid inside a few big tiles.
          ctx.strokeStyle = fineLine
          ctx.lineWidth = 0.5
          ctx.beginPath()
          for (let k = 1; k < 4; k += 1) {
            const at = -half + (half * 2 * k) / 4
            ctx.moveTo(at, -half)
            ctx.lineTo(at, half)
            ctx.moveTo(-half, at)
            ctx.lineTo(half, at)
          }
          ctx.stroke()
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const paint = () => {
      const colors = colorsRef.current?.current()
      if (!colors) return

      fitCanvas(canvas, width, height, dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.fillStyle = css(colors.background)
      context.fillRect(0, 0, width, height)

      // The faint full grid behind the portrait.
      context.strokeStyle = css(colors.line, 0.13)
      context.lineWidth = 1 / dpr
      context.beginPath()
      for (let x = gridStep; x < width; x += gridStep) {
        context.moveTo(x, 0)
        context.lineTo(x, height)
      }
      for (let y = gridStep; y < height; y += gridStep) {
        context.moveTo(0, y)
        context.lineTo(width, y)
      }
      context.stroke()

      if (labels.length > 0) {
        context.font = LABEL_FONT
        context.textBaseline = 'top'
        context.fillStyle = css(colors.label, 0.55)
        for (const item of labels) context.fillText(item.text, item.x + 2, item.y + 2)
      }

      const layer = overlayRef.current
      if (layer && anyFree(particles)) {
        // Scattered: tiles fly on the full-screen overlay, outside the box.
        const rect = box.getBoundingClientRect()
        fitCanvas(layer, window.innerWidth, window.innerHeight, dpr)
        const overlayContext = layer.getContext('2d')
        overlayContext.setTransform(1, 0, 0, 1, 0, 0)
        overlayContext.clearRect(0, 0, layer.width, layer.height)
        drawTiles(overlayContext, colors, rect.left, rect.top)
      } else {
        drawTiles(context, colors, 0, 0)
      }
    }

    const frame = (time) => {
      rafId = 0
      const dt = lastTime ? time - lastTime : 1000 / 60
      lastTime = time
      const moving = interactive
        ? step(particles, dt, { pointer: mode === 'repel' ? pointer : null, radius, force, now: time })
        : false
      paint()

      if (moving || colorsRef.current?.fading()) schedule()
      else {
        lastTime = 0
        if (!anyFree(particles)) setOverlay(false)
      }
    }

    function schedule() {
      if (!rafId && onScreen && document.visibilityState !== 'hidden') rafId = requestAnimationFrame(frame)
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      paint()
    }
    resize()

    engineRef.current = { wake: schedule }

    const local = (event) => {
      const rect = box.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const startScatter = (at) => {
      scattered = true
      setOverlay(true)
      scatter(particles, at.x, at.y, { force, now: performance.now() })
      schedule()
    }

    const endScatter = (at) => {
      if (!scattered) return
      scattered = false
      reassemble(particles, at.x, at.y, { now: performance.now() })
      schedule()
    }

    const handleMove = (event) => {
      if (event.pointerType === 'touch') return
      const at = local(event)
      if (mode === 'scatter') {
        if (!scattered) startScatter(at)
        pointer = at
        return
      }
      pointer = at
      schedule()
    }

    const handleLeave = (event) => {
      if (event.pointerType === 'touch') return
      const at = pointer ?? local(event)
      pointer = null
      if (mode === 'scatter') endScatter(at)
      else schedule()
    }

    // Touch: a tap (a click that started as a touch, so never a scroll)
    // scatters the tiles, and they come back a moment later.
    let lastPointerType = 'mouse'
    const handleDown = (event) => {
      lastPointerType = event.pointerType
    }
    const handleTap = (event) => {
      if (lastPointerType !== 'touch' || scattered) return
      const at = local(event)
      startScatter(at)
      clearTimeout(touchTimer)
      touchTimer = setTimeout(() => endScatter(at), TOUCH_REASSEMBLE_MS)
    }

    const handleVisibility = () => schedule()
    // Scattered tiles live in viewport space: keep them with the page.
    const handleScroll = () => {
      if (anyFree(particles)) schedule()
    }

    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting
            if (onScreen) schedule()
            else if (rafId) {
              cancelAnimationFrame(rafId)
              rafId = 0
              lastTime = 0
            }
          })
    intersection?.observe(box)

    if (interactive) {
      box.addEventListener('pointermove', handleMove)
      box.addEventListener('pointerleave', handleLeave)
      box.addEventListener('pointerdown', handleDown)
      box.addEventListener('click', handleTap)
      window.addEventListener('scroll', handleScroll, { passive: true })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('resize', resize)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(touchTimer)
      intersection?.disconnect()
      box.removeEventListener('pointermove', handleMove)
      box.removeEventListener('pointerleave', handleLeave)
      box.removeEventListener('pointerdown', handleDown)
      box.removeEventListener('click', handleTap)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', resize)
      settle(particles)
      engineRef.current = null
      setOverlay(false)
    }
  }, [mosaic, mode, radius, force, showNumbers, tileMax, reduceMotion])

  if (!src || status === 'no-image') {
    return (
      <div role="img" aria-label={alt ?? 'Portrait unavailable'} className="absolute inset-0 grid place-items-center">
        <Mascot size={72} chomping={false} />
      </div>
    )
  }

  if (status === 'no-canvas') {
    return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-top" />
  }

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden">
      {/* The source pixels. Never shown; only sampled. */}
      <img
        ref={imageRef}
        src={src}
        alt=""
        aria-hidden="true"
        decoding="async"
        onLoad={handleLoad}
        onError={() => setStatus('no-image')}
        className="hidden"
      />

      <canvas ref={canvasRef} role="img" aria-label={alt} className="absolute inset-0 h-full w-full" />

      {mosaic ? null : (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-ink-dim">
          <PelletLoader />
        </div>
      )}

      <span aria-hidden="true" className="hud-label pointer-events-none absolute bottom-2.5 right-2.5 rounded-sm bg-void/80 px-1.5 py-1">
        {label}
      </span>

      {overlay
        ? createPortal(
            <canvas ref={overlayRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />,
            document.body,
          )
        : null}
    </div>
  )
}

export default PixelPortrait
