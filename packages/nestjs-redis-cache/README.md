# @miinded/nestjs-redis-cache

[![npm version](https://badge.fury.io/js/@miinded%2Fnestjs-redis-cache.svg)](https://badge.fury.io/js/@miinded%2Fnestjs-redis-cache)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready NestJS module for Redis caching with ioredis integration. Features get/set/delete with TTL support, pattern-based key scanning, and full TypeScript support.

## Features

- ⚡ **ioredis Powered** — Built on the battle-tested ioredis client
- 🔄 **TTL Support** — Set per-key expiration in seconds
- 🔍 **Key Scanning** — Find keys by glob pattern with `keys`
- ⏱️ **TTL Inspection** — Read remaining TTL for any key
- 🌍 **Global Module** — Register once, inject `RedisCacheService` anywhere
- 📝 **Full TypeScript** — Complete type definitions for excellent DX
- ✅ **Well Tested** — Unit tests with 80%+ coverage

## Installation

```bash
npm install @miinded/nestjs-redis-cache
# or
pnpm add @miinded/nestjs-redis-cache
# or
yarn add @miinded/nestjs-redis-cache
```

## Quick Start

### Async configuration with `ConfigService`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheModule } from '@miinded/nestjs-redis-cache';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.getOrThrow('REDIS_HOST'),
        port: config.getOrThrow<number>('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
        db: config.get<number>('REDIS_DB', 0),
      }),
    }),
  ],
})
export class AppModule {}
```

### Static configuration

```typescript
import { Module } from '@nestjs/common';
import { RedisCacheModule } from '@miinded/nestjs-redis-cache';

@Module({
  imports: [
    RedisCacheModule.registerAsync({
      useFactory: () => ({
        host: 'localhost',
        port: 6379,
      }),
    }),
  ],
})
export class AppModule {}
```

## Usage Example

```typescript
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@miinded/nestjs-redis-cache';

@Injectable()
export class UserService {
  constructor(private readonly cache: RedisCacheService) {}

  async getUser(id: string) {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return JSON.parse(cached) as User;

    const user = await this.usersRepository.findOneOrFail({ where: { id } });
    await this.cache.set(`user:${id}`, JSON.stringify(user), 300);
    return user;
  }

  async invalidateUser(id: string) {
    await this.cache.del(`user:${id}`);
  }

  async invalidateAllUsers() {
    const keys = await this.cache.keys('user:*');
    await Promise.all(keys.map((k) => this.cache.del(k)));
  }
}
```

## API Reference

### `RedisCacheModule.registerAsync(options)`

| Option       | Type                       | Required | Description                               |
| ------------ | -------------------------- | -------- | ----------------------------------------- |
| `useFactory` | `(...args) => RedisConfig` | ✅       | Factory returning Redis connection config |
| `inject`     | `any[]`                    | ❌       | Dependencies to inject into factory       |
| `imports`    | `Module[]`                 | ❌       | Modules to import                         |

### `RedisConfig`

| Option     | Type     | Required | Description                         |
| ---------- | -------- | -------- | ----------------------------------- |
| `host`     | `string` | ✅       | Redis host                          |
| `port`     | `number` | ✅       | Redis port                          |
| `password` | `string` | ❌       | Redis auth password                 |
| `db`       | `number` | ❌       | Redis database index (default: `0`) |

### `RedisCacheService`

| Method | Signature                                                     | Description                                                     |
| ------ | ------------------------------------------------------------- | --------------------------------------------------------------- |
| `get`  | `(key: string) => Promise<string \| null>`                    | Get a cached value, or `null` if missing                        |
| `set`  | `(key: string, value: string, ttl?: number) => Promise<void>` | Set a value with optional TTL in seconds                        |
| `del`  | `(key: string) => Promise<void>`                              | Delete a key                                                    |
| `keys` | `(pattern: string) => Promise<string[]>`                      | Find all keys matching a glob pattern                           |
| `ttl`  | `(key: string) => Promise<number>`                            | Get remaining TTL in seconds (`-1` = no expiry, `-2` = missing) |

## License

MIT © [Miinded](https://github.com/miinded)
