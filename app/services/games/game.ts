import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

import { GameCode } from '@/enums/games';
import { GameObject } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';
import { GameModel } from '@/models/game';

import { updateBlackjackGame } from './blackjack';
import { updateWordleGame } from './wordle';
import { UserModel } from '@parthenonlab/models';

/**
 * Retrieves the Discord provider user ID for the currently authenticated Clerk user.
 *
 * @returns The Discord user ID, or undefined if not authenticated or no Discord account is linked
 */
const getDiscordId = async () => {
  const user = await currentUser();

  const discordAccount = user?.externalAccounts.find(
    account => account.provider === 'oauth_discord'
  );

  return discordAccount?.providerUserId;
};

/**
 * Creates a new active game for the authenticated user.
 * For Blackjack, validates the bet and deducts it from the user's balance after the game document is written.
 * For Wordle, decrypts and stores the answer.
 *
 * @param payload - The game payload; must include code and data.sessionKey
 * @returns The new game's session key, or null if unauthenticated, the bet is invalid, or the user has insufficient funds
 */
export const createActiveGame = async (
  payload: Partial<GameObject>
): Promise<Partial<GameObject> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  const updatedKey = uuidv4();
  const sessionKey = payload.data!.sessionKey as string;

  let gameData: Partial<GameObject> = {};

  if (payload.code === GameCode.Blackjack) {
    const betString = decrypt(sessionKey);
    const bet = parseInt(betString, 10);

    if (isNaN(bet) || bet <= 0) return null;

    const user = await UserModel.findOne({ discord_id: discordId });
    if (!user || user.cash < bet) return null;

    gameData = {
      data: {
        bet,
      },
    };
  } else if (payload.code === GameCode.Wordle) {
    gameData = {
      data: {
        answer: decrypt(sessionKey),
        guesses: [],
      },
    };
  }

  await GameModel.findOneAndReplace(
    { discord_id: discordId, code: payload.code },
    { discord_id: discordId, key: updatedKey, code: payload.code, ...gameData },
    { upsert: true }
  );

  if (payload.code === GameCode.Blackjack) {
    const bet = (gameData.data as { bet: number }).bet;
    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: -bet } }
    );
  }

  return { key: updatedKey };
};

/**
 * Deletes an active game document by Discord ID and game code.
 *
 * @param id - The Discord user ID
 * @param code - The game code identifying which game to delete
 * @returns The deleted game's session key, or null if no matching game was found
 */
export const deleteActiveGame = async (
  id: string,
  code: GameCode
): Promise<Partial<GameObject> | null> => {
  const game = await GameModel.findOneAndDelete({ discord_id: id, code });

  if (!game) return null;
  return { key: game.key };
};

/**
 * Fetches all active game documents for a given Discord user.
 *
 * @param id - The Discord user ID
 * @returns An array of GameObject records
 */
export const getActiveGames = async (
  id: string
): Promise<GameObject[] | null> => {
  const games = await GameModel.find({ discord_id: id });
  return games.map(game => game.toObject() as GameObject);
};

/**
 * Updates an active game for the authenticated user.
 * Validates the session key before delegating to the game-specific update handler.
 *
 * @param payload - The game payload; must include code, key, and data.sessionCode
 * @returns The updated game's new session key, or null if unauthenticated, the game is not found, or the key is invalid
 */
export const updateActiveGame = async (
  payload: GameObject
): Promise<Partial<GameObject> | null> => {
  const discordId = await getDiscordId();
  if (!discordId) return null;

  const game = await GameModel.findOne({ discord_id: discordId, code: payload.code });

  if (!game) return null;
  if (game.key !== payload.key) return null;

  const gameObject = game.toObject() as GameObject;

  if (payload.code === GameCode.Blackjack) {
    return updateBlackjackGame(gameObject, discordId, payload);
  } else if (payload.code === GameCode.Wordle) {
    return updateWordleGame(gameObject, discordId, payload);
  } else {
    return null;
  }
};
