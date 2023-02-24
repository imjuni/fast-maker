export const CE_REQUEST_HANDLER_ANALYSIS_MACHINE = {
  ID: 'request-analysis',
  INITIAL: '0F60D7B1403441B98E2AF6CD47C5A94C',
  EXPORT_OPTION: '9CE23C3B4F1A4E12B9BF51D4F77230F1',

  ASYNC_FUNCTION: '31D1D7180BE24D8ABD7E9D3FAC968E01',
  SYNC_FUNCTION: '70D615E1D33D43A494480676F093AD83',
  HAVE_PARAMETER: '1E4A9134B7314BEA81135BD1FAC3F57E',

  PREPARE_ANALYSIS: '324A1BC5B3494DB3AD4718912CE61DDB',
  FASTIFY_REQUEST_TYPE: 'BA10BADCF2E74D0FA25B32DB2C38503F',
  ANY_TYPE: 'AA0F757A0EA442A38157999C82C92441',
  TYPE_ALIAS_DECLARATION_TYPE: 'C757AF29DFA04FFE85C0F0713C63591F',
  PREPARE_CUSTOM_TYPE: '3EBFD985968C413C8320C5F0F6145575',
  CUSTOM_TYPE: '7FAC9B6CCBB3406986BA0FDFF44711CA',

  VALIDATE_EXPORTATION: '2549C1063A09475AB1A92ED43C5989D4',
  VALIDATE_PROPERTY_SIGNATURE: '26635E161F4F496C8333B805F46A0B34',
  COMPLETE_ANALYSIS: '9B44DFD2A936474F81C41EB95A38D4B2',

  ERROR: 'D7C8DBCF493340009A1AA82E9AFEA42E',
  COMPLETE: '3794670720C542A59D807FDB9993E101',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_REQUEST_HANDLER_ANALYSIS_MACHINE =
  (typeof CE_REQUEST_HANDLER_ANALYSIS_MACHINE)[keyof typeof CE_REQUEST_HANDLER_ANALYSIS_MACHINE];
