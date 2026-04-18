import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'projects';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  const featured = searchParams.get('featured');
  const limitParam = searchParams.get('limit');
  const allParam = searchParams.get('all');
  const limit = limitParam ? parseInt(limitParam) : 0;

  let projects = db.find(COL);

  // Join category name
  const categories = db.find('categories');
  projects = projects.map((p: any) => ({
    ...p,
    category: categories.find((c: any) => c._id === p.category) || p.category,
  }));

  if (categoryId) projects = projects.filter((p: any) => {
    const catId = typeof p.category === 'object' ? p.category?._id : p.category;
    return catId === categoryId;
  });
  if (featured === 'true') projects = projects.filter((p: any) => p.isFeatured);
  
  if (allParam !== 'true') {
    projects = projects.filter((p: any) => p.isPublished !== false);
  }
  
  projects = projects.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  if (limit > 0) projects = projects.slice(0, limit);

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const project = db.create(COL, { ...data, isPublished: data.isPublished ?? true });
    return NextResponse.json(project, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
