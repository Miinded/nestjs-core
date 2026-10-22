---
'@miinded/nestjs-db-options': major
'@miinded/nestjs-redis-cache': major
---

Require Node.js >= 24 and refresh dependencies for security fixes.

- `engines.node` is now `>=24` (Node.js 22 is no longer supported).
- `@miinded/nestjs-db-options`: `typeorm` raised to `^0.3.31` (fixes advisories in earlier 0.3.x releases).
- `@miinded/nestjs-redis-cache`: `ioredis` raised to `^5.11.1` and `@nestjs-modules/ioredis` to `^2.3.1`.
