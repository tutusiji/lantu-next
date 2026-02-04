import { NextRequest, NextResponse } from 'next/server';
import { getCategories, addCategory, initDb } from '@/lib/db';

initDb();

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, icon, layer_id, display_order } = await request.json();
    const result = addCategory(name, icon, layer_id, display_order);
    return NextResponse.json({ id: result.lastInsertRowid, name, icon, layer_id, display_order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
