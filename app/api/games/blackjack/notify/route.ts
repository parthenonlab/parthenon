import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { blackjackNotification } from '@/lib/utils';
import { getUser } from '@/services/user';

export const POST = withApiAuth(
  async (
    request: NextRequest,
    _context: { params: Promise<{}> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();
      const [user, clerkUser] = await Promise.all([
        getUser(discordId, 'discord'),
        currentUser(),
      ]);
      const { playerTotal, dealerTotal, result, cashDelta } = await request.json();

      if (user)
        await blackjackNotification(
          user,
          playerTotal,
          dealerTotal,
          result,
          cashDelta,
          clerkUser?.imageUrl,
        );

      return NextResponse.json({ success: true });
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
