import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { deleteActiveGame, getActiveGames } from '@/services/games';
import { GameCode } from '@/enums/games';
import { GameError } from '@/lib/utils';

/**
 * GET /api/games/:id
 * Returns all active games for a given Discord user.
 *
 * @param _request - The incoming request (unused)
 * @param context.params.id - The Discord user ID to fetch games for
 * @returns An array of active game objects, or an error response
 */
export const GET = withApiAuth(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
    discordId: string,
  ) => {
    const { id } = await context.params;

    if (id !== discordId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      await connectDatabase();

      const games = await getActiveGames(id);
      return NextResponse.json(games);
    } catch (error) {
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
 * DELETE /api/games/:id?code=
 * Deletes an active game for a given Discord user.
 *
 * @param request - The incoming request
 * @param request.url - Must include query param `code` (GameCode)
 * @param context.params.id - The Discord user ID whose game should be deleted
 * @returns The deleted game object, or an error response
 */
export const DELETE = withApiAuth(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
    discordId: string,
  ) => {
    const { id } = await context.params;

    if (id !== discordId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code)
      return NextResponse.json(
        { error: 'Missing required parameter: code' },
        { status: 400 },
      );

    if (!Object.values(GameCode).includes(code as GameCode)) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    try {
      await connectDatabase();

      const game = await deleteActiveGame(id, code as GameCode);
      return NextResponse.json(game);
    } catch (error) {
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
