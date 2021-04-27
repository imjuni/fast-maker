import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import { Argv } from 'yargs';

export default function builder(args: Argv<IFastMakerYargsParameter>): Argv<IFastMakerYargsParameter> {
  args.option('path-api', {
    alias: 'a',
    description: 'API hander path parameter, this value is required',
    type: 'string',
  });

  args.option('path-page', {
    alias: 'p',
    description: 'next.js page prefet hander path parameter, this value is required',
    type: 'string',
  });

  args.option('path-tsconfig', {
    alias: 't',
    description: 'tsconfig.json file for route.ts generation',
    type: 'string',
  });

  args.option('path-output', {
    alias: 'o',
    description: 'output directory to save that route configuration file name by route.ts',
    type: 'string',
  });

  // ---------------------------------------------------------------------------------
  // fastify api handler route option
  // ---------------------------------------------------------------------------------
  args.option('template-api-import-all', {
    description: 'template for fastify api handler wrapper function import async, sync dual import',
    type: 'string',
  });
  args.option('template-api-import-async', {
    description: 'template for fastify api handler wrapper function import async import',
    type: 'string',
  });
  args.option('template-api-import-sync', {
    description: 'template for fastify api handler wrapper function import sync import',
    type: 'string',
  });

  args.option('template-api-wrapper-async', {
    description: 'template for fastify api handler wrapper async function name for route configuration code generation',
    type: 'string',
  });
  args.option('template-api-wrapper-sync', {
    description: 'template forfastify api handler wrapper sync function name for route configuration code generation',
    type: 'string',
  });

  // ---------------------------------------------------------------------------------
  // next.js page prefetch handler route option
  // ---------------------------------------------------------------------------------
  args.option('template-page-import-all', {
    description: 'template for next.js page prefetch handler wrapper function import async, sync dual import',
    type: 'string',
  });
  args.option('template-page-import-async', {
    description: 'template for next.js page prefetch handler wrapper function import async import',
    type: 'string',
  });
  args.option('template-page-import-sync', {
    description: 'template for next.js page prefetch handler wrapper function import sync import',
    type: 'string',
  });

  args.option('template-page-wrapper-async', {
    description:
      'template for next.js page prefetch handler wrapper async function name for route configuration code generation',
    type: 'string',
  });
  args.option('template-page-wrapper-sync', {
    description:
      'template for next.js page prefetch handler wrapper sync function name for route configuration code generation',
    type: 'string',
  });
  return args;
}
