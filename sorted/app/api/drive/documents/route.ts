import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { listCompanyDocumentsFromDrive } from '@/lib/google/drive';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const documents = await listCompanyDocumentsFromDrive();
    return NextResponse.json({ documents, source: 'google_drive' });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to load Drive documents',
        documents: [],
      },
      { status: 502 }
    );
  }
}
