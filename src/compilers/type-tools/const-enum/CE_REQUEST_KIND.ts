export const CE_REQUEST_KIND = {
  FASTIFY_REQUEST: 'fastify-request',
  PROPERTY_SIGNATURE: 'property-signature',
} as const;

export type CE_REQUEST_KIND = (typeof CE_REQUEST_KIND)[keyof typeof CE_REQUEST_KIND];
