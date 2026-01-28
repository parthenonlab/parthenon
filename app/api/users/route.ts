import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { attemptUserMerge } from '@/services/user';

export const POST = withApiAuth(
  async (request: NextRequest, _context: { params: Promise<{}> }) => {
    try {
      await connectDatabase();

      const payload = await request.json();
      const user = await attemptUserMerge(payload);

      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  },
);
