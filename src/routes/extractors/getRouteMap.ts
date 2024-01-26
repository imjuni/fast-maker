export async function getRouteMap(filePath: string): Promise<Map<string, string>> {
  try {
    const imported = (await import(filePath)) as { map?: Map<string, string> };

    if ('map' in imported && imported.map != null) {
      const { map } = imported;

      if (typeof map === 'object' && 'has' in map) {
        return map;
      }

      return new Map<string, string>();
    }

    return new Map<string, string>();
  } catch {
    return new Map<string, string>();
  }
}
