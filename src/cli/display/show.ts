type TConsoleFunc = Extract<keyof typeof console, 'log' | 'error' | 'debug' | 'info' | 'trace' | 'warn'>;

export default function show(channel: TConsoleFunc | undefined, ...message: any[]) {
  // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-argument
  console[channel ?? 'log'](...message);
}
