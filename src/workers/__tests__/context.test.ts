import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import * as env from '#tools/__tests__/tools/env';
import FastMakerContext from '#workers/FastMakerContext';
import 'jest';
import path from 'path';
import { Project } from 'ts-morph';

describe('FastMakerContext', () => {
  test('pass - project', () => {
    const context = new FastMakerContext();
    context.project = new Project({
      tsConfigFilePath: path.join(env.examplePath, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME),
    });
    expect(context.project.compilerOptions).toBeTruthy();
  });

  test('fail - project', () => {
    try {
      const context = new FastMakerContext();
      console.log(context.project);
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('pass - route-option', () => {
    const context = new FastMakerContext();
    context.setOption({ kind: 'route', option: env.routeOption as TRouteOption });
    expect(context.option).toBeTruthy();
  });

  test('pass - watch-option', () => {
    const context = new FastMakerContext();
    context.setOption({ kind: 'watch', option: env.watchOption as TWatchOption });
    expect(context.option).toBeTruthy();
  });

  test('fail - watch-option', () => {
    try {
      const context = new FastMakerContext();
      console.log(context.option);
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('pass - handler', () => {
    const context = new FastMakerContext();
    context.handler = {
      kind: CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE,
      summary: {
        get: [],
        post: [],
        put: [],
        delete: [],
        options: [],
        head: [],
        patch: [],
        all: [],
      },
    };

    expect(context.getHandler(CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE)).toBeTruthy();
  });

  test('fail - handler exception', () => {
    try {
      const context = new FastMakerContext();
      context.getHandler(CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE);
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});
