import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'blog';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';
  let posts = db.find(COL);
  if (!all) posts = posts.filter((p: any) => p.isPublished);
  return NextResponse.json(posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  if (!data.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  if (!data.slug) data.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (data.isPublished && !data.publishedAt) data.publishedAt = new Date().toISOString();
  const post = db.create(COL, data);
  return NextResponse.json(post, { status: 201 });
}
