/* eslint-disable @typescript-eslint/no-unused-vars */
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

const _formatGet = <T>(x: string | null) => {
  if (!x) {
    return null;
  }

  try {
    return JSON.parse(x) as T; // Désérialisation
  } catch (e) {
    // Gestion d'erreur si le JSON est malformé
    return null;
  }
};

@Injectable()
export class RedisCacheService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (raw === null) {
        return null;
      }

      return _formatGet(raw);
    } catch (err) {
      return null;
    }
  }

  async set(key: string, content: any, ttl: number = 0): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.set(key, JSON.stringify(content), 'EX', ttl);
      } else {
        await this.client.set(key, JSON.stringify(content));
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result != 0;
    } catch (err) {
      return false;
    }
  }

  async mgetByKey<T = string>(key: string): Promise<Array<T | null> | null> {
    const keys = await this.getAllByKey(key);
    if (!keys?.length) {
      return null;
    }
    return await this.mget<T>(keys);
  }

  async getAllByKey(key: string): Promise<string[] | undefined> {
    try {
      const value = await this.client.keys(key);
      return value || undefined;
    } catch (err) {
      return undefined;
    }
  }

  async mget<T = string>(keys: string[]): Promise<Array<T | null>> {
    try {
      const rawString = await this.client.mget(keys);
      return rawString.map((raw) => _formatGet(raw));
    } catch (err) {
      return [];
    }
  }

  async mdel(keys: string[]): Promise<boolean[]> {
    const promises = keys.map((k) => this.del(k));
    const results = await Promise.all(promises);
    return results;
  }

  async mset<T>(
    list: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<[error: Error | null, result: unknown][] | null> {
    const pipeline = this.client.pipeline();

    list.forEach(({ key, value, ttl }) => {
      if (ttl) {
        pipeline.set(key, JSON.stringify(value), 'EX', ttl);
      } else {
        pipeline.set(key, JSON.stringify(value));
      }
    });

    return await pipeline.exec();
  }

  async ttl(key: string): Promise<number | null> {
    try {
      const result = await this.client.ttl(key);
      return result || null;
    } catch (err) {
      return null;
    }
  }
}
