// =====================================================================
//  ICONS — small inline SVG icons for the HUD (they use currentColor,
//  so they follow the button's text colour).
// =====================================================================

const WEATHER_ICONS = {
  clear: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  rain: '<path d="M7 15a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.4 1.5A3.3 3.3 0 0 1 17.5 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  storm: '<path d="M7 14a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.4 1.5A3.3 3.3 0 0 1 17.5 14z"/><path d="M12.5 15l-2.5 4h3l-2 4"/>',
  fog: '<path d="M4 8h12M7 12h13M4 16h10M9 20h9"/>',
  petals: '<circle cx="12" cy="7.5" r="3"/><circle cx="16.5" cy="11.5" r="3"/><circle cx="14.5" cy="17" r="3"/><circle cx="9.5" cy="17" r="3"/><circle cx="7.5" cy="11.5" r="3"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
}

function svg(paths) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>'
}

export function weatherIcon(key) {
  return svg(WEATHER_ICONS[key] || WEATHER_ICONS.clear)
}

export function helpIcon() {
  return svg('<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><path d="M12 17.6v.1"/>')
}

// Sun by day, moon by night (the HUD clock).
export function sunIcon() {
  return svg(WEATHER_ICONS.clear)
}

export function moonIcon() {
  return svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>')
}

// Sunrise / sunset: half a sun on the horizon.
export function horizonIcon() {
  return svg('<path d="M7.5 17a4.5 4.5 0 0 1 9 0"/><path d="M3 20.5h18M12 7v2.5M4.9 10.9l1.8 1.8M19.1 10.9l-1.8 1.8M2 17h2.5M19.5 17H22"/>')
}
