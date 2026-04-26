import { Metadata } from 'next';

import { Blackjack } from './blackjack';

export const metadata: Metadata = {
  title: 'Parthenon | Blackjack',
  description:
    'Play Blackjack against the dealer and earn points for smart bets and big wins!',
};

const BlackjackPage = () => <Blackjack />;
export default BlackjackPage;
