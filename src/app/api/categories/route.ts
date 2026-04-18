import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COLLECTION = 'categories';

export async function GET() {
  const categories = db.find(COLLECTION, (c: any) => c.isActive !== false);
  return NextResponse.json(categories.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = db.create(COLLECTION, { ...data, isActive: true, order: 0 });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
