/**
 * CLIENT CONCEPT PREVIEWS — unlisted (noindex, not in nav). Not password protected:
 * anyone with the link can view it, so only include what you're happy to share.
 *
 * Add a preview by appending an object; it becomes available at /preview/<slug>.
 * `images`: paths relative to /public (e.g. 'media/wizfix-mockup.jpg'). Missing
 * files fall back to built-in concept artwork automatically.
 */
export type Preview = {
  slug: string;
  clientName: string;
  businessName: string;
  note: string;
  images: { src: string; caption: string }[];
  liveUrl?: string;
};

export const previews: Preview[] = [
  {
    slug: 'wizfix',
    clientName: 'Joey',
    businessName: 'WizFix Computers',
    note:
      "Joey — here's the redesign direction for WizFix, all in one place. Repair, IT and printing, presented as the established tech business you already are. Take a look, share it with anyone whose opinion matters, and let me know when you're ready to move forward. — Danielle",
    images: [
      { src: 'media/wizfix-mockup.jpg', caption: 'Homepage direction — concept' },
    ],
    liveUrl: 'https://wiz-fix-computers-website.replit.app/',
  },
];

export const getPreview = (slug: string) => previews.find((p) => p.slug === slug);
