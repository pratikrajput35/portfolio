import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const contacts = db.find('contacts');
  return NextResponse.json(contacts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}
