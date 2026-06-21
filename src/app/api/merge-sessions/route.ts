import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parsePingLog, calculateSessions } from '@/app/lib/sessions';

export const POST = async (req: NextRequest) => {
  try {
    const { person, date, sessionIndex, mergeAll } = await req.json();

    if (!person || !date || (!mergeAll && sessionIndex === undefined)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'check-ins', person, date);
    const content = await readFile(filePath, 'utf-8');
    const entries = parsePingLog(content);
    const { sessions, firstSeen, lastSeen } = calculateSessions(entries);

    let rangeStart: string;
    let rangeEnd: string;

    if (mergeAll) {
      if (sessions.length < 2 || !firstSeen || !lastSeen) {
        return NextResponse.json({ error: 'Nothing to merge' }, { status: 400 });
      }
      rangeStart = firstSeen;
      rangeEnd = lastSeen;
    } else {
      if (sessionIndex < 0 || sessionIndex >= sessions.length - 1) {
        return NextResponse.json({ error: 'Invalid session index' }, { status: 400 });
      }

      const session1 = sessions[sessionIndex];
      const session2 = sessions[sessionIndex + 1];

      if (!session1.end || !session2.start) {
        return NextResponse.json({ error: 'Cannot merge sessions' }, { status: 400 });
      }

      rangeStart = session1.end;
      rangeEnd = session2.start;
    }

    const lines = content.trim().split('\n');
    const updatedLines = lines.map(line => {
      const [time, status] = line.split(',');

      if (status === '0' && time >= rangeStart && time <= rangeEnd) {
        return `${time},1`;
      }

      return line;
    });

    await writeFile(filePath, updatedLines.join('\n') + '\n', 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error merging sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
