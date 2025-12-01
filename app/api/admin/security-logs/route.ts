import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSecurityStats, getRecentLogs, cleanupOldLogs } from '@/lib/login-logger';

// Güvenlik loglarını getir (sadece admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats, recentLogs] = await Promise.all([
      getSecurityStats(),
      getRecentLogs(50),
    ]);

    return NextResponse.json({
      stats,
      recentLogs,
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Eski logları temizle (sadece admin)
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedCount = await cleanupOldLogs(30); // 30 günden eski logları sil

    return NextResponse.json({
      message: `${deletedCount} old logs deleted`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
