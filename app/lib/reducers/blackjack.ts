import { INITIAL_STATE_BLK } from '@/constants/cards';
import { BlackjackStatus } from '@/enums/games';
import { PlayCard, BlackjackState, BlackjackAction } from '@/interfaces/games';
import { drawCard, getHandValue } from '@/lib/utils/cards';

/**
 * Draws cards for the dealer until the hand value reaches 17 or more.
 *
 * @param deck - The current deck (mutated in place)
 * @param hand - The dealer's current hand
 * @returns The dealer's final hand
 */
const dealerPlay = (deck: PlayCard[], hand: PlayCard[]) => {
  let dealerHand = [...hand];
  let dealerTotal = getHandValue(dealerHand);

  while (dealerTotal < 17) {
    const newCard = drawCard(deck);
    dealerHand.push(newCard);
    dealerTotal = getHandValue(dealerHand);
  }

  return dealerHand;
};

/**
 * Derives the current game status from the player and dealer hands.
 *
 * @param playerHand - The player's current hand
 * @param dealerHand - The dealer's current hand
 * @param isWinPending - Whether the game is already in WinPending state (skips re-entering it)
 * @returns The resolved BlackjackStatus
 */
const checkStatus = (
  playerHand: PlayCard[],
  dealerHand: PlayCard[],
  isWinPending?: boolean
): BlackjackStatus => {
  let status = BlackjackStatus.Playing;

  const playerHandValue = getHandValue(playerHand);
  const dealerHandValue = getHandValue(dealerHand);

  const playerHasBlackjack = playerHandValue === 21 && playerHand.length === 2;
  const dealerHasBlackjack = dealerHandValue === 21 && dealerHand.length === 2;
  const playerHasRegular21 = playerHandValue === 21 && playerHand.length > 2;

  if (playerHasBlackjack && dealerHasBlackjack) {
    status = BlackjackStatus.Push;
  } else if (playerHasBlackjack) {
    status = BlackjackStatus.Blackjack;
  } else if (dealerHasBlackjack) {
    status = BlackjackStatus.Lose;
  } else if (playerHandValue > 21) {
    status = BlackjackStatus.Bust;
  } else if (playerHasRegular21 && !isWinPending) {
    status = BlackjackStatus.WinPending;
  } else if (dealerHandValue > 21) {
    status = BlackjackStatus.DealerBust;
  } else if (dealerHandValue >= 17 && dealerHandValue > playerHandValue) {
    status = BlackjackStatus.Lose;
  } else if (dealerHandValue >= 17 && playerHandValue > dealerHandValue) {
    status = BlackjackStatus.Win;
  } else if (dealerHandValue >= 17 && dealerHandValue === playerHandValue) {
    status = BlackjackStatus.Push;
  }

  return status;
};

/**
 * Reducer for Blackjack game state.
 * Handles betting, dealing, hitting, standing, doubling down, and resetting.
 *
 * @param state - The current Blackjack state
 * @param action - The dispatched action
 * @returns The next Blackjack state
 */
export const blackjackReducer = (
  state: BlackjackState,
  action: BlackjackAction
): BlackjackState => {
  switch (action.type) {
    case 'BET_UPDATE':
      return {
        ...state,
        bet: action.payload,
      };

    case 'GAME_START':
      const deck: PlayCard[] = [...action.payload.deck];

      const playerHand = [drawCard(deck), drawCard(deck)];
      const dealerHand = [drawCard(deck)];

      return {
        ...state,
        bet: action.payload.bet,
        deck: deck,
        double: false,
        playerHand: playerHand,
        dealerHand: dealerHand,
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: checkStatus(
          state.playerHand,
          state.dealerHand,
          state.status === BlackjackStatus.WinPending
        ),
      };

    case 'DOUBLE':
      if (state.deck.length === 0 || !state.bet) return state;

      const copyDeck = [...state.deck];
      const newPlayerHand = [...state.playerHand, drawCard(copyDeck)];

      const playerHandValue = getHandValue(newPlayerHand);

      const newDealerHand =
        playerHandValue < 21
          ? dealerPlay(copyDeck, [...state.dealerHand])
          : [...state.dealerHand];

      return {
        ...state,
        deck: copyDeck,
        double: true,
        dealerHand: newDealerHand,
        playerHand: newPlayerHand,
      };

    case 'HIT':
      if (state.deck.length === 0) return state;

      const updatedDeck = [...state.deck];
      const updatedPlayerHand = [...state.playerHand, drawCard(updatedDeck)];

      return {
        ...state,
        deck: updatedDeck,
        playerHand: updatedPlayerHand,
      };

    case 'STAND':
      const currentDeck = [...state.deck];
      const updatedDealerHand = dealerPlay(currentDeck, [...state.dealerHand]);

      return {
        ...state,
        deck: currentDeck,
        dealerHand: updatedDealerHand,
      };

    case 'GAME_RESET':
      return {
        ...INITIAL_STATE_BLK,
        bet: state.bet,
      };

    default:
      return state;
  }
};
