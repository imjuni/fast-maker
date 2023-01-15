import sortRoutes from '#route/sortRoutes';
import fs from 'fs';
import 'jest';
import { parse } from 'jsonc-parser';
import path from 'path';

test('sort', async () => {
  const inp = parse((await fs.promises.readFile(path.join(__dirname, 'inp', 'route-configurations.json'))).toString());
  const results = sortRoutes(inp);

  const summary = results.map((result) => `${result.method}::${result.routePath}`);
  const exp = parse((await fs.promises.readFile(path.join(__dirname, 'inp', 'sort-results.json'))).toString());

  expect(summary).toEqual(exp);
});
