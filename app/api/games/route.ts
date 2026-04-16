import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createActiveGame, updateActiveGame } from '@/services/games';
import { DecryptionError, GameError } from '@/lib/utils';
import { GameCode } from '@/enums/games';

const validCodes = Object.values(GameCode);

/**
 * PATCH /api/games
 * Updates an active game for the authenticated user.
 *
 * @param request - The incoming request containing the game payload
 * @param request.body.code - The game code (e.g. GameCode.Blackjack)
 * @param request.body.key - The current game session key
 * @param request.body.data.sessionCode - Encrypted action data for the game update
 * @returns The updated game object, or an error response
 */
export const PATCH = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();

      const payload = await request.json();

      if (
        !validCodes.includes(payload?.code) ||
        typeof payload?.key !== 'string' ||
        !payload.key ||
        typeof payload?.data?.sessionCode !== 'string' ||
        !payload.data.sessionCode
      ) {
        return NextResponse.json(
          { error: 'code, key, and data.sessionCode are required' },
          { status: 400 },
        );
      }

      const game = await updateActiveGame(payload, discordId);

      return NextResponse.json(game);
    } catch (error) {
      if (error instanceof DecryptionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error instanceof GameError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/games
 * Creates a new active game for the authenticated user.
 *
 * @param request - The incoming request containing the game payload
 * @param request.body.code - The game code (e.g. GameCode.Blackjack)
 * @param request.body.data.sessionKey - Encrypted session key for the new game (e.g. encrypted bet)
 * @returns The created game object with its session key, or an error response
 */
export const POST = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();

      const payload = await request.json();

      if (
        !validCodes.includes(payload?.code) ||
        typeof payload?.data?.sessionKey !== 'string' ||
        !payload.data.sessionKey
      ) {
        return NextResponse.json(
          { error: 'code and data.sessionKey are required' },
          { status: 400 },
        );
      }

      const game = await createActiveGame(payload, discordId);

      return NextResponse.json(game, { status: 201 });
    } catch (error) {
      if (error instanceof DecryptionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error instanceof GameError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 },
      );
    }
  },
);
