import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'services';

export async function GET() {
  const services = db.find(COL, (s: any) => s.isPublished !== false);
  return NextResponse.json(services.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const service = db.create(COL, { ...data, isPublished: data.isPublished ?? true });
  return NextResponse.json(service, { status: 201 });
}
