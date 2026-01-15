import { exec } from 'child_process';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { readFile } from 'fs/promises';

const CHECK_INTERVAL_MS = 3 * 60 * 1000;
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

const getTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const logPing = (person, isOnline) => {
  const personDir = `${CHECK_INS_DIR}/${person}`;
  const logFile = `${personDir}/${getToday()}`;

  if (!existsSync(personDir)) {
    mkdirSync(personDir, { recursive: true });
  }

  const entry = `${getTime()},${isOnline ? 1 : 0}\n`;
  appendFileSync(logFile, entry);
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

  for (const { person, isOnline } of results) {
    logPing(person, isOnline);
    console.log(`[${getToday()} ${getTime()}] ${person}: ${isOnline ? 'online' : 'offline'}`);
  }
};

const main = async () => {
  console.log(`Starting wifi-check-in`);
  console.log(`Checking every ${CHECK_INTERVAL_MS / 1000} seconds`);

  await runCheck();

  setInterval(runCheck, CHECK_INTERVAL_MS);
};

main();
