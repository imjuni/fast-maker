import { Project } from 'ts-morph';

/**
 * @param param.tsconfig
 * @param param.ignore
 * @returns
 */
export default async function getTypeScriptProject(projectPath: string): Promise<Project> {
  // Exclude exclude file in .ctiignore file: more exclude progress
  const project = new Project({ tsConfigFilePath: projectPath });
  return project;
}
