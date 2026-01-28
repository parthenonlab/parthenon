import { NextRequest, NextResponse } from 'next/server';

import { connectDatabase } from '@/lib/database';
import { withApiAuth } from '@/lib/server';
import { createStats, updateStats } from '@/services/stat';

export const PATCH = withApiAuth(
  async (request: NextRequest, _context: { params: Promise<{}> }) => {
    try {
      await connectDatabase();

      const { code, data } = await request.json();
      const stats = await updateStats(code, data);

      return NextResponse.json(stats);
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
      const stats = await createStats(payload);

      return NextResponse.json(stats, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  },
);
