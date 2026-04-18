import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const data = await request.json();
  const updated = db.updateById('services', params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  db.deleteById('services', params.id);
  return NextResponse.json({ success: true });
}
