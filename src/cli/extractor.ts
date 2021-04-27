import { IOption } from '@modules/IOption';
import { isEmpty, isNotEmpty } from 'my-easy-fp';
import { Arguments } from 'yargs';
import { IFastMakerYargsParameter } from './IFastMakerYargsParameter';

export default function extractor(args: Arguments<IFastMakerYargsParameter>): Partial<IOption> {
  const option: Partial<IOption> = {
    path: {
      api: args['path-api'],
      page: args['path-page'],
      tsconfig: args['path-tsconfig'],
      output: args['path-output'],
    },
  };

  // ----------------------------------------------------------------------------------------------------
  // API
  // ----------------------------------------------------------------------------------------------------
  if (
    isNotEmpty(args['template-api-import-all']) ||
    isNotEmpty(args['template-api-import-async']) ||
    isNotEmpty(args['template-api-import-sync'])
  ) {
    option.template = isNotEmpty(option.template) ? option.template : {};
    option.template.api = isNotEmpty(option.template.api) ? option.template.api : {};
    option.template.api.import = {
      all: args['template-api-import-all'],
      async: args['template-api-import-async'],
      sync: args['template-api-import-sync'],
    };
  }

  if (isNotEmpty(args['template-api-wrapper-async']) || isNotEmpty(args['template-api-wrapper-sync'])) {
    option.template = isNotEmpty(option.template) ? option.template : {};
    option.template.api = isNotEmpty(option.template.api) ? option.template.api : {};
    option.template.api.wrapper = {
      async: args['template-api-wrapper-async'],
      sync: args['template-api-wrapper-sync'],
    };
  }

  // ----------------------------------------------------------------------------------------------------
  // Page
  // ----------------------------------------------------------------------------------------------------
  if (
    isNotEmpty(args['template-page-import-all']) ||
    isNotEmpty(args['template-page-import-async']) ||
    isNotEmpty(args['template-page-import-sync'])
  ) {
    option.template = isNotEmpty(option.template) ? option.template : {};
    option.template.page = isNotEmpty(option.template.page) ? option.template.page : {};
    option.template.page.import = {
      all: args['template-page-import-all'],
      async: args['template-page-import-async'],
      sync: args['template-page-import-sync'],
    };
  }

  if (isNotEmpty(args['template-page-wrapper-async']) || isNotEmpty(args['template-page-wrapper-sync'])) {
    option.template = isNotEmpty(option.template) ? option.template : {};
    option.template.page = isNotEmpty(option.template.page) ? option.template.page : {};
    option.template.page.wrapper = {
      async: args['template-page-wrapper-async'],
      sync: args['template-page-wrapper-sync'],
    };
  }

  return option;
}
