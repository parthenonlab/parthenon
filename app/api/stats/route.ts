import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createStats, updateStats } from '@/services/stat';
import { GameCode } from '@/enums/games';

const validCodes = Object.values(GameCode);

/**
 * PATCH /api/stats
 * Updates the stats for a given Discord user and game.
 *
 * @param request - The incoming request containing the stats payload
 * @param request.body.code - The game code to update stats for (e.g. GameCode.Wordle)
 * @param request.body.data - The stats data to apply; must include discord_id
 * @param request.body.data.discord_id - The Discord user ID whose stats should be updated
 * @returns The updated stats object, or an error response
 */
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

/**
 * POST /api/stats
 * Creates a new stats document for a Discord user.
 *
 * @param request - The incoming request containing the stats payload
 * @param request.body.discord_id - The Discord user ID to create stats for
 * @returns The created stats object, or an error response
 */
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
