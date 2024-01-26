import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';

export function getNextExtName(extKind: CE_EXT_KIND, fromExtName: string) {
  switch (extKind) {
    case CE_EXT_KIND.JS:
      return CE_EXT_KIND.JS;
    case CE_EXT_KIND.CJS:
      return CE_EXT_KIND.CJS;
    case CE_EXT_KIND.MJS:
      return CE_EXT_KIND.MJS;
    case CE_EXT_KIND.TS:
      return CE_EXT_KIND.TS;
    case CE_EXT_KIND.CTS:
      return CE_EXT_KIND.CTS;
    case CE_EXT_KIND.MTS:
      return CE_EXT_KIND.MTS;
    case CE_EXT_KIND.KEEP:
      return fromExtName;
    default:
      return '';
  }
}
