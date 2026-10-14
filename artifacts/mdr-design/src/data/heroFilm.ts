const assetBase = `${import.meta.env.BASE_URL}api/studio-media/`;

export const heroFilm = {
  video: `${assetBase}mdr-street-film-891bf80b3671.mp4`,
  webm: `${assetBase}mdr-street-film-2217dd9d654c.webm`,
  poster: `${assetBase}mdr-street-film-b5436cd0892e.webp`,
  description: 'A man walking through the city smiles at MDR Design on his phone. A bird takes the phone, he jumps and misses, then watches it fly away.',
} as const;
