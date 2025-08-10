import Redis from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = Redis.createClient({
  url: redisUrl,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const connectRedis = async () => {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};