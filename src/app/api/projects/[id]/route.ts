import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'projects';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const project = db.findById(COL, params.id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Populate category
  const categories = db.find('categories');
  const cat = categories.find((c: any) => c._id === (project as any).category);
  return NextResponse.json({ ...(project as any), category: cat || (project as any).category });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const data = await request.json();
  const updated = db.updateById(COL, params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const ok = db.deleteById(COL, params.id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
