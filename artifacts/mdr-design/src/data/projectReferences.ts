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
  ...cases.map(({ slug, number, client, disciplines, year, milestone, liveUrl }) => ({
    slug, number, client, disciplines, year, milestone, liveUrl, casePath: `/work/${slug}`,
  })),
];
