export interface ITestInfoType01 {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}

export interface ITestInfoType02 {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}

type TTypeParams = { Querystring: ITestInfoType01; Params: ITestInfoType02 };

export default TTypeParams;
