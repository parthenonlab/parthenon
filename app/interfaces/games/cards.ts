import { CardSize } from '@/enums/games';

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type CardRank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface PlayCard {
  rank: CardRank;
  size: CardSize;
  suit: CardSuit;
}

export interface CardBoxProps extends PlayCard {
  order: number | undefined;
  animate: 'up' | 'down' | undefined;
}

export type CardDeck = PlayCard[];
