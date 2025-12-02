import { createClient } from 'redis';

export const redisConnection = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisConnection.on('error', (err) => {
  if (!err) {
    console.log("Redis database is working fine")
  } else {
    console.error('Redis Client Error', err)
  }
}
);

redisConnection.connect();