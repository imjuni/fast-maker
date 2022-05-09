const validParamNamesFromFastifyRequest = ['Body', 'Querystring', 'Params', 'Headers'];
const validParamNamesFromCustomType = ['query', 'params', 'headers', 'body'];

const validParamNames = {
  fastify: validParamNamesFromFastifyRequest,
  custom: validParamNamesFromCustomType,
};

export default validParamNames;
