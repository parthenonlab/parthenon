import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { deleteCatch } from '@/services/catch';

/**
 * DELETE /api/catches/:id
 * Releases (deletes) a catch belonging to the authenticated user.
 *
 * @returns 204 on success, 404 if not found, or an error response
 */
export const DELETE = withApiAuth<{ id: string }>(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();

      const { id } = await context.params;
      const deleted = await deleteCatch(id, discordId);

      if (!deleted) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json(deleted);
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
