export const SITE = {
  name: 'Roanin Podkin',
  title: 'Roanin Podkin',
  description:
    'Roanin Podkin: sales at Avoca in Santa Barbara, UCSB economics, diver and hiker from Vacaville. Stories, photos and what he is working on now.',
  url: 'https://roaninpodkin.com',
  locale: 'en_US',
  lang: 'en',
  ogImage: '/og-default.png',
  email: 'roaninpodkin@gmail.com',
  linkedin: 'https://www.linkedin.com/in/roanin-podkin-025139285',
  booking: 'https://avoca.chilipiper.com/me/roanin-podkin/meeting-with-roanin',
  avoca: 'https://www.avoca.ai/',
  location: 'Santa Barbara, California',
  jobTitle: 'Sales Development Representative',
  employer: 'Avoca',
  school: 'University of California, Santa Barbara',
} as const;

export const NAV = [
  { label: 'Stories', path: '/stories/' },
  { label: 'Logbook', path: '/logbook/' },
  { label: 'Now', path: '/now/' },
  { label: 'About', path: '/about/' },
] as const;

/** The home page is one long dive. Each stop is a section id, a depth and a label. */
export const DIVE = [
  { id: 'surface', depth: 0, label: 'Surface' },
  { id: 'river', depth: 5, label: 'The river' },
  { id: 'open-water', depth: 12, label: 'Open water' },
  { id: 'islands', depth: 20, label: 'The islands' },
  { id: 'the-deep', depth: 30, label: 'The deep' },
  { id: 'the-floor', depth: 40, label: 'The floor' },
] as const;
