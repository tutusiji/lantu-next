import { NextRequest, NextResponse } from 'next/server';
import { getTechItems, addTechItem, updateTechItem, deleteTechItem, initDb } from '@/lib/db';

// 初始化数据库
initDb();

export async function GET() {
  try {
    const items = getTechItems();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tech items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = addTechItem(data);
    return NextResponse.json({ id: result.lastInsertRowid, ...data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tech item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    updateTechItem(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tech item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    deleteTechItem(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tech item' }, { status: 500 });
  }
}
