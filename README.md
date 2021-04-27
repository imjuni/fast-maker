# fast-maker
fast-maker is a route configuration tools for fastify.js 3.x. fast-maker generate route configuration that writted by typescript code. 

Usually route configuration is very complexity. So fast-maker have a some constraints. 

1. Typescript only
2. Directory architecture use to route path
    * <your project>/handlers/get/utility/health_check > server.get('/utility/health_check')
    * get, post, put, delete directory don't include route path but use http method
3. Only default function is to use handler function
    * Don't care about anonymous function or named function
4. Named variable "option" are passed fastify.js option
    * option variable have to exported
