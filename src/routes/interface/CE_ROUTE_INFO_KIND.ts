export const CE_ROUTE_INFO_KIND = {
  ROUTE: 'route',
  SUMMARY_ROUTE_HANDLER_FILE: 'summary-route-handler-file',
  VALIDATE_ROUTE_HANDLER_FILE: 'validate-route-handler-file',
  NULLABLE_NODE: 'nullable-node',
  NON_NULLABLE_NODE: 'non-nullable-node',
  ANALYSIS: 'analysis',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_ROUTE_INFO_KIND = (typeof CE_ROUTE_INFO_KIND)[keyof typeof CE_ROUTE_INFO_KIND];
