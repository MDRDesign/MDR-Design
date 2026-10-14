import { getCase } from './cases';

export type ProjectReference = {
  slug: string;
  number: string;
  client: string;
  description?: string;
  disciplines: string[];
  year?: string;
  milestone?: string;
  liveUrl: string;
  casePath?: string;
  /** Real public capture or owner-provided screen composition, relative to public/ (resolve with mediaUrl). */
  image: string;
  /** Keep multi-screen compositions uncropped in narrower preview frames. */
  imageFit?: 'cover' | 'contain';
  imageAlt: string;
  imageCaption?: string;
};

const fromCase = (slug: string, image: string, imageAlt: string): ProjectReference => {
  const c = getCase(slug)!;
  return {
    slug: c.slug, number: c.number, client: c.client, disciplines: c.disciplines, year: c.year,
    milestone: c.milestone, liveUrl: c.liveUrl, casePath: `/work/${c.slug}`, image, imageAlt,
  };
};

/** Public portfolio references, in display order. A reference does not imply a published case study. */
export const projectReferences: ProjectReference[] = [
  fromCase('armada-catering', 'media/armada-desktop.webp', 'Published Armada-Catering homepage'),
  {
    slug: 'prime-your-move',
    number: '02',
    client: 'Prime Your Move',
    description: 'Workout and health tracking for people over 40.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://prime-your-move.replit.app/',
    image: 'media/prime-your-move-desktop.webp',
    imageAlt: 'Prime Your Move public Progress demo with explicitly labeled sample data',
    imageCaption: 'Public Progress demo — sample data',
  },
  {
    slug: 'captains-coffee-roasting',
    number: '03',
    client: 'Captain’s Coffee Roasting',
    description: 'Premium coffee roasting subscription.',
    disciplines: ['Web Design'],
    year: '2025',
    liveUrl: 'https://captainscoffeeroasting.com/',
    image: 'media/captains-coffee-mobile-overview.webp',
    imageFit: 'contain',
    imageAlt: 'Owner-provided Captain’s Coffee Roasting mobile screenshots showing the homepage, subscription plans and coffee shop',
    imageCaption: 'Owner-provided mobile screens — home, subscriptions and coffee shop',
  },
  {
    slug: 'the-bookends',
    number: '04',
    client: 'The Bookends',
    description: 'A community app for book clubs, schools and literary groups to share books and build together.',
    disciplines: ['Web App'],
    year: '2026',
    liveUrl: 'https://the-bookends.lovable.app/',
    image: 'media/the-bookends-desktop.webp',
    imageAlt: 'The Bookends public homepage, currently branded Shelf Life, with book-sharing, ratings and community browsing',
    imageCaption: 'Published homepage — currently branded Shelf Life',
  },
  {
    slug: 'captains-galley',
    number: '05',
    client: 'Captain’s Galley',
    description: 'An app for ordering local food ahead for pickup.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://captainsgalley.org/',
    casePath: '/work/captains-galley',
    image: 'media/captains-galley-mobile-overview.webp',
    imageFit: 'contain',
    imageAlt: 'Owner-provided Captain’s Galley mobile screenshots showing the homepage and food menu with prices and an Add to Order action',
    imageCaption: 'Owner-provided mobile screens — home and food ordering',
  },
  {
    slug: 'z-delivery',
    number: '06',
    client: 'Z-Delivery',
    description: 'Delivery quoting and scheduling for staff.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://z-delivery.lovable.app/',
    casePath: '/work/z-delivery',
    image: 'media/z-delivery-mobile-overview.webp',
    imageAlt: 'Owner-provided Z-Delivery mobile web app screenshots showing the quote dashboard and pricing with vehicle-fit checks; customer details masked',
    imageCaption: 'Mobile app screens — customer details masked',
  },
  fromCase('wizfix', 'media/wizfix-desktop.webp', 'Published WizFix Computers homepage with computer repair services and the Request service button'),
];
