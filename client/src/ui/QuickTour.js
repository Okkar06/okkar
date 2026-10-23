// =====================================================================
//  QUICK TOUR — House -> Workshop -> Mailbox in under a minute.
//  At each stop the player glides to the door and the panel opens, with
//  "Next" / "End tour" buttons in the panel footer.
//  To change the tour, edit the `stops` list below.
// =====================================================================

import { bus } from '../utils/state.js'
import { openSection } from './sections.js'
import { closePanel } from './Panel.js'
import { showToast } from './Hud.js'
import { closeDialogue, isDialogueOpen } from './DialogueBox.js'

const stops = [
  // zone = object name in Tiled's "Interactables" layer; section = what to open there
  { zone: 'house', section: 'about', title: 'About me' },
  { zone: 'workshop', section: 'projects', title: 'Projects' },
  { zone: 'mailbox', section: 'contact', title: 'Contact' },
]

let currentStop = -1

export function startTour() {
  if (isDialogueOpen()) closeDialogue(false)
  currentStop = -1
  goToNextStop()
}

export function goToNextStop() {
  currentStop = currentStop + 1
  if (currentStop >= stops.length) {
    endTour()
    return
  }
  closePanel()
  const stop = stops[currentStop]
  const stopNumber = currentStop
  bus.emit('travel', {
    zone: stop.zone,
    onArrive: function () {
      openSection(stop.section, { footerHtml: buildFooter(stopNumber) })
    },
  })
}

export function endTour() {
  const finished = currentStop >= stops.length - 1
  currentStop = -1
  closePanel()
  if (finished) {
    showToast('Thanks for visiting! Feel free to explore, or use the Résumé and Contact buttons any time.', 5000)
  }
}

function buildFooter(stopNumber) {
  let html = '<p>Tour stop ' + (stopNumber + 1) + ' of ' + stops.length + '</p>'
  html += '<span class="btn-row" style="margin:0">'
  html += '<button type="button" class="btn" data-action="tour-end">End tour</button>'
  if (stopNumber < stops.length - 1) {
    html += '<button type="button" class="btn btn-primary" data-action="tour-next">Next: ' +
      stops[stopNumber + 1].title + ' →</button>'
  } else {
    html += '<button type="button" class="btn btn-primary" data-action="tour-end">Finish tour</button>'
  }
  html += '</span>'
  return html
}
