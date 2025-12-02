import { createClient } from 'redis';

export const redisConnection = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisConnection.on('error', (err) =>
  console.error('Redis Client Error', err)
);

redisConnection.connect();

// --------------------- Redis Connection Commands --------------------- //
// sudo apt update
// sudo apt install redis-server
// sudo service redis-server start
// sudo systemctl enable redis-server

// sudo service redis-server stop
// sudo service redis-server restart
// sudo service redis-server status
