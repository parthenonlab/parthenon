import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { unlinkNotification, upgradeNotification } from '@/lib/utils';

import { getUser, unlinkTwitch, upgradeBoxSpace } from '@/services/user';

/**
 * GET /api/users/:id?method=
 * Returns a user by Discord or Twitch ID.
 *
 * @param request - The incoming request
 * @param request.url - Accepts optional query param `method` ("discord" | "twitch"); defaults to "discord"
 * @param context.params.id - The user ID to look up (Discord ID or Twitch ID depending on method)
 * @returns The user object, or an error response
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

/**
 * PATCH /api/users/:id
 * Performs an action on a user. Supports: upgrade_box, unlink_twitch.
 *
 * @param request.body.action - The action to perform
 * @param context.params.id - The Discord user ID
 * @returns The updated fields, or an error response
 */
export const PATCH = withApiAuth(
  async (
    request: Request,
    context: { params: Promise<{ id: string }> },
    discordId: string,
  ) => {
    const { id } = await context.params;

    if (id !== discordId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await request.json();

    try {
      await connectDatabase();
      const clerkUser = await currentUser();

      if (action === 'upgrade_box') {
        const user = await getUser(discordId, 'discord');
        const result = await upgradeBoxSpace(discordId);

        if (!result)
          return NextResponse.json(
            { error: 'Insufficient funds' },
            { status: 400 },
          );

        if (user) {
          const linked = !!(user.discord_id && user.twitch_id);
          const totalSpace = (user.subscriber ? 300 : 30) + (linked ? 50 : 0) + result.box_space;
          await upgradeNotification(user, totalSpace, clerkUser?.imageUrl);
        }
        return NextResponse.json(result);
      }

      if (action === 'unlink_twitch') {
        const user = await getUser(discordId, 'discord');
        await unlinkTwitch(discordId);
        if (user) await unlinkNotification(user, clerkUser?.imageUrl);
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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
