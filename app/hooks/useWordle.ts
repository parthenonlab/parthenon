import { useReducer } from 'react';

import { INITIAL_STATE_WDL } from '@/constants/wordle';
import { wordleReducer } from '@/lib/reducers';

export const useWordle = () => {
  const [state, dispatch] = useReducer(wordleReducer, INITIAL_STATE_WDL);

  const onPlay = () => {
    dispatch({ type: 'play' });
  };

  const onDelete = () => {
    dispatch({ type: 'delete' });
  };

  const onEnter = () => {
    dispatch({ type: 'enter' });
  };

  const onKey = (letter: string) => {
    dispatch({ type: 'key', letter });
  };

  const onReset = () => {
    dispatch({ type: 'reset' });
  };

  const onResume = () => {
    dispatch({ type: 'resume' });
  };

  const onNetworkError = () => {
    dispatch({ type: 'network_error' });
  };

  return {
    ...state,
    onDelete,
    onEnter,
    onKey,
    onNetworkError,
    onPlay,
    onReset,
    onResume,
  };
};
