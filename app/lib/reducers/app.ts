import { ParthenonAction, ParthenonState } from '@/interfaces/context';

export const parthenonReducer = (
  state: ParthenonState,
  action: ParthenonAction
): ParthenonState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        isUserFetched: true,
        user: action.payload,
      };
    default:
      return state;
  }
};
