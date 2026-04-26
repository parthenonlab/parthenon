import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { getStats } from '@/services/stats';

/**
 * GET /api/stats/:id
 * Returns the stats document for a given Discord user.
 *
 * @param _request - The incoming request (unused)
 * @param context.params.id - The Discord user ID to fetch stats for
 * @returns The stats object, or an error response
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

      const stats = await getStats(id);

      if (!stats)
        return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
