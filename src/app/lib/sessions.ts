export type PingEntry = {
  time: string;
  online: boolean;
};

export type Session = {
  start: string;
  end: string | null;
  durationMinutes: number;
};

export type DayData = {
  sessions: Session[];
  totalMinutes: number;
  firstSeen: string | null;
  lastSeen: string | null;
  stillConnected: boolean;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const parsePingLog = (content: string): PingEntry[] => {
  if (!content.trim()) return [];

  return content
    .trim()
    .split('\n')
    .map(line => {
      const [time, status] = line.split(',');
      return { time, online: status === '1' };
    });
};

export const calculateSessions = (entries: PingEntry[]): DayData => {
  if (entries.length === 0) {
    return { sessions: [], totalMinutes: 0, firstSeen: null, lastSeen: null, stillConnected: false };
  }

  const sessions: Session[] = [];
  let sessionStart: string | null = null;
  let firstSeen: string | null = null;
  let lastSeen: string | null = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prevEntry = i > 0 ? entries[i - 1] : null;

    if (entry.online) {
      if (!firstSeen) firstSeen = entry.time;
      lastSeen = entry.time;

      if (!sessionStart) {
        sessionStart = entry.time;
      }
    } else {
      if (sessionStart) {
        const startMinutes = timeToMinutes(sessionStart);
        const endMinutes = timeToMinutes(entry.time);
        sessions.push({
          start: sessionStart,
          end: entry.time,
          durationMinutes: endMinutes - startMinutes,
        });
        sessionStart = null;
      }
    }
  }

  const lastEntry = entries[entries.length - 1];
  const stillConnected = lastEntry.online;

  if (sessionStart) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const startMinutes = timeToMinutes(sessionStart);
    const endMinutes = timeToMinutes(lastEntry.time);

    sessions.push({
      start: sessionStart,
      end: stillConnected ? null : lastEntry.time,
      durationMinutes: endMinutes - startMinutes + 3, // +3 because we know they were online at last ping
    });
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return { sessions, totalMinutes, firstSeen, lastSeen, stillConnected };
};

export { formatDuration };
