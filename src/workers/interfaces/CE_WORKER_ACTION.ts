export const CE_WORKER_ACTION = {
  NOOP: 'noop',
  OPTION_LOAD: 'option-load',
  PROJECT_LOAD: 'project-load',
  PROJECT_DIAGONOSTIC: 'project-diagostic',
  SUMMARY_ROUTE_HANDLER_FILE: 'summary-route-handler-file',
  VALIDATE_ROUTE_HANDLER_FILE: 'validate-route-handler-file',
  ANALYSIS_REQUEST_STATEMENT: 'analysis-request-statement',
  ANALYSIS_REQUEST_STATEMENT_BULK: 'analysis-request-statement-bulk',
  TERMINATE: 'terminate',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_WORKER_ACTION = (typeof CE_WORKER_ACTION)[keyof typeof CE_WORKER_ACTION];
