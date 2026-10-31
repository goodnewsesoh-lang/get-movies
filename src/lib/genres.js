const ALIASES = {
  'sci-fi': 'Sci-Fi',
  'sci fi': 'Sci-Fi',
  'science fiction': 'Sci-Fi',
};

// Spellings stored in the database that should count as the same genre.
const VARIANTS = {
  'Sci-Fi': ['Sci-Fi', 'Sci-fi', 'Sci Fi', 'Science Fiction'],
};

export function canonicalGenre(name) {
  const trimmed = String(name ?? '').trim();
  return ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

export function genreVariants(name) {
  const canon = canonicalGenre(name);
  return VARIANTS[canon] ?? [canon];
}
