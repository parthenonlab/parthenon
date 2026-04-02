import { GameCode } from '@/enums/games';
import { GameObject } from '@/interfaces/games';
import { ModalState } from '@/interfaces/modal';
import { User } from '@parthenonlab/types';

export interface ParthenonState {
  activeGames: Partial<Record<GameCode, GameObject>> | null;
  isActiveGamesFetched: boolean;
  isUserFetched: boolean;
  modal: ModalState;
  user: User | null;
}

export type ParthenonAction =
  | {
      type: 'SET_ACTIVE_GAME';
      payload: { code: GameCode; data: Partial<GameObject> | null };
    }
  | { type: 'SET_ACTIVE_GAMES'; payload: GameObject[] }
  | { type: 'SET_MODAL'; payload: Partial<ModalState> }
  | { type: 'SET_USER'; payload: User | null };

export interface ParthenonContextType {
  state: ParthenonState;
  dispatch: React.Dispatch<ParthenonAction>;
}
