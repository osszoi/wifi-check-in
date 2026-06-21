import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const configPath = join(process.cwd(), 'scan.config.json');

export const GET = async () => {
  try {
    const content = await readFile(configPath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    // no config yet means empty
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({});
    }
    console.error('Error reading config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const config = await req.json();

    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }

    const entries = Object.entries(config);
    for (const [name, ip] of entries) {
      if (!name.trim() || typeof ip !== 'string' || !ip.trim()) {
        return NextResponse.json({ error: 'Every person needs a name and an IP' }, { status: 400 });
      }
    }

    await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
