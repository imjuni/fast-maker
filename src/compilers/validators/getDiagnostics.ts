import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type * as tsm from 'ts-morph';

interface IGetDiagnostics {
  options: Pick<IBaseOption, 'skipError'>;
  project: tsm.Project;
}

export function getDiagnostics({ options, project }: IGetDiagnostics): boolean {
  if (options.skipError === false) {
    const diagnostics = project.getPreEmitDiagnostics();
    const diagnosticFiles = diagnostics
      .map((diagnostic) => diagnostic.getSourceFile())
      .filter((diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile => diagnosticSourceFile != null)
      .map((diagnosticSourceFile) => diagnosticSourceFile.getSourceFile().getFilePath().toString())
      .reduce((filePathSet, diagnosticFilePath) => {
        filePathSet.add(diagnosticFilePath);
        return filePathSet;
      }, new Set<string>());

    if (diagnosticFiles.size > 0) {
      throw new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
    }

    return true;
  }

  return true;
}
