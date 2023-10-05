"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const redis_1 = require("redis");
const connect_redis_1 = require("connect-redis");
const session = require("express-session");
require("reflect-metadata");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = process.env.REDIS_PORT || 6379;
    let redisClient = (0, redis_1.createClient)({
        url: `redis://${redisHost}:${redisPort}`
    });
    redisClient.connect().catch(console.error);
    let redisStore = connect_redis_1.default;
    app.use(session({
        store: new redisStore({
            client: redisClient,
            prefix: "vcnft"
        }),
        resave: false,
        saveUninitialized: false,
        secret: "keyboard cat",
    }));
    await app.listen(3000, "0.0.0.0");
}
bootstrap();
//# sourceMappingURL=main.js.map