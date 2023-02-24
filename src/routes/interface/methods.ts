import type TMethodType from '#routes/interface/TMethodType';

const methods: Readonly<TMethodType[]> = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'all'];

export default methods;
