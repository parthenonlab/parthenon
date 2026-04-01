import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { deleteActiveGame, getActiveGames } from '@/services/games';
import { GameCode } from '@/enums/games';

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

      const games = await deleteActiveGame(id, code as GameCode);
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
