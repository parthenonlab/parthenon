import { Metadata } from 'next';

import { Games } from './games';

export const metadata: Metadata = {
  title: 'Parthenon | Games',
  description:
    'Play a variety of games available on the platform — earn points, compete, and have fun.',
};

const GamesPage = () => <Games />;
export default GamesPage;
