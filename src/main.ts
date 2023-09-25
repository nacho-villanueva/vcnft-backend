import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {createClient} from "redis";
import RedisStore from "connect-redis"
import * as session from "express-session";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = process.env.REDIS_PORT || 6379;

    // Initialize client.
    let redisClient = createClient({
        url: `redis://${redisHost}:${redisPort}`
    })
    redisClient.connect().catch(console.error)

    let redisStore = RedisStore

    app.use(
        session({
            //@ts-ignore
            store: new redisStore({
                //@ts-ignore
                client: redisClient,
                prefix: "vcnft"
            }),
            resave: false, // required: force lightweight session keep alive (touch)
            saveUninitialized: false, // recommended: only save session when data exists
            secret: "keyboard cat",
        })
    )

    await app.listen(3000, "0.0.0.0");
}

bootstrap();