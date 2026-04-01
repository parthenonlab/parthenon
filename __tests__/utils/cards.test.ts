import { CardSize } from '@/enums/games';
import { PlayCard } from '@/interfaces/games';
import { createCardDeck, drawCard, getHandValue, shuffleDeck } from '@/lib/utils/cards';

const makeCard = (rank: string, suit = 'hearts'): PlayCard => ({
  rank: rank as PlayCard['rank'],
  suit: suit as PlayCard['suit'],
  size: CardSize.Large,
});

describe('createCardDeck', () => {
  it('creates a 52-card deck', () => {
    expect(createCardDeck()).toHaveLength(52);
  });

  it('contains every rank for every suit', () => {
    const deck = createCardDeck();
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      for (const rank of ranks) {
        expect(deck.some(c => c.suit === suit && c.rank === rank)).toBe(true);
      }
    }
  });

  it('has no duplicate cards', () => {
    const deck = createCardDeck();
    const unique = new Set(deck.map(c => `${c.rank}-${c.suit}`));
    expect(unique.size).toBe(52);
  });
});

describe('drawCard', () => {
  it('returns the first card in the deck', () => {
    const deck = [makeCard('A'), makeCard('K'), makeCard('Q')];
    const card = drawCard(deck);
    expect(card.rank).toBe('A');
  });

  it('removes the drawn card from the deck', () => {
    const deck = [makeCard('A'), makeCard('K'), makeCard('Q')];
    drawCard(deck);
    expect(deck).toHaveLength(2);
    expect(deck[0].rank).toBe('K');
  });
});

describe('getHandValue', () => {
  it('sums numeric cards', () => {
    expect(getHandValue([makeCard('2'), makeCard('3'), makeCard('4')])).toBe(9);
  });

  it('values J, Q, K as 10', () => {
    expect(getHandValue([makeCard('J')])).toBe(10);
    expect(getHandValue([makeCard('Q')])).toBe(10);
    expect(getHandValue([makeCard('K')])).toBe(10);
  });

  it('values ace as 11 when it does not cause a bust', () => {
    expect(getHandValue([makeCard('A'), makeCard('6')])).toBe(17);
  });

  it('adjusts ace from 11 to 1 to avoid a bust', () => {
    expect(getHandValue([makeCard('A'), makeCard('K'), makeCard('5')])).toBe(16);
  });

  it('handles two aces correctly', () => {
    // First ace = 11, second ace = 1 to avoid bust
    expect(getHandValue([makeCard('A'), makeCard('A')])).toBe(12);
  });

  it('returns 21 for a natural blackjack (A + K)', () => {
    expect(getHandValue([makeCard('A'), makeCard('K')])).toBe(21);
  });

  it('returns 0 for an empty hand', () => {
    expect(getHandValue([])).toBe(0);
  });

  it('correctly calculates a busted hand', () => {
    expect(getHandValue([makeCard('K'), makeCard('Q'), makeCard('5')])).toBe(25);
  });
});

describe('shuffleDeck', () => {
  it('returns a deck with the same length', () => {
    const deck = createCardDeck();
    expect(shuffleDeck([...deck])).toHaveLength(52);
  });

  it('contains the same cards after shuffling', () => {
    const deck = createCardDeck();
    const shuffled = shuffleDeck([...deck]);
    const toKey = (c: PlayCard) => `${c.rank}-${c.suit}`;
    const originalKeys = new Set(deck.map(toKey));
    const shuffledKeys = new Set(shuffled.map(toKey));
    expect(shuffledKeys).toEqual(originalKeys);
  });
});
