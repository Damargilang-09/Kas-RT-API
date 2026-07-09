// import IORedis from 'ioredis';
// import { REDIS_DB, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../configs/env.config';
// import {logger} from "../configs/logger.config"
// const redisConfig = new IORedis({
//   host: REDIS_HOST || '127.0.0.1',
//   port: parseInt(REDIS_PORT ||
//  '6379'),
//   password: REDIS_PASSWORD || undefined,
//   db: parseInt(REDIS_DB ||
//  '0'),
//   // Optional: Reconnect strategy
//   retryStrategy: (times) => Math.min(times * 50, 2000),
// });

// redisConfig.on('connect', () => logger.info('[🔌REDIS]: Connected to redis-server'));
// redisConfig.on('error', (err) => logger.info(`[❌REDIS]: ${err}`));

// export default redisConfig;