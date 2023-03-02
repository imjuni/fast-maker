export const CE_REQUEST_HANDLER_ANALYSIS_MACHINE = {
  ID: 'request-analysis',
  INITIAL: 'state-initial',
  EXPORT_OPTION: 'state-export-option',

  ASYNC_FUNCTION: 'state-route-function-async',
  SYNC_FUNCTION: 'state-route-function-sync',
  HAVE_PARAMETER: 'state-route-function-have-parameter',

  PREPARE_ANALYSIS: 'state-route-prepare-analysis',
  FASTIFY_REQUEST_TYPE: 'state-fastify-request-type',
  ANY_TYPE: 'state-any-type',
  TYPE_ALIAS_DECLARATION_TYPE: 'state-type-alias-declaration',
  PREPARE_CUSTOM_TYPE: 'state-prepare-custom-type',
  CUSTOM_TYPE: 'state-custom-type',

  VALIDATE_EXPORTATION: 'state-validate-exportation',
  VALIDATE_PROPERTY_SIGNATURE: 'state-property-signature',
  COMPLETE_ANALYSIS: 'state-complete-analysis',

  FAIL: 'state-fail',
  PASS: 'state-pass',
  DONE: 'state-done',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_REQUEST_HANDLER_ANALYSIS_MACHINE =
  (typeof CE_REQUEST_HANDLER_ANALYSIS_MACHINE)[keyof typeof CE_REQUEST_HANDLER_ANALYSIS_MACHINE];
