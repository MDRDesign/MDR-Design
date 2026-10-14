import { cases } from './cases';

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
};

/** Public portfolio references. A reference does not imply a published case study. */
export const projectReferences: ProjectReference[] = [
  ...cases.map(({ slug, number, client, disciplines, year, milestone, liveUrl }) => ({
    slug, number, client, disciplines, year, milestone, liveUrl, casePath: `/work/${slug}`,
  })),
  {
    slug: 'captains-coffee-roasting',
    number: '02',
    client: 'Captain’s Coffee Roasting',
    description: 'Premium coffee roasting subscription.',
    disciplines: ['Web Design'],
    year: '2025',
    liveUrl: 'https://captainscoffeeroasting.com/',
  },
  {
    slug: 'captains-galley',
    number: '04',
    client: 'Captain’s Galley',
    description: 'An app for ordering local food ahead for pickup.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://captainsgalley.org/',
  },
  {
    slug: 'z-delivery',
    number: '05',
    client: 'Z-Delivery',
    description: 'Delivery quoting and scheduling for staff.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://z-delivery.lovable.app/',
  },
  {
    slug: 'prime-your-move',
    number: '06',
    client: 'Prime Your Move',
    description: 'Workout and health tracking for people over 40.',
    disciplines: ['Web Design', 'Web App', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://prime-your-move.replit.app/',
  },
].sort((a, b) => Number(a.number) - Number(b.number));
