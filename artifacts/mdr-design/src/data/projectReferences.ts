import { cases } from './cases';

export type ProjectReference = {
  slug: string;
  number: string;
  client: string;
  disciplines: string[];
  year?: string;
  liveUrl: string;
  casePath?: string;
};

/** Public portfolio references. A reference does not imply a published case study. */
export const projectReferences: ProjectReference[] = [
  ...cases.map(({ slug, number, client, disciplines, year, liveUrl }) => ({
    slug, number, client, disciplines, year, liveUrl, casePath: `/work/${slug}`,
  })),
  {
    slug: 'armada-catering',
    number: '02',
    client: 'Armada-Catering',
    disciplines: ['Web Design'],
    liveUrl: 'https://www.armada-catering.com/',
  },
];
