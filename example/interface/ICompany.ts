import { IAbility } from './IAbility';

export default interface ICompany {
  querystring: string;
  name: string;
  address: string;
  since: number;
  ability: IAbility;
}
