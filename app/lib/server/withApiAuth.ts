import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

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
