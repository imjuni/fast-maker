export const CE_ROUTE_PATH_KIND = {
  NULLABLE_VARIABLE: 1,
  WILDCARD_VARIABLE: 2,
  VARIABLE: 3,
  REPLACE: 4,
  CONSTANT: 5,
} as const;

export type CE_ROUTE_PATH_KIND = (typeof CE_ROUTE_PATH_KIND)[keyof typeof CE_ROUTE_PATH_KIND];
