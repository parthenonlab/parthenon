import { User } from '@parthenonlab/types';

export interface ParthenonState {
  isUserFetched: boolean;
  user: User | null;
}

export type ParthenonAction = { type: 'SET_USER'; payload: User | null };

export interface ParthenonContextType {
  state: ParthenonState;
  dispatch: React.Dispatch<ParthenonAction>;
}
