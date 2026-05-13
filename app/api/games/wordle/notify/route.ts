import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { wordleNotification } from '@/lib/utils';
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
      const { answer, guesses, reward } = await request.json();

      if (user) await wordleNotification(user, answer, guesses, reward, clerkUser?.imageUrl);

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
