import { POKEMON_NAME_MAP } from '@/constants/pokemon';

/**
 * Formats a PokéAPI Pokémon name for display.
 * Applies known overrides for names that require special characters or punctuation
 * (e.g. "nidoran-f" → "Nidoran ♀", "mr-mime" → "Mr. Mime"),
 * and falls back to title-casing hyphenated names.
 *
 * @param name - The raw Pokémon name from the PokéAPI (e.g. "mr-mime")
 * @returns The formatted display name
 */
export const formatPokemonName = (name: string) =>
  POKEMON_NAME_MAP[name] ??
  name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
