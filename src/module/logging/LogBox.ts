import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import type IReason from '#compiler/interface/IReason';
import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import type IStage02Log from '#module/interface/IStage02Log';
import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type IRouteHandler from '#route/interface/IRouteHandler';
import loseAbleStringfiy from '#tool/loseAbleStringfiy';

export default class LogBox implements IStage02Log {
  accessor config: IConfig | IWatchConfig | undefined = undefined;

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
}
