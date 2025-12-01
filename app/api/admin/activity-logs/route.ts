import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getActivityLogs } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sadece Admin aktivite loglarını görebilir
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const action = searchParams.get('action') as any || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const { logs, total } = await getActivityLogs({
      userId,
      entityType,
      action,
      limit,
      skip,
    });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Activity logs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
