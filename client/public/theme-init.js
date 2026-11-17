/*
 * Runs before first paint so the cabinet never flashes the wrong theme.
 * Kept as a separate file (rather than an inline <script>) so the server's
 * Content-Security-Policy can stay on script-src 'self' with no
 * 'unsafe-inline'.
 *
 * It holds no colours and no palette maths: it only replays the custom
 * properties the theme engine (src/theme) derived and cached last time. With
 * nothing cached, the default tokens in the stylesheet apply. Every value is
 * pattern-checked first, because localStorage can hold anything.
 */
(function () {
  var root = document.documentElement
  var mode = 'dark'

  try {
    var saved = JSON.parse(localStorage.getItem('okkar-theme') || 'null')

    if (saved && typeof saved === 'object') {
      if (saved.mode === 'light' || saved.mode === 'dark') mode = saved.mode

      if (saved.vars && typeof saved.vars === 'object') {
        Object.keys(saved.vars).forEach(function (name) {
          var value = saved.vars[name]
          if (/^--c-[a-z-]+$/.test(name) && /^\d{1,3} \d{1,3} \d{1,3}$/.test(value)) {
            root.style.setProperty(name, value)
          }
        })
      }

      if (/^#[0-9a-f]{6}$/.test(saved.themeColor)) {
        var meta = document.querySelector('meta[name="theme-color"]')
        if (meta) meta.setAttribute('content', saved.themeColor)
      }
    } else {
      // Older builds stored only the dark/light switch.
      var legacy = localStorage.getItem('color-mode')
      if (legacy === 'light' || legacy === 'dark') mode = legacy
    }
  } catch {
    // Storage blocked or corrupt: the default theme applies.
  }

  root.setAttribute('data-mode', mode)
})()
