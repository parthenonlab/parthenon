import { v4 as uuidv4 } from 'uuid';

import { GameCode } from '@/enums/games';

import {
  ActiveGame,
  ActiveGameRequest,
  ActiveGameResult,
  BlackjackGameData,
  WordleGameData,
} from '@/interfaces/games';

import { decrypt, GameError } from '@/lib/utils';
import { ActiveGameModel } from '@/models/game';
import { addCash, deductCash } from '@/services/user';

import { updateBlackjackGame } from './blackjack';
import { updateWordleGame } from './wordle';

export const createActiveGame = async (
  payload: ActiveGameRequest,
  discordId: string,
): Promise<Partial<ActiveGame>> => {
  const key = uuidv4();
  const sessionKey = payload.data.sessionKey!;

  if (payload.code === GameCode.Wordle) {
    const data: WordleGameData = { answer: decrypt(sessionKey), guesses: [] };

    await ActiveGameModel.findOneAndReplace(
      { discord_id: discordId, code: payload.code },
      { discord_id: discordId, code: payload.code, key, data },
      { upsert: true },
    );

    return { key };
  }

  if (payload.code === GameCode.Blackjack) {
    const bet = parseInt(decrypt(sessionKey), 10);
    if (isNaN(bet) || bet <= 0) throw new GameError('Invalid bet');

    const deducted = await deductCash(discordId, bet);
    if (!deducted) throw new GameError('Insufficient funds', 422);

    const data: BlackjackGameData = { bet };

    try {
      await ActiveGameModel.findOneAndReplace(
        { discord_id: discordId, code: payload.code },
        { discord_id: discordId, code: payload.code, key, data },
        { upsert: true },
      );
    } catch (error) {
      await addCash(discordId, bet);
      throw error;
    }

    return { key };
  }

  throw new GameError('Unknown game code');
};

export const deleteActiveGame = async (
  id: string,
  code: GameCode,
): Promise<Partial<ActiveGame>> => {
  const game = await ActiveGameModel.findOneAndDelete({ discord_id: id, code });

  if (!game) throw new GameError('Game not found', 404);
  return { key: game.key };
};

export const getActiveGames = async (id: string): Promise<ActiveGame[]> => {
  const games = await ActiveGameModel.find({ discord_id: id });
  return games.map(game => game.toObject() as ActiveGame);
};

export const updateActiveGame = async (
  payload: ActiveGameRequest,
  discordId: string,
): Promise<ActiveGameResult> => {
  const game = await ActiveGameModel.findOne({
    discord_id: discordId,
    code: payload.code,
  });

  if (!game) throw new GameError('Game not found', 404);
  if (game.key !== payload.key) throw new GameError('Invalid session key', 409);

  const activeGame = game.toObject() as ActiveGame;

  if (payload.code === GameCode.Blackjack) {
    return updateBlackjackGame(activeGame, discordId, payload);
  } else if (payload.code === GameCode.Wordle) {
    return updateWordleGame(activeGame, discordId, payload);
  }

  throw new GameError('Unknown game code');
};
