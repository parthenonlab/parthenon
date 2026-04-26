import { INITIAL_STATE_BLK } from '@/constants/cards';
import { BlackjackStatus, CardSize } from '@/enums/games';
import { BlackjackState, PlayCard } from '@/interfaces/games';
import { blackjackReducer } from '@/lib/reducers/blackjack';
import { getHandValue } from '@/lib/utils/cards';

const makeCard = (rank: string, suit = 'hearts'): PlayCard => ({
  rank: rank as PlayCard['rank'],
  suit: suit as PlayCard['suit'],
  size: CardSize.Large,
});

const makeDeck = (...cards: PlayCard[]): PlayCard[] => [
  ...cards,
  ...Array(52 - cards.length).fill(makeCard('2', 'spades')),
];

const playingState = (
  overrides: Partial<BlackjackState> = {},
): BlackjackState => ({
  ...INITIAL_STATE_BLK,
  status: BlackjackStatus.Playing,
  bet: 100,
  ...overrides,
});

describe('BET_UPDATE', () => {
  it('updates the bet', () => {
    const state = blackjackReducer(INITIAL_STATE_BLK, {
      type: 'BET_UPDATE',
      payload: 250,
    });
    expect(state.bet).toBe(250);
  });

  it('accepts null to clear the bet', () => {
    const state = blackjackReducer(INITIAL_STATE_BLK, {
      type: 'BET_UPDATE',
      payload: null,
    });
    expect(state.bet).toBeNull();
  });
});

describe('GAME_START', () => {
  it('deals 2 cards to the player and 1 to the dealer', () => {
    const deck = makeDeck(makeCard('A'), makeCard('K'), makeCard('5'));
    const state = blackjackReducer(INITIAL_STATE_BLK, {
      type: 'GAME_START',
      payload: { bet: 100, deck },
    });
    expect(state.playerHand).toHaveLength(2);
    expect(state.dealerHand).toHaveLength(1);
  });

  it('deals cards from the front of the deck in order', () => {
    const deck = makeDeck(makeCard('A'), makeCard('K'), makeCard('5'));
    const state = blackjackReducer(INITIAL_STATE_BLK, {
      type: 'GAME_START',
      payload: { bet: 100, deck },
    });
    expect(state.playerHand[0].rank).toBe('A');
    expect(state.playerHand[1].rank).toBe('K');
    expect(state.dealerHand[0].rank).toBe('5');
  });

  it('sets the bet and resets double', () => {
    const deck = makeDeck(makeCard('2'), makeCard('3'), makeCard('4'));
    const state = blackjackReducer(INITIAL_STATE_BLK, {
      type: 'GAME_START',
      payload: { bet: 200, deck },
    });
    expect(state.bet).toBe(200);
    expect(state.double).toBe(false);
  });
});

describe('HIT', () => {
  it('adds a card to the player hand', () => {
    const state = playingState({
      deck: makeDeck(makeCard('7')),
      playerHand: [makeCard('5'), makeCard('6')],
    });
    const result = blackjackReducer(state, { type: 'HIT' });
    expect(result.playerHand).toHaveLength(3);
    expect(result.playerHand[2].rank).toBe('7');
  });

  it('removes the drawn card from the deck', () => {
    const state = playingState({
      deck: makeDeck(makeCard('7')),
      playerHand: [makeCard('5'), makeCard('6')],
    });
    const result = blackjackReducer(state, { type: 'HIT' });
    expect(result.deck).toHaveLength(state.deck.length - 1);
  });

  it('returns state unchanged when deck is empty', () => {
    const state = playingState({
      deck: [],
      playerHand: [makeCard('5'), makeCard('6')],
    });
    const result = blackjackReducer(state, { type: 'HIT' });
    expect(result).toEqual(state);
  });
});

describe('STAND', () => {
  it('dealer draws until reaching 17 or more', () => {
    const state = playingState({
      deck: makeDeck(makeCard('6'), makeCard('6')),
      playerHand: [makeCard('K'), makeCard('8')],
      dealerHand: [makeCard('5')], // 5 → needs to draw
    });
    const result = blackjackReducer(state, { type: 'STAND' });
    expect(getHandValue(result.dealerHand)).toBeGreaterThanOrEqual(17);
  });

  it('dealer does not draw when already at 17 or more', () => {
    const state = playingState({
      deck: makeDeck(makeCard('5')),
      playerHand: [makeCard('K'), makeCard('8')],
      dealerHand: [makeCard('K'), makeCard('7')], // already 17
    });
    const result = blackjackReducer(state, { type: 'STAND' });
    expect(result.dealerHand).toHaveLength(2);
  });
});

describe('DOUBLE', () => {
  it('adds exactly one card to the player hand', () => {
    const state = playingState({
      deck: makeDeck(makeCard('4'), makeCard('9')),
      playerHand: [makeCard('8'), makeCard('7')], // 15
      dealerHand: [makeCard('K')], // 10 — will draw to 19
      bet: 100,
    });
    const result = blackjackReducer(state, { type: 'DOUBLE' });
    expect(result.playerHand).toHaveLength(3);
  });

  it('sets double to true', () => {
    const state = playingState({
      deck: makeDeck(makeCard('4'), makeCard('9')),
      playerHand: [makeCard('8'), makeCard('7')],
      dealerHand: [makeCard('K')],
      bet: 100,
    });
    const result = blackjackReducer(state, { type: 'DOUBLE' });
    expect(result.double).toBe(true);
  });

  it('dealer plays after the player draws when player is under 21', () => {
    const state = playingState({
      deck: makeDeck(makeCard('4'), makeCard('9')),
      playerHand: [makeCard('8'), makeCard('7')], // 15, draws 4 → 19
      dealerHand: [makeCard('K')], // 10, draws 9 → 19 ≥ 17
      bet: 100,
    });
    const result = blackjackReducer(state, { type: 'DOUBLE' });
    expect(result.dealerHand.length).toBeGreaterThan(1);
  });

  it('dealer does not draw when player hits exactly 21 via double', () => {
    const state = playingState({
      deck: makeDeck(makeCard('3')),
      playerHand: [makeCard('A'), makeCard('7')], // 18 → draws 3 → 21
      dealerHand: [makeCard('6')], // 6 — would draw if allowed
      bet: 100,
    });
    const result = blackjackReducer(state, { type: 'DOUBLE' });
    expect(result.dealerHand).toHaveLength(1);
  });

  it('dealer does not draw when player busts via double', () => {
    const state = playingState({
      deck: makeDeck(makeCard('K')),
      playerHand: [makeCard('9'), makeCard('8')], // 17 → draws K → 27
      dealerHand: [makeCard('5')], // 5 — would draw if allowed
      bet: 100,
    });
    const result = blackjackReducer(state, { type: 'DOUBLE' });
    expect(result.dealerHand).toHaveLength(1);
  });

  it('returns state unchanged when deck is empty', () => {
    const state = playingState({
      deck: [],
      playerHand: [makeCard('8'), makeCard('7')],
      bet: 100,
    });
    expect(blackjackReducer(state, { type: 'DOUBLE' })).toEqual(state);
  });

  it('returns state unchanged when bet is null', () => {
    const state = playingState({
      deck: makeDeck(makeCard('4')),
      playerHand: [makeCard('8'), makeCard('7')],
      bet: null,
    });
    expect(blackjackReducer(state, { type: 'DOUBLE' })).toEqual(state);
  });
});

describe('GAME_RESET', () => {
  it('resets state to initial values', () => {
    const state = playingState({ playerHand: [makeCard('A'), makeCard('K')] });
    const result = blackjackReducer(state, { type: 'GAME_RESET' });
    expect(result.playerHand).toHaveLength(0);
    expect(result.dealerHand).toHaveLength(0);
    expect(result.status).toBe(BlackjackStatus.Standby);
    expect(result.double).toBe(false);
  });

  it('preserves the current bet', () => {
    const state = playingState({ bet: 500 });
    const result = blackjackReducer(state, { type: 'GAME_RESET' });
    expect(result.bet).toBe(500);
  });
});

describe('SET_STATUS', () => {
  it('returns Blackjack when player has 21 with 2 cards and dealer does not', () => {
    const state = playingState({
      playerHand: [makeCard('A'), makeCard('K')],
      dealerHand: [makeCard('5')],
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Blackjack,
    );
  });

  it('returns Push when both player and dealer have blackjack', () => {
    const state = playingState({
      playerHand: [makeCard('A'), makeCard('K')],
      dealerHand: [makeCard('A'), makeCard('Q')],
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Push,
    );
  });

  it('returns Bust when player exceeds 21', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('Q'), makeCard('5')],
      dealerHand: [makeCard('7')],
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Bust,
    );
  });

  it('returns Lose when dealer has blackjack and player does not', () => {
    const state = playingState({
      playerHand: [makeCard('9'), makeCard('8')],
      dealerHand: [makeCard('A'), makeCard('K')],
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Lose,
    );
  });

  it('returns Win when dealer >= 17 and player has higher total', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('9')], // 19
      dealerHand: [makeCard('K'), makeCard('8')], // 18
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Win,
    );
  });

  it('returns Lose when dealer >= 17 and dealer has higher total', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('8')], // 18
      dealerHand: [makeCard('K'), makeCard('9')], // 19
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Lose,
    );
  });

  it('returns Push when dealer >= 17 and totals are equal', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('8')], // 18
      dealerHand: [makeCard('K'), makeCard('8')], // 18
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Push,
    );
  });

  it('returns DealerBust when dealer exceeds 21', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('8')], // 18
      dealerHand: [makeCard('K'), makeCard('Q'), makeCard('5')], // 25
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.DealerBust,
    );
  });

  it('returns WinPending when player hits 21 with 3+ cards and game is still active', () => {
    const state = playingState({
      playerHand: [makeCard('7'), makeCard('7'), makeCard('7')], // 21
      dealerHand: [makeCard('5')],
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.WinPending,
    );
  });

  it('resolves WinPending to a final status after dealer plays', () => {
    const state = playingState({
      status: BlackjackStatus.WinPending,
      playerHand: [makeCard('7'), makeCard('7'), makeCard('7')], // 21
      dealerHand: [makeCard('K'), makeCard('8')], // 18 — player wins
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Win,
    );
  });

  it('returns Playing when dealer is below 17 and no terminal condition is met', () => {
    const state = playingState({
      playerHand: [makeCard('K'), makeCard('8')], // 18
      dealerHand: [makeCard('6')], // 6 — still drawing
    });
    expect(blackjackReducer(state, { type: 'SET_STATUS' }).status).toBe(
      BlackjackStatus.Playing,
    );
  });
});
