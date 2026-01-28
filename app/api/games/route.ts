import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createActiveGame, updateActiveGame } from '@/services/games';

export const PATCH = withApiAuth(
  async (request: NextRequest, _context: { params: Promise<{}> }) => {
    try {
      await connectDatabase();

      const payload = await request.json();
      const game = await updateActiveGame(payload);

      return NextResponse.json(game);
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  },
);

export const POST = withApiAuth(
  async (request: NextRequest, _context: { params: Promise<{}> }) => {
    try {
      await connectDatabase();

      const payload = await request.json();
      const game = await createActiveGame(payload);

      return NextResponse.json(game, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  },
);
