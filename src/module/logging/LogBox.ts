import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import type IReason from '#compiler/interface/IReason';
import type THandlerNode from '#compiler/interface/THandlerNode';
import type { THandlerWithoutNode } from '#compiler/interface/THandlerNode';
import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import type IStage02Log from '#module/interface/IStage02Log';
import type ILogBox from '#module/logging/interface/ILogBox';
import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type IRouteHandler from '#route/interface/IRouteHandler';
import loseAbleStringfiy from '#tool/loseAbleStringfiy';
import { first } from 'my-easy-fp';
import type { Merge } from 'type-fest';

export default class LogBox implements IStage02Log, ILogBox {
  accessor config: IConfig | Merge<IConfig, IWatchConfig> | undefined = undefined;

  accessor routeHandlers: IRouteHandler[] = [];

  accessor reasons: IReason[] = [];

  accessor importConfigurations: IImportConfiguration[] = [];

  accessor routeConfigurations: IRouteConfiguration[] = [];

  accessor importCodes: string[] = [];

  accessor routeCodes: string[] = [];

  accessor fileExists: IStage02Log['fileExists'] = [];

  accessor fileNotFound: IStage02Log['fileNotFound'] = [];

  accessor functionExists: IStage02Log['functionExists'] = [];

  accessor functionNotFound: IStage02Log['functionNotFound'] = [];

  accessor routePathDuplicate: IStage02Log['routePathDuplicate'] = [];

  accessor routePathUnique: IStage02Log['routePathUnique'] = [];

  static merge(...logboxes: (LogBox | ILogBox)[]) {
    const routeHandlers = logboxes.map((logbox) => logbox.routeHandlers).flat();
    const reasons = logboxes.map((logbox) => logbox.reasons).flat();
    const importConfigurations = logboxes.map((logbox) => logbox.importConfigurations).flat();
    const routeConfigurations = logboxes.map((logbox) => logbox.routeConfigurations).flat();
    const importCodes = logboxes.map((logbox) => logbox.importCodes).flat();
    const routeCodes = logboxes.map((logbox) => logbox.routeCodes).flat();
    const fileExists = logboxes.map((logbox) => logbox.fileExists).flat();
    const fileNotFound = logboxes.map((logbox) => logbox.fileNotFound).flat();
    const functionExists = logboxes.map((logbox) => logbox.functionExists).flat();
    const functionNotFound = logboxes.map((logbox) => logbox.functionNotFound).flat();
    const routePathDuplicate = logboxes.map((logbox) => logbox.routePathDuplicate).flat();
    const routePathUnique = logboxes.map((logbox) => logbox.routePathUnique).flat();

    const firstLogBox = first(logboxes);

    const next: ILogBox = {
      config: firstLogBox.config != null ? firstLogBox.config : undefined,
      routeHandlers,
      reasons,
      importConfigurations,
      routeConfigurations,
      importCodes,
      routeCodes,
      fileExists,
      fileNotFound,
      functionExists,
      functionNotFound,
      routePathDuplicate,
      routePathUnique,
    };

    return next;
  }

  toString() {
    return loseAbleStringfiy({
      config: this.config != null ? this.config : undefined,
      routeHandlers: this.routeHandlers != null && this.routeHandlers.length > 0 ? this.routeHandlers : undefined,
      reasons: this.reasons != null && this.reasons.length > 0 ? this.reasons : undefined,
      importConfigurations:
        this.importConfigurations != null && this.importConfigurations.length > 0
          ? this.importConfigurations
          : undefined,
      routeConfigurations:
        this.routeConfigurations != null && this.routeConfigurations.length > 0 ? this.routeConfigurations : undefined,
      importCodes: this.importCodes != null && this.importCodes.length > 0 ? this.importCodes : undefined,
      routeCodes: this.routeCodes != null && this.routeCodes.length > 0 ? this.routeCodes : undefined,
      fileExists: this.fileExists != null && this.fileExists.length > 0 ? this.fileExists : undefined,
      fileNotFound: this.fileNotFound != null && this.fileNotFound.length > 0 ? this.fileNotFound : undefined,
      functionExists: this.functionExists != null && this.functionExists.length > 0 ? this.functionExists : undefined,
      functionNotFound:
        this.functionNotFound != null && this.functionNotFound.length > 0 ? this.functionNotFound : undefined,
      routePathDuplicate:
        this.routePathDuplicate != null && this.routePathDuplicate.length > 0 ? this.routePathDuplicate : undefined,
      routePathUnique:
        this.routePathUnique != null && this.routePathUnique.length > 0 ? this.routePathUnique : undefined,
    });
  }

  static getHandlerWithoutNode(nodes: THandlerNode[]): THandlerWithoutNode[] {
    return nodes.map((node) => {
      if (node.kind === 'handler') {
        const { node: _node, ...another } = node;
        return another;
      }

      const { node: _node, ...another } = node;
      return another;
    });
  }

  toObject(): ILogBox {
    return {
      config: this.config != null ? this.config : undefined,
      routeHandlers: this.routeHandlers,
      reasons: this.reasons.map((reason) => {
        const { node: _node, source: _source, ...another } = reason;
        return another;
      }),
      importConfigurations: this.importConfigurations,
      routeConfigurations: this.routeConfigurations,
      importCodes: this.importCodes,
      routeCodes: this.routeCodes,
      fileExists: this.fileExists,
      fileNotFound: this.fileNotFound,
      functionExists: this.functionExists.map((functionExist) => {
        return {
          filename: functionExist.filename,
          nodes: LogBox.getHandlerWithoutNode(functionExist.nodes),
        };
      }),
      functionNotFound: this.functionNotFound.map((functionExist) => {
        return {
          filename: functionExist.filename,
          nodes: LogBox.getHandlerWithoutNode(functionExist.nodes),
        };
      }),
      routePathDuplicate: this.routePathDuplicate.map((functionExist) => {
        return {
          filename: functionExist.filename,
          nodes: LogBox.getHandlerWithoutNode(functionExist.nodes),
        };
      }),
      routePathUnique: this.routePathUnique.map((functionExist) => {
        return {
          filename: functionExist.filename,
          nodes: LogBox.getHandlerWithoutNode(functionExist.nodes),
        };
      }),
    };
  }
}
