import { NextRequest, NextResponse } from 'next/server';
import { getLayers, addLayer, initDb } from '@/lib/db';

initDb();

export async function GET() {
  try {
    const layers = getLayers();
    return NextResponse.json(layers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch layers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, icon, display_order } = await request.json();
    const result = addLayer(name, icon, display_order);
    return NextResponse.json({ id: result.lastInsertRowid, name, icon, display_order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create layer' }, { status: 500 });
  }
}
