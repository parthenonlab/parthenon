import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Wraps a Next.js route handler with Clerk authentication and Discord account verification.
 * Resolves the authenticated user's Discord ID and passes it to the handler.
 * Returns 401 if the user is not authenticated or has no linked Discord account.
 *
 * @param handler - The route handler to wrap
 * @param handler.req - The incoming Next.js request
 * @param handler.context - The route context containing dynamic params
 * @param handler.discordId - The authenticated user's Discord provider user ID
 * @returns The wrapped route handler
 */
export const withApiAuth = <T extends Record<string, string> = {}>(
  handler: (
    req: NextRequest,
    context: { params: Promise<T> },
    discordId: string,
  ) => Promise<NextResponse>,
) => {
  return async (req: NextRequest, context: { params: Promise<T> }) => {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const discordAccount = user?.externalAccounts.find(
      account => account.provider === 'oauth_discord',
    );

    if (!discordAccount?.providerUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(req, context, discordAccount.providerUserId);
  };
};
