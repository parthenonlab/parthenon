import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { loginNotification } from '@/lib/utils';
import { getUser } from '@/services/user';

export const POST = withApiAuth(
  async (
    _request: NextRequest,
    _context: { params: Promise<{}> },
    discordId: string,
  ) => {
    try {
      await connectDatabase();
      const user = await getUser(discordId, 'discord');

      if (user) await loginNotification(user);

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
