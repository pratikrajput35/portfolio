import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const category = db.findById('categories', params.id);
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const data = await request.json();
  const updated = db.updateById('categories', params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = db.deleteById('categories', params.id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
