import consola from 'consola';
import fastify from 'fastify';

async function handler() {
  const server = fastify({ logger: true });

  server.get('/hello', () => {
    return { name: 'pikachu' };
  });

  await server.listen({ port: 9898, host: '0.0.0.0' });
}

handler().catch((err) => {
  consola.error(err);
});
