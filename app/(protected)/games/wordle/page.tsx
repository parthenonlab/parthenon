import { Metadata } from 'next';

import { Wordle } from './wordle';

export const metadata: Metadata = {
  title: 'Parthenon | Wordle',
  description:
    'Guess the hidden word within six tries. A word challenge to test your vocabulary and logic!',
};

const WordlePage = () => <Wordle />;
export default WordlePage;
