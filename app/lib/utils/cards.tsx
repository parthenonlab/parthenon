import { CARD_RANKS, CARD_SUITS } from '@/constants/cards';
import { CardSize } from '@/enums/games';
import { CardSuit, PlayCard } from '@/interfaces/games';

import {
  ClubsIcon,
  DiamondsIcon,
  HeartsIcon,
  SpadesIcon,
} from '@/images/icons';

/**
 * Creates a standard 52-card deck containing all ranks across all suits.
 *
 * @returns An ordered array of 52 PlayCard objects
 */
export const createCardDeck = (): PlayCard[] => {
  const deck: PlayCard[] = [];

  CARD_SUITS.forEach(suit => {
    CARD_RANKS.forEach(rank => {
      deck.push({
        rank: rank,
        size: CardSize.Large,
        suit: suit,
      });
    });
  });

  return deck;
};

/**
 * Draws the first card from the deck, removing it in place.
 *
 * @param deck - The deck to draw from (mutated in place)
 * @returns The drawn PlayCard
 */
export const drawCard = (deck: PlayCard[]): PlayCard => {
  const card = deck[0];
  deck.splice(0, 1);

  return card;
};

/**
 * Calculates the total value of a Blackjack hand.
 * Aces start as 11 and are reduced to 1 as needed to avoid busting.
 *
 * @param hand - The array of PlayCards to evaluate
 * @returns The total hand value
 */
export const getHandValue = (hand: PlayCard[]) => {
  let total = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11; // Start with Ace being 11
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      total += 10; // Face cards are worth 10
    } else {
      total += parseInt(card.rank); // Numeric cards
    }
  }

  // Adjust for Aces if total exceeds 21
  while (total > 21 && aces > 0) {
    total -= 10; // Change one Ace from 11 to 1
    aces -= 1;
  }

  return total;
};

/**
 * Returns the SVG icon component for a given card suit.
 *
 * @param suit - The card suit ("clubs" | "diamonds" | "hearts" | "spades")
 * @returns The corresponding suit icon as a React element
 */
export const getSuitSVG = (suit: CardSuit) => {
  switch (suit) {
    case 'clubs':
      return <ClubsIcon />;
    case 'diamonds':
      return <DiamondsIcon />;
    case 'hearts':
      return <HeartsIcon />;
    case 'spades':
      return <SpadesIcon />;
    default:
      return <SpadesIcon />;
  }
};

/**
 * Shuffles a deck in place using the Fisher-Yates algorithm.
 *
 * @param deck - The deck to shuffle (mutated in place)
 * @returns The same deck reference, now shuffled
 */
export const shuffleDeck = (deck: PlayCard[]): PlayCard[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
