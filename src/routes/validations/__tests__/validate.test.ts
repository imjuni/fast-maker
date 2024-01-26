import { isValidMethod } from '#/routes/validations/isValidMethod';
import { describe, expect, it } from 'vitest';

describe('isValidMethod', () => {
  it('lowercase, successfully', () => {
    const r01 = isValidMethod('delete');
    const r02 = isValidMethod('get');
    const r03 = isValidMethod('head');
    const r04 = isValidMethod('patch');
    const r05 = isValidMethod('post');
    const r06 = isValidMethod('put');
    const r07 = isValidMethod('options');
    const r08 = isValidMethod('propfind');
    const r09 = isValidMethod('proppatch');
    const r10 = isValidMethod('mkcol');
    const r11 = isValidMethod('copy');
    const r12 = isValidMethod('move');
    const r13 = isValidMethod('lock');
    const r14 = isValidMethod('unlock');
    const r15 = isValidMethod('trace');
    const r16 = isValidMethod('search');

    expect(r01).toBeTruthy();
    expect(r02).toBeTruthy();
    expect(r03).toBeTruthy();
    expect(r04).toBeTruthy();
    expect(r05).toBeTruthy();
    expect(r06).toBeTruthy();
    expect(r07).toBeTruthy();
    expect(r08).toBeTruthy();
    expect(r09).toBeTruthy();
    expect(r10).toBeTruthy();
    expect(r11).toBeTruthy();
    expect(r12).toBeTruthy();
    expect(r13).toBeTruthy();
    expect(r14).toBeTruthy();
    expect(r15).toBeTruthy();
    expect(r16).toBeTruthy();
  });

  it('mixed, successfully', () => {
    const r01 = isValidMethod('dElete');
    const r02 = isValidMethod('gEt');
    const r03 = isValidMethod('hEad');
    const r04 = isValidMethod('pAtch');
    const r05 = isValidMethod('pOst');
    const r06 = isValidMethod('pUt');
    const r07 = isValidMethod('oPtions');
    const r08 = isValidMethod('pRopfind');
    const r09 = isValidMethod('pRoppatch');
    const r10 = isValidMethod('mKcol');
    const r11 = isValidMethod('cOpy');
    const r12 = isValidMethod('mOve');
    const r13 = isValidMethod('lOck');
    const r14 = isValidMethod('uNlock');
    const r15 = isValidMethod('tRace');
    const r16 = isValidMethod('sEarch');

    expect(r01).toBeTruthy();
    expect(r02).toBeTruthy();
    expect(r03).toBeTruthy();
    expect(r04).toBeTruthy();
    expect(r05).toBeTruthy();
    expect(r06).toBeTruthy();
    expect(r07).toBeTruthy();
    expect(r08).toBeTruthy();
    expect(r09).toBeTruthy();
    expect(r10).toBeTruthy();
    expect(r11).toBeTruthy();
    expect(r12).toBeTruthy();
    expect(r13).toBeTruthy();
    expect(r14).toBeTruthy();
    expect(r15).toBeTruthy();
    expect(r16).toBeTruthy();
  });

  it('invalid method', () => {
    const r01 = isValidMethod('dElece');
    expect(r01).toBeFalsy();
  });
});
