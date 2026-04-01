import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

import { GameCode } from '@/enums/games';
import { GameObject, LeanGameDocument } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';
import { GameModel } from '@/models/game';

import { updateBlackjackGame } from './blackjack';
import { updateWordleGame } from './wordle';
import { UserModel } from '@parthenonlab/models';

const getDiscordId = async () => {
  const user = await currentUser();

  const discordAccount = user?.externalAccounts.find(
    account => account.provider === 'oauth_discord'
  );

  return discordAccount?.externalId;
};

/**
 * createActiveGame
 * This creates a new Game Document
 */
export const createActiveGame = async (
  payload: Partial<GameObject>
): Promise<Partial<GameObject> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  await GameModel.findOneAndDelete({
    discord_id: discordId,
    code: payload.code,
  });

  const updatedKey = uuidv4();
  const sessionKey = payload.data!.sessionKey as string;

  let gameData: Partial<GameObject> = {};

  if (payload.code === GameCode.Blackjack) {
    const betString = decrypt(sessionKey);
    const bet = parseInt(betString, 10);

    gameData = {
      data: {
        bet,
      },
    };

    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: -bet } }
    );
  } else if (payload.code === GameCode.Wordle) {
    gameData = {
      data: {
        answer: decrypt(sessionKey),
        guesses: [],
      },
    };
  }

  await GameModel.create({
    discord_id: discordId,
    key: updatedKey,
    code: payload.code,
    ...gameData,
  });

  return { key: updatedKey };
};

/**
 * deleteActiveGame
 * This deletes Game document by Discord ID
 * @returns The deleted Game document or NULL
 */
export const deleteActiveGame = async (
  id: string,
  code: GameCode
): Promise<Partial<GameObject> | null> => {
  const game = await GameModel.findOneAndDelete({
    discord_id: id,
    code,
  }).lean<LeanGameDocument>();

  const { _id, ...rest } = game as LeanGameDocument;
  return { key: rest.key };
};

/**
 * getActiveGames
 * This fetches Game documents by Discord ID
 * @returns The Game documents or NULL
 */
export const getActiveGames = async (
  id: string
): Promise<GameObject[] | null> => {
  const games = await GameModel.find({
    discord_id: id,
  }).lean<LeanGameDocument[]>();

  const activeGames = games.map((game: GameObject) => {
    const { _id, ...rest } = game as LeanGameDocument;
    return rest;
  });

  return activeGames;
};

/**
 * updateActiveGame
 * This updates a Game Document
 */
export const updateActiveGame = async (
  payload: GameObject
): Promise<Partial<GameObject> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  const game = await GameModel.findOne({
    discord_id: discordId,
    code: payload.code,
  }).lean<LeanGameDocument>();

  if (!game) return null;
  if (game.key !== payload.key) return null;

  const { _id, ...rest } = game as LeanGameDocument;

  if (payload.code === GameCode.Blackjack) {
    return updateBlackjackGame(rest, discordId, payload);
  } else if (payload.code === GameCode.Wordle) {
    return updateWordleGame(rest, discordId, payload);
  } else {
    return null;
  }
};
