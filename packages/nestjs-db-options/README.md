# @miinded/nestjs-db-options

[![npm version](https://badge.fury.io/js/@miinded%2Fnestjs-db-options.svg)](https://badge.fury.io/js/@miinded%2Fnestjs-db-options)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready NestJS module for database-backed key/value options management with TypeORM. Store and retrieve typed application configuration from your database with pattern-based search.

## Features

- 🗄️ **Database-backed** — Options stored in a TypeORM entity, persisted across restarts
- 🔤 **Typed Formats** — `string`, `int`, `float`, `json` with automatic serialization
- 🔍 **Pattern Search** — Find options by key pattern with `getAll`
- 📦 **TypeORM Integration** — Works with any TypeORM-supported database (PostgreSQL, MySQL, SQLite…)
- 🚀 **Ready-to-use Migration** — Ships a TypeORM migration to create the `options` table
- 📝 **Full TypeScript** — Complete type definitions for excellent DX
- ✅ **Well Tested** — Unit tests with 80%+ coverage

## Installation

```bash
npm install @miinded/nestjs-db-options
# or
pnpm add @miinded/nestjs-db-options
# or
yarn add @miinded/nestjs-db-options
```

## Quick Start

### 1. Register the module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbOptionsModule } from '@miinded/nestjs-db-options';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // ... your TypeORM config
    }),
    DbOptionsModule,
  ],
})
export class AppModule {}
```

### 2. Add the migration

The module ships a ready-to-use TypeORM migration to create the `options` table:

```typescript
import { OptionsMigration } from '@miinded/nestjs-db-options';

// In your DataSource or TypeORM config
migrations: [OptionsMigration],
```

### 3. Inject and use `OptionService`

```typescript
import { Injectable } from '@nestjs/common';
import { OptionService } from '@miinded/nestjs-db-options';

@Injectable()
export class AppConfigService {
  constructor(private readonly options: OptionService) {}

  async getMaxRetries(): Promise<number> {
    return this.options.get<number>('app.max_retries', 'int');
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.options.set('app.maintenance', enabled, 'json');
  }

  async getFeatureFlags() {
    return this.options.gets(['feature.darkMode', 'feature.betaApi'], 'json');
  }
}
```

## Usage Example

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OptionService } from '@miinded/nestjs-db-options';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly options: OptionService) {}

  async onModuleInit() {
    // Set a default if not present
    const retries = await this.options.get<number>('app.max_retries', 'int');
    if (!retries) {
      await this.options.set('app.max_retries', 3, 'int');
    }
  }

  async findAllRateLimits() {
    // Find all options whose key starts with 'rate_limit.'
    return this.options.getAll('rate_limit.%', 'int');
  }
}
```

## API Reference

### `OptionService`

| Method   | Signature                                                           | Description                             |
| -------- | ------------------------------------------------------------------- | --------------------------------------- |
| `get`    | `<T>(key: string, format: OptionFormat) => Promise<T>`              | Get a single option by exact key        |
| `getAll` | `<T>(pattern: string, format: OptionFormat) => Promise<T[]>`        | Get all options matching a LIKE pattern |
| `gets`   | `<T>(keys: string[], format: OptionFormat) => Promise<T[]>`         | Get multiple options by key list        |
| `set`    | `<T>(key: string, value: T, format: OptionFormat) => Promise<void>` | Create or update an option              |

### `OptionFormat`

| Value    | Description                                                   |
| -------- | ------------------------------------------------------------- |
| `string` | Plain string — stored and returned as-is                      |
| `int`    | Integer — parsed via `parseInt`                               |
| `float`  | Float — parsed via `parseFloat`                               |
| `json`   | JSON object — serialized with `JSON.stringify` / `JSON.parse` |

### Exports

| Symbol             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `DbOptionsModule`  | Main module                                     |
| `OptionService`    | Service for reading and writing options         |
| `OptionRepository` | TypeORM repository for the `OptionEntity`       |
| `OptionEntity`     | TypeORM entity representing a single option row |
| `OptionsMigration` | TypeORM migration to create the `options` table |

## License

MIT © [Miinded](https://github.com/miinded)
