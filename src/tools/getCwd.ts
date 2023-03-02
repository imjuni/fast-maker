export default function getCwd(env: NodeJS.ProcessEnv): string {
  if (env.INIT_CWD != null) {
    return env.INIT_CWD;
  }

  return process.cwd();
}
