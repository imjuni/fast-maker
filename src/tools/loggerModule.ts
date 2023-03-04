import pino from 'pino';

export function getLogLevel(level: unknown): number {
  try {
    if (typeof level === 'number') {
      return level;
    }

    if (typeof level === 'string') {
      const parsed = Number.parseInt(level, 10);
      return parsed;
    }

    // level of debug
    return 20;
  } catch {
    // level of debug
    return 20;
  }
}

export function getLogLabel(level: number): string {
  const label = pino.levels.labels[level]?.toLowerCase();
  return label == null ? 'info' : label;
}
