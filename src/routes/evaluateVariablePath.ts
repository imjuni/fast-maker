import dayjs from 'dayjs';

export default async function evaluateVariablePath(routePath: string): Promise<string> {
  const variableCount = (routePath.match(/\[/g) ?? []).length;

  // not variable
  if (variableCount === 0) {
    return routePath;
  }

  const result = await new Promise<{ variableMap: Record<string, boolean>; variables: string[] }>((resolve, reject) => {
    let isVariableStart: boolean = false;
    let temp: string[] = [];

    const routePaths = routePath.split('');
    const variables: string[] = [];
    const variableMap: Record<string, boolean> = {};
    const startedAt = dayjs();

    const intervalHandle = setInterval(() => {
      const current = routePaths.shift();

      if (current == null) {
        clearInterval(intervalHandle);

        if (temp.length > 0) {
          variables.push(temp.join(''));
        }

        resolve({ variableMap, variables });

        return;
      }

      const endedAt = dayjs();
      if (endedAt.diff(startedAt, 'seconds') > 30) {
        clearInterval(intervalHandle);
        reject(new Error(`timeout reach from evaluate variable path: ${routePath}`));

        return;
      }

      if (isVariableStart === false && current === '[') {
        isVariableStart = true;

        if (temp.length > 0) {
          variables.push(temp.join(''));
          temp = [];
        }
      } else if (isVariableStart && current === ']') {
        isVariableStart = false;

        const joined = temp.join('');

        variableMap[joined] = true;
        variables.push(joined);
        temp = [];
      } else {
        temp.push(current);
      }
    }, 5);
  });

  const variablePath = result.variables
    .map((variable) => {
      if (result.variableMap[variable]) {
        return `:${variable}`;
      }

      return variable;
    })
    .join('');

  return variablePath;
}
