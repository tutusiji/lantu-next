import { NextRequest, NextResponse } from 'next/server';
import { getLayers, addLayer, updateLayer, deleteLayer, initDb } from '@/lib/db';

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

export async function PUT(request: NextRequest) {
  try {
    const { id, name, icon, display_order } = await request.json();
    updateLayer(id, name, icon, display_order);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update layer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    deleteLayer(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete layer' }, { status: 500 });
  }
}
