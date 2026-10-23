// =====================================================================
//  CATCH CARD — the little card that shows what you fished up.
//  It does NOT block the game: no backdrop, closes itself after a while,
//  and screen readers announce it politely (role="status").
// =====================================================================

const card = document.getElementById('catch-card')
const image = document.getElementById('catch-image')
const title = document.getElementById('catch-title')
const text = document.getElementById('catch-text')
const closeButton = document.getElementById('catch-close')

let hideTimer = null

export function showCatch(options) {
  title.textContent = options.title
  text.textContent = options.text
  if (options.imageUrl) {
    image.src = options.imageUrl
    image.hidden = false
  } else {
    image.hidden = true
  }
  card.hidden = false
  // Restart the entrance animation.
  card.classList.remove('is-showing')
  void card.offsetWidth
  card.classList.add('is-showing')

  clearTimeout(hideTimer)
  hideTimer = setTimeout(hideCatch, 9000)
}

export function hideCatch() {
  card.hidden = true
  clearTimeout(hideTimer)
}

closeButton.addEventListener('click', hideCatch)
