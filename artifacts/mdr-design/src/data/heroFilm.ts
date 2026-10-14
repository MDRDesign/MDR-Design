const assetBase = `${import.meta.env.BASE_URL}api/studio-media/`;

export const heroFilm = {
  video: `${assetBase}mdr-street-film-5457f2e2eb59.mp4`,
  webm: `${assetBase}mdr-street-film-ab27cd02cb66.webm`,
  poster: `${assetBase}mdr-street-film-b5436cd0892e.webp`,
  description: 'A man walking through the city smiles at an MDR Design graphic on his phone. A bird takes the phone, he jumps and misses, then watches it fly away.',
} as const;
