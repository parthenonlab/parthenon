import { useCallback, useReducer } from 'react';

import { INITIAL_STATE_BLK } from '@/constants/cards';
import { PlayCard } from '@/interfaces/games';
import { createCardDeck, shuffleDeck } from '@/lib/utils/cards';
import { blackjackReducer } from '@/lib/reducers';

export const useBlackjack = () => {
  const [state, dispatch] = useReducer(blackjackReducer, INITIAL_STATE_BLK);

  const onBetChange = (bet: number | null) => {
    dispatch({ type: 'BET_UPDATE', payload: bet });
  };

  const onReset = () => {
    dispatch({ type: 'GAME_RESET' });
  };

  const onPlay = (bet: number) => {
    const deck: PlayCard[] =
      state.deck.length >= 15
        ? state.deck
        : shuffleDeck(Array.from({ length: 6 }, createCardDeck).flat());
    dispatch({ type: 'GAME_START', payload: { bet, deck } });
  };

  const onSetStatus = useCallback(() => {
    dispatch({ type: 'SET_STATUS' });
  }, []);

  const onDouble = () => {
    dispatch({ type: 'DOUBLE' });
  };

  const onHit = () => {
    dispatch({ type: 'HIT' });
  };

  const onStand = () => {
    dispatch({ type: 'STAND' });
  };

  return {
    ...state,
    onBetChange,
    onDouble,
    onHit,
    onReset,
    onSetStatus,
    onStand,
    onPlay,
  };
};
