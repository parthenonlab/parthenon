import { useCallback, useContext } from 'react';

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

  const setStateUser = useCallback(
    (user: User | null) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    [dispatch]
  );

  return {
    ...state,
    setStateUser,
  };
};
