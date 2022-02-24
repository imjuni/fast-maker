import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { wrap } from '@services/route//wrap';
import { default as default_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa } from './getpo-kehello';
import { default as default_tbHqStpOv2oTLscCKV2LmgTz2aKq2o7Z } from './posthello';
import { default as default_EMAT31TuH1DF4pvvke0ag4gCirWw8HOF } from './puthello';
import { default as default_zNTkRqO5MoKM3dGqgZfVHffirOHZy28k } from './deletehello';

// ----------------------------------------------------------------------------------------------------
// Generated server route function start
export function server(server: FastifyInstance<Server, IncomingMessage, ServerResponse>): void {
  server.get('/po-ke/hello', wrap(default_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa));
  server.post('/hello', wrap(default_tbHqStpOv2oTLscCKV2LmgTz2aKq2o7Z));
  server.put('/hello', wrap(default_EMAT31TuH1DF4pvvke0ag4gCirWw8HOF));
  server.delete('/hello', wrap(default_zNTkRqO5MoKM3dGqgZfVHffirOHZy28k));
}
// Generated server route function start
// ----------------------------------------------------------------------------------------------------
