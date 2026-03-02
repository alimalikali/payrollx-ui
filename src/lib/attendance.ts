const TIME_WITH_SECONDS_REGEX = /^\d{2}:\d{2}:\d{2}$/;
const TIME_WITHOUT_SECONDS_REGEX = /^\d{2}:\d{2}$/;

const normalizeTime = (time: string | null | undefined): string | null => {
  if (!time) return null;
  if (TIME_WITH_SECONDS_REGEX.test(time)) return time;
  if (TIME_WITHOUT_SECONDS_REGEX.test(time)) return `${time}:00`;
  return null;
};

const buildDateTime = (date: string, time: string | null | undefined): Date | null => {
  const normalized = normalizeTime(time);
  if (!normalized) return null;
  return new Date(`${date}T${normalized}`);
};

export const getElapsedSeconds = (
  date: string,
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  now: Date = new Date(),
): number => {
  const start = buildDateTime(date, checkIn);
  if (!start || Number.isNaN(start.getTime())) return 0;

  const end = checkOut ? buildDateTime(date, checkOut) : now;
  if (!end || Number.isNaN(end.getTime())) return 0;

  const diffMs = end.getTime() - start.getTime();
  return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
};

export const formatDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

