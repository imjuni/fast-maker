const validParamNamesFromFastifyRequest = ['Body', 'Querystring', 'Params', 'Headers'];
const validParamNamesFromCustomType = ['Body', 'Querystring', 'Params', 'Headers'];

export const validParamNames = {
  fastify: validParamNamesFromFastifyRequest,
  typeLiteral: validParamNamesFromCustomType,
};
