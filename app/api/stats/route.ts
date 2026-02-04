import { NextResponse } from 'next/server';
import { getStats, initDb } from '@/lib/db';

initDb();

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: message }, { status: 500 });
  }
}
