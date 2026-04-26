import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { getCatches } from '@/services/catch';

/**
 * GET /api/catches
 * Returns all catches for the authenticated Discord user.
 *
 * @returns An array of Catch objects, or an error response
 */
export const GET = withApiAuth(
  async (
    _request: NextRequest,
    _context: { params: Promise<{}> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();

      const catches = await getCatches(discordId);

      return NextResponse.json(catches);
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
