import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const COL = 'projects';

export async function PUT(request: NextRequest) {
  try {
    const { updates } = await request.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    
    updates.forEach(update => {
      if (update.id && update.order !== undefined) {
        db.updateById(COL, update.id, { order: update.order } as any);
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
