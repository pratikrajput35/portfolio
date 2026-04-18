import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'testimonials';

export async function GET() {
  const testimonials = db.find(COL, (t: any) => t.isPublished !== false);
  return NextResponse.json(testimonials.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  if (!data.name || !data.content) return NextResponse.json({ error: 'Name and content required' }, { status: 400 });
  const testimonial = db.create(COL, { ...data, isPublished: data.isPublished ?? true });
  return NextResponse.json(testimonial, { status: 201 });
}
