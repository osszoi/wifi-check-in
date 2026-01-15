import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Calendar } from './Calendar';
import { parsePingLog, calculateSessions, DayData } from './lib/sessions';

export const dynamic = 'force-dynamic';

export type CheckInsData = Record<string, Record<string, DayData>>;

const getCheckInsData = (): CheckInsData => {
  const checkInsPath = join(process.cwd(), 'check-ins');

  if (!existsSync(checkInsPath)) {
    return {};
  }

  const people = readdirSync(checkInsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const data: CheckInsData = {};

  for (const person of people) {
    const personPath = join(checkInsPath, person);
    const dates = readdirSync(personPath).filter(f => !f.startsWith('.'));

    data[person] = {};

    for (const date of dates) {
      const filePath = join(personPath, date);
      const content = readFileSync(filePath, 'utf-8');
      const entries = parsePingLog(content);
      data[person][date] = calculateSessions(entries);
    }
  }

  return data;
};

const HomePage = () => {
  const checkIns = getCheckInsData();

  return <Calendar checkIns={checkIns} />;
};

export default HomePage;
