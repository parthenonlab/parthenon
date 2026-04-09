import { Metadata } from 'next';

import { PcBox } from './pc-box';

export const metadata: Metadata = {
  title: 'Parthenon | PC Box',
  description: "Browse your caught Pokémon collection.",
};

const PcBoxPage = () => <PcBox />;
export default PcBoxPage;
