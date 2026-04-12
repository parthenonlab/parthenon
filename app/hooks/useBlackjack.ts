'use client';

import { useCallback, useReducer } from 'react';

import { INITIAL_STATE_BLK } from '@/constants/cards';
import { PlayCard } from '@/interfaces/games';
import { createCardDeck, shuffleDeck } from '@/lib/utils/cards';
import { blackjackReducer } from '@/lib/reducers';

export const useBlackjack = () => {
  const [state, dispatch] = useReducer(blackjackReducer, INITIAL_STATE_BLK);

  const onBetChange = useCallback(
    (bet: number | null) => {
      dispatch({ type: 'BET_UPDATE', payload: bet });
    },
    []
  );

  const onReset = useCallback(() => {
    dispatch({ type: 'GAME_RESET' });
  }, []);

  const onPlay = useCallback(
    (bet: number) => {
      const newDeck = createCardDeck();
      const deck: PlayCard[] = shuffleDeck([...newDeck, ...newDeck]);
      dispatch({ type: 'GAME_START', payload: { bet, deck } });
    },
    []
  );

  const onSetStatus = useCallback(() => {
    dispatch({ type: 'SET_STATUS' });
  }, []);

  const onDouble = useCallback(() => {
    dispatch({ type: 'DOUBLE' });
  }, []);

  const onHit = useCallback(() => {
    dispatch({ type: 'HIT' });
  }, []);

  const onStand = useCallback(() => {
    dispatch({ type: 'STAND' });
  }, []);

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
