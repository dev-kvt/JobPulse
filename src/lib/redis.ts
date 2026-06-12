import { Redis } from '@upstash/redis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

function createRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return a mock Redis for development without Upstash
    console.warn('[Redis] Missing UPSTASH credentials — caching disabled');
    return {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
      incr: async () => 0,
      expire: async () => 0,
      keys: async () => [],
    } as unknown as Redis;
  }

  return new Redis({ url, token });
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Cache helper with automatic JSON serialization
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch {
    console.warn(`[Redis] Cache miss for key: ${key}`);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  } catch (error) {
    console.warn(`[Redis] Failed to cache key: ${key}`, error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redis.del(k)));
    }
  } catch (error) {
    console.warn(`[Redis] Failed to invalidate pattern: ${pattern}`, error);
  }
}
