import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (session) {
    return NextResponse.json(session);
  } else {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
}
