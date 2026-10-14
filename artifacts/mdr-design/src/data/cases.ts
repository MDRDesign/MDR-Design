/**
 * CASE STUDY CONTENT — edit freely.
 * - `year`: change to the real launch year.
 * - `results`: placeholders only. Replace `value` with a real, verifiable figure
 *   (or delete the row). Never publish invented numbers.
 * - `quote`: hidden until `text` contains the client's approved words and `isSample`
 *   is false. Never insert an unapproved testimonial.
 */
export type CaseResult = { label: string; value: string | null; note: string };

export type CaseStudy = {
  slug: string;
  number: string;
  client: string;
  location: string;
  disciplines: string[];
  year: string;
  milestone?: string;
  liveUrl: string;
  summary: string;
  needed: { statement: string; supporting: string };
  quote: { text: string; attribution: string; isSample: boolean };
  heard: { lead: string; points: { title: string; body: string }[] };
  built: { title: string; body: string }[];
  results: CaseResult[];
};

export const cases: CaseStudy[] = [
  {
    slug: 'armada-catering',
    number: '01',
    client: 'Armada-Catering',
    location: 'Southern California',
    disciplines: ['Web Design', 'Brand Direction'],
    year: '2025',
    milestone: 'Built & sold',
    liveUrl: 'https://www.armada-catering.com/',
    summary:
      'A small Southern California catering company looking for a fresh direction for its branding and networking — and a website that could introduce the business with confidence.',
    needed: {
      statement: 'A fresh brand direction, and a better way to make new connections.',
      supporting: 'Armada needed a presence that felt considered, communicated its catering experience clearly, and was easy to share with prospective clients and collaborators.',
    },
    quote: { text: '', attribution: 'Armada-Catering', isSample: true },
    heard: {
      lead: 'The brief was about more than a new look. It was about making a small business easier to understand, remember and recommend.',
      points: [
        { title: 'Positioning', body: 'The personal, chef-led approach needed to come through before someone reached an inquiry form.' },
        { title: 'Recognition', body: 'The brand needed a consistent direction that felt distinctive and appropriate for intimate, considered events.' },
        { title: 'Connections', body: 'A clear website could support introductions and referrals by giving clients and collaborators one useful place to learn about Armada and get in touch.' },
      ],
    },
    built: [
      { title: 'A coastal-inspired brand direction', body: 'Deep coastal tones, warm ivory and brass-colored details frame a refined, welcoming identity. Serif typography gives the experience a considered character.' },
      { title: 'A clearer service story', body: 'The published website introduces private-chef experiences, private dinners, wine pairings and celebrations, helping visitors understand what Armada offers.' },
      { title: 'A home for introductions', body: 'A shareable website brings the company’s story, events and cuisine together, supporting the conversations and referrals that matter to a small catering business.' },
      { title: 'A direct next step', body: 'A prominent “Plan Your Event” invitation and inquiry path give interested visitors a clear way to begin a conversation.' },
    ],
    results: [
      { label: 'Event inquiries', value: null, note: 'To be added once measured' },
      { label: 'Referral activity', value: null, note: 'To be added once measured' },
    ],
  },
  {
    slug: 'wizfix',
    number: '02',
    client: 'WizFix Computers',
    location: 'Diamond Bar, CA',
    disciplines: ['Web Design', 'Brand Direction'],
    year: '2026',
    liveUrl: 'https://wiz-fix-computers-website.replit.app/',
    summary:
      'A neighborhood computer repair, IT and printing shop that had earned its reputation in person — and needed a presence that said so before anyone walked in.',
    needed: {
      statement: 'A major redesign — one that finally looks like it belongs in the tech industry.',
      supporting: 'WizFix had the expertise. The brand needed to look as capable as the people behind the counter.',
    },
    quote: {
      text: '',
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
