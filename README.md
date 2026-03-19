# @miinded/nestjs-core

A collection of production-ready NestJS utility modules for database-backed configuration and Redis caching.

## Packages

| Package                                                        | Description                                               |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| [`@miinded/nestjs-db-options`](./packages/nestjs-db-options)   | Database-backed key/value options management with TypeORM |
| [`@miinded/nestjs-redis-cache`](./packages/nestjs-redis-cache) | Redis caching with ioredis integration                    |

## Related repositories

| Repository                                                          | Packages                                  |
| ------------------------------------------------------------------- | ----------------------------------------- |
| [`nestjs-auth`](https://github.com/miinded/nestjs-auth)             | `nestjs-auth-jwt`, `nestjs-auth-api-keys` |
| [`nestjs-monitoring`](https://github.com/miinded/nestjs-monitoring) | `nestjs-prometheus`                       |
| [`nestjs-storage`](https://github.com/miinded/nestjs-storage)       | `nestjs-s3`, `nestjs-google-drive`        |

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test:unit        # Run unit tests
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint all packages
pnpm format:check     # Check formatting
pnpm barrels:check    # Verify barrel file exports
pnpm deps:check       # Dependency policy check
pnpm ci:quality       # Run full CI quality pipeline locally
```
