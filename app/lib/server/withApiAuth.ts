import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const withApiAuth = <T extends Record<string, string> = {}>(
  handler: (
    req: NextRequest,
    context: { params: Promise<T> },
  ) => Promise<NextResponse>,
) => {
  return async (req: NextRequest, context: { params: Promise<T> }) => {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    return handler(req, context);
  };
};
