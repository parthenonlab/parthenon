import { BlackjackStatus } from '@/enums/games';
import { CardDeck, PlayCard } from './cards';

export interface BlackjackState {
  bet: number | null;
  deck: CardDeck;
  double: boolean;
  playerHand: PlayCard[];
  dealerHand: PlayCard[];
  status: BlackjackStatus;
}

export type BlackjackAction =
  | { type: 'BET_UPDATE'; payload: number | null }
  | { type: 'GAME_START'; payload: { bet: number; deck: PlayCard[] } }
  | { type: 'SET_STATUS' }
  | { type: 'DOUBLE' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'GAME_RESET' };
