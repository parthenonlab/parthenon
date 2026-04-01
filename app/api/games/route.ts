import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createActiveGame, updateActiveGame } from '@/services/games';
import { DecryptionError } from '@/lib/utils';
import { GameCode } from '@/enums/games';

const validCodes = Object.values(GameCode);

export const PATCH = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    _discordId: string,
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

      const game = await updateActiveGame(payload);

      return NextResponse.json(game);
    } catch (error) {
      if (error instanceof DecryptionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
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

export const POST = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    _discordId: string,
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

      const game = await createActiveGame(payload);

      return NextResponse.json(game, { status: 201 });
    } catch (error) {
      if (error instanceof DecryptionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
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
