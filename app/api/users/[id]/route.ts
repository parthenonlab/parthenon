import { NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';

import { getUser } from '@/services/user';

/**
 * GET /api/users/:id
 */
export const GET = withApiAuth(
  async (
    request: Request,
    context: { params: Promise<{ id: string }> },
    discordId: string,
  ) => {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') || 'discord';

    if (method !== 'discord' && method !== 'twitch') {
      return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    }

    if (method === 'discord' && id !== discordId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      await connectDatabase();
      const data = await getUser(id, method);

      if (!data)
        return NextResponse.json({ error: 'Not found' }, { status: 404 });

      return NextResponse.json(data);
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
