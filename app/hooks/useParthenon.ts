import { useCallback, useContext } from 'react';

import { GameCode } from '@/enums/games';
import { GameObject } from '@/interfaces/games';
import { User } from '@parthenonlab/types';
import { ParthenonContext } from '@/providers/context';

export const useParthenon = () => {
  const context = useContext(ParthenonContext);

  if (context === undefined) {
    throw new Error(
      'useParthenonState must be used within a ParthenonProvider'
    );
  }

  const { state, dispatch } = context;

  const setStateActiveGame = useCallback(
    (code: GameCode, game: Partial<GameObject> | null) => {
      dispatch({
        type: 'SET_ACTIVE_GAME',
        payload: { code, data: game },
      });
    },
    [dispatch]
  );

  const setStateActiveGames = useCallback(
    (games: GameObject[]) => {
      dispatch({
        type: 'SET_ACTIVE_GAMES',
        payload: games,
      });
    },
    [dispatch]
  );

  const setStateUser = useCallback(
    (user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    [dispatch]
  );

  return {
    ...state,
    setStateActiveGame,
    setStateActiveGames,
    setStateUser,
  };
};
