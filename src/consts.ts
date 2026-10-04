export const SITE = {
  name: 'Roanin Podkin',
  title: 'Roanin Podkin',
  description:
    'Roanin Podkin: sales development at Avoca in Santa Barbara, UCSB economics, from Vacaville. The story as islands, what he is working on now, and photos from the road.',
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

/** The home page is one dive. Each stop is a section id, its depth in metres, and a label. */
export const DIVE = [
  { id: 'surface', depth: 0, label: 'Surface' },
  { id: 'islands', depth: 10, label: 'The islands' },
  { id: 'now', depth: 24, label: 'Now' },
  { id: 'voices', depth: 32, label: 'What people say' },
  { id: 'floor', depth: 40, label: 'The floor' },
] as const;
