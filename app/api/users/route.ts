import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { mergeNotification } from '@/lib/utils';
import { attemptUserMerge } from '@/services/user';

/**
 * POST /api/users
 * Attempts to merge a Twitch user into an existing Discord user account.
 * If both accounts exist separately, their cash balances are combined and the Twitch document is removed.
 *
 * @param request - The incoming request containing the merge payload
 * @param request.body.discord_id - The Discord user ID
 * @param request.body.twitch_id - The Twitch user ID to merge into the Discord account
 * @returns The merged (or existing) user object, or an error response
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

      if (
        typeof payload?.discord_id !== 'string' ||
        !payload.discord_id ||
        typeof payload?.twitch_id !== 'string' ||
        !payload.twitch_id
      ) {
        return NextResponse.json(
          { error: 'discord_id and twitch_id are required' },
          { status: 400 },
        );
      }

      const { user, merged } = await attemptUserMerge(payload);
      if (user && merged) await mergeNotification(user);

      return NextResponse.json(user);
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
