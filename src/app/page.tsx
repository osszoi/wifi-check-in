import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Calendar } from './Calendar';

export const dynamic = 'force-dynamic';

type CheckInsData = Record<string, string[]>;

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
    data[person] = dates;
  }

  return data;
};

const HomePage = () => {
  const checkIns = getCheckInsData();

  return <Calendar checkIns={checkIns} />;
};

export default HomePage;
