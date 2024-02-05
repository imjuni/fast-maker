import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { TemplateContainer } from '#/template/TemplateContainer';
import { getTemplatePath } from '#/template/getTemplatePath';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('TemplateContainer', () => {
  it('bootstrap', async () => {
    await TemplateContainer.bootstrap({ templates: 'templates' });
    expect(TemplateContainer.it).toBeTruthy();
  });
});

describe('getTemplatePath', () => {
  it('template path build based on module path', async () => {
    const r01 = await getTemplatePath();
    expect(r01).toEqual(path.join(process.cwd(), CE_DEFAULT_VALUE.TEMPLATES_PATH));
  });

  it('template path build based on parameter path', async () => {
    const r01 = await getTemplatePath(CE_DEFAULT_VALUE.TEMPLATES_PATH);
    expect(r01).toEqual(path.join(process.cwd(), CE_DEFAULT_VALUE.TEMPLATES_PATH));
  });

  it('template path build based on dist path', async () => {
    const r01 = await getTemplatePath();
    expect(r01).toEqual(path.join(process.cwd(), CE_DEFAULT_VALUE.TEMPLATES_PATH));
  });
});
