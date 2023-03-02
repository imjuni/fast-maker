type TConsoleFunc = Extract<keyof typeof console, 'log' | 'error' | 'debug' | 'info' | 'trace' | 'warn'>;

export default function show(message: string, channel?: TConsoleFunc) {
  // eslint-disable-next-line no-console
  console[channel ?? 'log'](message);
}
