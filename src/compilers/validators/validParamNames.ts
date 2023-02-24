const validParamNamesFromFastifyRequest = ['Body', 'Querystring', 'Params', 'Headers'];
const validParamNamesFromCustomType = ['Body', 'Querystring', 'Params', 'Headers'];

const validParamNames = {
  fastify: validParamNamesFromFastifyRequest,
  custom: validParamNamesFromCustomType,
};

export default validParamNames;
