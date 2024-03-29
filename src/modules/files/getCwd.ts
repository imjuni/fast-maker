export function getCwd(env: NodeJS.ProcessEnv): string {
  if ((env.USE_INIT_CWD ?? 'false') !== 'true') {
    return process.cwd();
  }

  if (env.INIT_CWD != null) {
    return env.INIT_CWD;
  }

  return process.cwd();
}
