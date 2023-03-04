import { Project } from 'ts-morph';

/**
 * @param param.tsconfig
 * @param param.ignore
 * @returns
 */
export default function getTypeScriptProject(projectPath: string): Project {
  const project = new Project({ tsConfigFilePath: projectPath });
  return project;
}
