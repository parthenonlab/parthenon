import { Metadata } from 'next';

import { Pokedex } from './pokedex';

export const metadata: Metadata = {
  title: 'Parthenon | Pokédex',
  description: 'Browse and explore the complete Pokédex.',
};

const PokedexPage = () => <Pokedex />;
export default PokedexPage;
