import { CE_ROUTE_PATH_KIND } from '#/routes/const-enum/CE_ROUTE_PATH_KIND';
import { evaluteRouteVariable } from '#/routes/paths/evaluteRouteVariable';
import { extractVariable } from '#/routes/paths/extractVariable';
import { getRouteVariables } from '#/routes/paths/getRouteVariables';
import { describe, expect, it } from 'vitest';

describe('extractVariable', () => {
  it('nullable wildcard variable', () => {
    expect(extractVariable('[...id1]-[[id]]')).toMatchObject({
      matched: '[...id1]',
      kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE,
      nullable: false,
      variable: 'id1',
    });
  });

  it('nullable variable', () => {
    expect(extractVariable('[[id2]]-[[...id]]')).toMatchObject({
      matched: '[[id2]]',
      kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE,
      nullable: true,
      variable: 'id2',
    });
  });

  it('wildcard variable', () => {
    expect(extractVariable('[...id]]-[id2]-[[...id]]')).toMatchObject({
      matched: '[...id]',
      kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE,
      nullable: false,
      variable: 'id',
    });
  });

  it('variable', () => {
    expect(extractVariable('[id]-[id2]-[[...id]]')).toMatchObject({
      matched: '[id]',
      kind: CE_ROUTE_PATH_KIND.VARIABLE,
      nullable: false,
      variable: 'id',
    });
  });

  it('replace', () => {
    expect(extractVariable('[$name_reg]')).toMatchObject({
      matched: '[$name_reg]',
      kind: CE_ROUTE_PATH_KIND.REPLACE,
      nullable: false,
      variable: 'name_reg',
    });
  });
});

describe('evaluateRoutePath', () => {
  it('plain alphabet', () => {
    const inp = 'evaluateRoutePath';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      {
        kind: CE_ROUTE_PATH_KIND.CONSTANT,
        matched: 'evaluateRoutePath',
        nullable: false,
        variable: 'evaluateRoutePath',
      },
    ]);
  });

  it('plain alphabet, with trim', () => {
    const inp = '   evaluateRoutePath';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      {
        kind: CE_ROUTE_PATH_KIND.CONSTANT,
        matched: 'evaluateRoutePath',
        nullable: false,
        variable: 'evaluateRoutePath',
      },
    ]);
  });

  it('variable', () => {
    const inp = '[id]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]);
  });

  it('multiple variable', () => {
    const inp = '[kind]-[id]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[kind]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]);
  });

  it('replace variable', () => {
    const inp = '[$time]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[$time]', kind: CE_ROUTE_PATH_KIND.REPLACE, nullable: false, variable: 'time' },
    ]);
  });

  it('replace variables', () => {
    const inp = '[$time]-[$name]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[$time]', kind: 4, nullable: false, variable: 'time' },
      { matched: '-', kind: 5, nullable: false, variable: '-' },
      { matched: '[$name]', kind: 4, nullable: false, variable: 'name' },
    ]);
  });

  it('mixed multiple variable', () => {
    const inp = '[[kind]]-[[wildcard]]-[id]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      {
        matched: '[[wildcard]]',
        kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE,
        nullable: true,
        variable: 'wildcard',
      },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]);
  });

  it('mixed multiple variable and complex combiner', () => {
    const inp = '[[kind]]-apple-[[wildcard]]-hello-[id]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-apple-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-apple-' },
      {
        matched: '[[wildcard]]',
        kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE,
        nullable: true,
        variable: 'wildcard',
      },
      { matched: '-hello-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-hello-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]);
  });

  it('mixed multiple variable: wildcard variable, nullable wildcard variable, nullable variable', () => {
    const inp = '[[kind]]-[...wildcard]-[...id]';
    const r01 = getRouteVariables(inp);

    expect(r01).toMatchObject([
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      {
        matched: '[...wildcard]',
        kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE,
        nullable: false,
        variable: 'wildcard',
      },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[...id]', kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE, nullable: false, variable: 'id' },
    ]);
  });
});

describe('evaluteRouteVariable', () => {
  const rm = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

  it('plain alphabet', () => {
    const r01 = evaluteRouteVariable(
      {
        kind: CE_ROUTE_PATH_KIND.CONSTANT,
        matched: 'evaluateRoutePath',
        nullable: false,
        variable: 'evaluateRoutePath',
      },
      rm,
    );

    expect(r01).toEqual('evaluateRoutePath');
  });

  it('variable', () => {
    const r01 = evaluteRouteVariable(
      {
        matched: '[id]',
        kind: CE_ROUTE_PATH_KIND.VARIABLE,
        nullable: false,
        variable: 'id',
      },
      rm,
    );

    expect(r01).toEqual(':id');
  });

  it('multiple variable', () => {
    const r01 = [
      { matched: '[kind]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]
      .map((variable) => evaluteRouteVariable(variable, rm))
      .join('');

    expect(r01).toEqual(':kind-:id');
  });

  it('mixed multiple variable', () => {
    const r01 = [
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      {
        matched: '[[wildcard]]',
        kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE,
        nullable: true,
        variable: 'wildcard',
      },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]
      .map((variable) => evaluteRouteVariable(variable, rm))
      .join('');

    expect(r01).toEqual(':kind?-:wildcard?-:id');
  });

  it('mixed multiple variable and complex combiner', () => {
    const r01 = [
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-apple-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-apple-' },
      {
        matched: '[[wildcard]]',
        kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE,
        nullable: true,
        variable: 'wildcard',
      },
      { matched: '-hello-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-hello-' },
      { matched: '[id]', kind: CE_ROUTE_PATH_KIND.VARIABLE, nullable: false, variable: 'id' },
    ]
      .map((variable) => evaluteRouteVariable(variable, rm))
      .join('');

    expect(r01).toEqual(':kind?-apple-:wildcard?-hello-:id');
  });

  it('mixed multiple variable: wildcard variable, nullable wildcard variable, nullable variable', () => {
    const r01 = [
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      {
        matched: '[...wildcard]',
        kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE,
        nullable: false,
        variable: 'wildcard',
      },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[...id]', kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE, nullable: false, variable: 'id' },
    ]
      .map((variable) => evaluteRouteVariable(variable, rm))
      .join('');

    expect(r01).toEqual(':kind?-*-*');
  });

  it('mixed multiple variable: wildcard variable, nullable variable', () => {
    const r01 = [
      { matched: '[[kind]]', kind: CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, nullable: true, variable: 'kind' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      {
        matched: '[...wildcard]',
        kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE,
        nullable: false,
        variable: 'wildcard',
      },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[...id]', kind: CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE, nullable: false, variable: 'id' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[$time]', kind: CE_ROUTE_PATH_KIND.REPLACE, nullable: false, variable: 'time' },
      { matched: '-', kind: CE_ROUTE_PATH_KIND.CONSTANT, nullable: false, variable: '-' },
      { matched: '[$name]', kind: CE_ROUTE_PATH_KIND.REPLACE, nullable: false, variable: 'name' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { matched: '[$greeting]', kind: 99 as any, nullable: false, variable: 'greeting' },
    ]
      .map((variable) => evaluteRouteVariable(variable, rm))
      .join('');

    expect(r01).toEqual(':kind?-*-*-:hour(^\\d{2})h:minute(^\\d{2})m-name');
  });
});
