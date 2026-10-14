/**
 * CASE STUDY CONTENT — edit freely.
 * - `year`: change to the real launch year.
 * - `results`: placeholders only. Replace `value` with a real, verifiable figure
 *   (or delete the row). Never publish invented numbers.
 * - `quote.isSample`: keep `true` until Joey approves a real quote, then paste his
 *   exact words in `quote.text` and set `isSample: false`.
 */
export type CaseResult = { label: string; value: string | null; note: string };

export type CaseStudy = {
  slug: string;
  number: string;
  client: string;
  location: string;
  disciplines: string[];
  year: string;
  liveUrl: string;
  summary: string;
  quote: { text: string; attribution: string; isSample: boolean };
  heard: { lead: string; points: { title: string; body: string }[] };
  built: { title: string; body: string }[];
  results: CaseResult[];
};

export const cases: CaseStudy[] = [
  {
    slug: 'wizfix',
    number: '01',
    client: 'WizFix Computers',
    location: 'Diamond Bar, CA',
    disciplines: ['Web Design', 'Brand Direction'],
    year: 'Year TBD',
    liveUrl: 'https://wiz-fix-computers-website.replit.app',
    summary:
      'A neighborhood computer repair, IT and printing shop that had earned its reputation in person — and needed a presence that said so before anyone walked in.',
    quote: {
      text: 'People trust us once they’re standing at the counter. I want them to feel that before they ever call.',
      attribution: 'Joey, WizFix Computers',
      isSample: true,
    },
    heard: {
      lead: 'Three businesses under one roof, and a customer who needs to understand all of it in a few seconds.',
      points: [
        { title: 'Clarity', body: 'Repair, IT support and printing were blurred together. Each needed a clear door so customers could find their problem — and the fix — fast.' },
        { title: 'Trust', body: 'Handing over a laptop means handing over your life. The presence had to feel steady, accountable and local, not like a template.' },
        { title: 'Discoverability', body: 'Most customers start with a search like “computer repair near me.” Structure, copy and local signals had to work for them.' },
      ],
    },
    built: [
      { title: 'A calmer brand direction', body: 'A restrained type system and a confident palette that reads “established shop,” not “side hustle.”' },
      { title: 'Service architecture', body: 'Distinct paths for Repair, IT and Printing, each with plain-language explanations and a clear next step.' },
      { title: 'Trust built in', body: 'Hours, location, process and what-to-expect content surfaced where hesitation usually happens.' },
      { title: 'Local search foundations', body: 'Semantic structure, page titles and location cues so Diamond Bar neighbors can actually find the shop.' },
    ],
    results: [
      { label: 'Calls & inquiries', value: null, note: 'To be added once measured' },
      { label: 'Search visibility', value: null, note: 'To be added once measured' },
      { label: 'Owner feedback', value: null, note: 'To be added with permission' },
    ],
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
