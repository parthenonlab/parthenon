import { GameCode } from '@/enums/games';
import { ParthenonAction, ParthenonState } from '@/interfaces/context';
import { GameObject } from '@/interfaces/games';

/**
 * Reducer for global Parthenon app state.
 * Handles active games, modal visibility, stats, and the current user.
 *
 * @param state - The current app state
 * @param action - The dispatched action
 * @returns The next app state
 */
export const parthenonReducer = (
  state: ParthenonState,
  action: ParthenonAction
): ParthenonState => {
  switch (action.type) {
    case 'SET_ACTIVE_GAME':
      return {
        ...state,
        activeGames: {
          ...state.activeGames,
          [action.payload.code]: action.payload.data,
        },
      };
    case 'SET_ACTIVE_GAMES':
      const updatedActiveGames: Partial<Record<GameCode, GameObject>> = {};

      action.payload.forEach(game => {
        updatedActiveGames[game.code] = game;
      });

      return {
        ...state,
        activeGames: updatedActiveGames,
        isActiveGamesFetched: true,
      };
    case 'SET_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          ...action.payload,
        },
      };
    case 'SET_STATS':
      return {
        ...state,
        isStatsFetched: true,
        stats: action.payload,
      };
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
