export default {
  valid: false,
  fuzzyValid: true,
  match: ['Params', 'Headers'],
  fuzzy: [
    {
      target: 'Bod',
      origin: 'Body',
      expectName: 'Body',
      score: 0.001,
      percent: 99.9,
      matchCase: false,
    },
    {
      target: 'Querystrin',
      origin: 'Querystring',
      expectName: 'Querystring',
      score: 0.001,
      percent: 99.9,
      matchCase: false,
    },
  ],
};
