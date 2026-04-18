import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const post = db.findOne('blog', (p: any) => p.slug === params.slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const post = db.findOne<any>('blog', (p: any) => p.slug === params.slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = await request.json();
  const updated = db.updateById('blog', post._id, data);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  const post = db.findOne<any>('blog', (p: any) => p.slug === params.slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.deleteById('blog', post._id);
  return NextResponse.json({ success: true });
}
