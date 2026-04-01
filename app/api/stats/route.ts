import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createStats, updateStats } from '@/services/stat';
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

      const { code, data } = await request.json();

      if (
        !validCodes.includes(code) ||
        typeof data?.discord_id !== 'string' ||
        !data.discord_id
      ) {
        return NextResponse.json(
          { error: 'code and data.discord_id are required' },
          { status: 400 },
        );
      }

      const stats = await updateStats(code, data);

      return NextResponse.json(stats);
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

export const POST = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    _discordId: string,
  ) => {
    try {
      await connectDatabase();

      const payload = await request.json();

      if (typeof payload?.discord_id !== 'string' || !payload.discord_id) {
        return NextResponse.json(
          { error: 'discord_id is required' },
          { status: 400 },
        );
      }

      const stats = await createStats(payload);

      return NextResponse.json(stats, { status: 201 });
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
