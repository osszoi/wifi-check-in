import { exec } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';

const CHECK_INTERVAL_MS = 60 * 1000;
const CHECK_INS_DIR = './check-ins';

const loadConfig = async () => {
  const data = await readFile('./config.json', 'utf-8');
  return JSON.parse(data);
};

const ping = (ip) => {
  return new Promise((resolve) => {
    exec(`ping -c 1 -W 2 ${ip}`, (error) => {
      resolve(!error);
    });
  });
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const checkIn = (person) => {
  const personDir = `${CHECK_INS_DIR}/${person}`;
  const checkInFile = `${personDir}/${getToday()}`;

  if (existsSync(checkInFile)) {
    return false;
  }

  if (!existsSync(personDir)) {
    mkdirSync(personDir, { recursive: true });
  }

  writeFileSync(checkInFile, '');
  return true;
};

const runCheck = async () => {
  const config = await loadConfig();
  const entries = Object.entries(config);

  const results = await Promise.all(
    entries.map(async ([person, ip]) => {
      const isOnline = await ping(ip);
      return { person, ip, isOnline };
    })
  );

  for (const { person, ip, isOnline } of results) {
    if (isOnline) {
      const isNew = checkIn(person);
      if (isNew) {
        console.log(`[${getToday()}] ${person} checked in`);
      }
    }
  }
};

const main = async () => {
  console.log(`Starting wifi-check-in`);
  console.log(`Checking every ${CHECK_INTERVAL_MS / 1000} seconds`);

  await runCheck();

  setInterval(runCheck, CHECK_INTERVAL_MS);
};

main();
