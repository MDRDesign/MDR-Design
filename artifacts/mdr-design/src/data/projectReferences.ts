import { cases } from './cases';

export type ProjectReference = {
  slug: string;
  number: string;
  client: string;
  disciplines: string[];
  year?: string;
  milestone?: string;
  liveUrl: string;
  casePath?: string;
};

/** Public portfolio references. A reference does not imply a published case study. */
export const projectReferences: ProjectReference[] = [
  {
    slug: 'armada-catering',
    number: '01',
    client: 'Armada-Catering',
    disciplines: ['Web Design'],
    year: '2025',
    milestone: 'Built & sold',
    liveUrl: 'https://www.armada-catering.com/',
  },
  ...cases.map(({ slug, number, client, disciplines, year, liveUrl }) => ({
    slug, number, client, disciplines, year, liveUrl, casePath: `/work/${slug}`,
  })),
];
