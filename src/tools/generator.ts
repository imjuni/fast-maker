export const getOptionsVariableName = (args: { filename: string; hash: string }) =>
  `options_${args.filename}_${args.hash}`;

export const getDefaultVariableName = (args: { filename: string; hash: string }) =>
  `default_${args.filename}_${args.hash}`;
