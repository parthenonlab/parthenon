import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

import { GameCode } from '@/enums/games';
import { ActiveGame, ActiveGameRequest, BlackjackGameData, WordleGameData } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';
import { ActiveGameModel } from '@/models/game';

import { updateBlackjackGame } from './blackjack';
import { updateWordleGame } from './wordle';
import { UserModel } from '@parthenonlab/models';

const getDiscordId = async () => {
  const user = await currentUser();

  const discordAccount = user?.externalAccounts.find(
    account => account.provider === 'oauth_discord'
  );

  return discordAccount?.providerUserId;
};

export const createActiveGame = async (
  payload: ActiveGameRequest
): Promise<Partial<ActiveGame> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  const key = uuidv4();
  const sessionKey = payload.data.sessionKey!;

  let data: BlackjackGameData | WordleGameData;

  if (payload.code === GameCode.Blackjack) {
    const bet = parseInt(decrypt(sessionKey), 10);

    if (isNaN(bet) || bet <= 0) return null;

    const user = await UserModel.findOne({ discord_id: discordId });
    if (!user || user.cash < bet) return null;

    data = { bet };
  } else if (payload.code === GameCode.Wordle) {
    data = { answer: decrypt(sessionKey), guesses: [] };
  } else {
    return null;
  }

  await ActiveGameModel.findOneAndReplace(
    { discord_id: discordId, code: payload.code },
    { discord_id: discordId, code: payload.code, key, data },
    { upsert: true }
  );

  if (payload.code === GameCode.Blackjack) {
    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: -(data as BlackjackGameData).bet } }
    );
  }

  return { key };
};

export const deleteActiveGame = async (
  id: string,
  code: GameCode
): Promise<Partial<ActiveGame> | null> => {
  const game = await ActiveGameModel.findOneAndDelete({ discord_id: id, code });

  if (!game) return null;
  return { key: game.key };
};

export const getActiveGames = async (id: string): Promise<ActiveGame[]> => {
  const games = await ActiveGameModel.find({ discord_id: id });
  return games.map(game => game.toObject() as ActiveGame);
};

export const updateActiveGame = async (
  payload: ActiveGameRequest
): Promise<Partial<ActiveGame> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  const game = await ActiveGameModel.findOne({
    discord_id: discordId,
    code: payload.code,
  });

  if (!game) return null;
  if (game.key !== payload.key) return null;

  const activeGame = game.toObject() as ActiveGame;

  if (payload.code === GameCode.Blackjack) {
    return updateBlackjackGame(activeGame, discordId, payload);
  } else if (payload.code === GameCode.Wordle) {
    return updateWordleGame(activeGame, discordId, payload);
  } else {
    return null;
  }
};
