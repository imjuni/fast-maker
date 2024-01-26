# Case of the Request Handler

rotue handler를 만들 때 3.x 에서는 동기 route handler는 reply.send 함수를 반드시 사용해야 했지만 4.x에서는 어떤 방식이든 잘 동작한다. reply.send 함수를 사용하면 buffer 또는 string으로 직접 응답을 내보낼 수 있는데 이 때 fast-json-stringify를 사용하지 않게 된다. fast-json-stringify는 데이터가 커질수록 성능이 저하되는 경향이 있어서 fast-json-stringify는 용도에 따라 사용여부를 결정할 수 있지만 fast-json-stringify가 제공하는 최소한의 타입 방어기제도 없이 reply가 전송되는 것은 호불호가 갈릴 수 있다. 나는 별로 좋아하지 않는다. 오히려 ajv를 돌리고 buffer 또는 string을 이용해서 더 빠르게 전송하는 것을 선호한다.

## FastifyRequest: function

### synchronous function handler

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export function hander(req: FastifyRequest<{ querystring: IHero }>) {
  // your code ...
}
```

### synchronous function handler without type

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export function hander(req: FastifyRequest) {
  // your code ...
}
```

### asynchronous function handler

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export async function hander(req: FastifyRequest<{ querystring: IHero }>) {
  // your code ...
}
```

### asynchronous function handler without type

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export async function hander(req: FastifyRequest) {
  // your code ...
}
```

## FastifyRequest: arrow function

### synchronous arrow function handler

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export const hander = (req: FastifyRequest<{ querystring: IHero }>) => {
  // your code ...
}
```

### synchronous arrow function handler without type

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export const hander = (req: FastifyRequest) => {
  // your code ...
}
```

### asynchronous arrow function handler

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export const hander = async (req: FastifyRequest<{ querystring: IHero }>) => {
  // your code ...
}
```

### asynchronous arrow function handler without type

```ts
import { FastifyRequest } from 'fastify';

export interface IHero {
  name: string;
}

export const hander = async (req: FastifyRequest) => {
  // your code ...
}
```

## imported function

imported function handler

```ts
import { hander as putHandler } from './put'

export interface IHero {
  name: string;
}

export const hander = putHandler
```
