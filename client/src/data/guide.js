// =====================================================================
//  GUIDE — what Pip (the villager) says. Edit freely.
//
//  `firstVisit` is the full welcome. A line can be a plain string, or
//  { desktop, touch } to say something different on phones.
//  Pip greets every visit until the guide is finished or skipped once;
//  after that, returning visitors get `welcomeBack` instead.
// =====================================================================

export const guide = {
  npcName: 'Pip',

  firstVisit: [
    "Welcome to Okkar's village! I'm Pip. Let me show you around. It only takes a moment.",
    {
      desktop: 'Walk with WASD or the arrow keys, or click where you want to go.',
      touch: 'To walk, touch the map and drag. A circle appears under your finger.',
    },
    {
      desktop: 'When you stand next to something interesting, press E to open it.',
      touch: 'When you stand next to something interesting, a button pops up. Tap it to open.',
    },
    "The House is all about Okkar. The Workshop holds the projects, the notice board lists skills, the market stall covers education, and the mailbox is for getting in touch.",
    'Short on time? Head to the Workshop first. Every project has its own shelf in there.',
    'The Résumé and Contact buttons at the top work from anywhere. The cloud button changes the weather, and the ? button brings me back.',
    "One more thing: there's a fishing spot on the dock by the lake. And if you'd rather read a normal page, choose Plain view at the top.",
  ],

  welcomeBack: 'Welcome back! The Workshop is still up the path to the north-east.',

  // Said (one at a time) when you talk to Pip again later.
  hints: [
    'The Workshop is where the projects are. Each shelf is one project.',
    'Try the fishing dock by the lake. Some fish carry fun facts.',
    "The desk inside Okkar's house has the full story, and the bookshelf lists skills.",
    'Press the cloud button at the top to change the weather.',
    'In a hurry? The Résumé and Contact buttons at the top work from anywhere.',
  ],
}
