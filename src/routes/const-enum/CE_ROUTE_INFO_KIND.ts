export const CE_ROUTE_INFO_KIND = {
  ROUTE_PATH_SUMMARY: 'route-path-summary',
  ROUTE_PATH_SUMMARIES: '// route-path-summaries',
  VALIDATE_ROUTE_HANDLER_FILE: 'validate-route-handler-file',
  NULLABLE_NODE: 'nullable-node',
  NON_NULLABLE_NODE: 'non-nullable-node',
  ANALYSIS: 'analysis',
} as const;

export type CE_ROUTE_INFO_KIND = (typeof CE_ROUTE_INFO_KIND)[keyof typeof CE_ROUTE_INFO_KIND];
