# @miinded/nestjs-redis-cache

## 2.0.0

### Major Changes

- b49be8f: Require Node.js >= 24 and refresh dependencies for security fixes.

  - `engines.node` is now `>=24` (Node.js 22 is no longer supported).
  - `@miinded/nestjs-db-options`: `typeorm` raised to `^0.3.31` (fixes advisories in earlier 0.3.x releases).
  - `@miinded/nestjs-redis-cache`: `ioredis` raised to `^5.11.1` and `@nestjs-modules/ioredis` to `^2.3.1`.

## 1.0.1

### Patch Changes

- a5b21f0: fix: add NPM publishing support and CI improvements
