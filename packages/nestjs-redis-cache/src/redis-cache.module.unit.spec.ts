import { RedisCacheModule, RedisConfigAsyncOptions } from './redis-cache.module';
import { RedisCacheService } from './service/redis-cache.service';
import { REDIS_CACHE_MODULE_OPTIONS } from './redis-cache.constants';

describe('RedisCacheModule', () => {
  describe('registerAsync', () => {
    it('should return a dynamic module', () => {
      const config: RedisConfigAsyncOptions = {
        useFactory: () => ({ host: 'localhost', port: 6379 }),
      };

      const module = RedisCacheModule.registerAsync(config);

      expect(module).toBeDefined();
      expect(module.module).toBe(RedisCacheModule);
      expect(module.global).toBe(true);
      expect(module.providers).toBeDefined();
      expect(module.exports).toBeDefined();
    });

    it('should provide RedisCacheService', () => {
      const config: RedisConfigAsyncOptions = {
        useFactory: () => ({ host: 'localhost', port: 6379 }),
      };

      const module = RedisCacheModule.registerAsync(config);
      const redisCacheService = module.providers?.find(
        (p) => p === RedisCacheService || ('provide' in p && p.provide === RedisCacheService),
      );

      expect(redisCacheService).toBeDefined();
    });

    it('should provide REDIS_CACHE_MODULE_OPTIONS', () => {
      const config: RedisConfigAsyncOptions = {
        useFactory: () => ({ host: 'localhost', port: 6379 }),
      };

      const module = RedisCacheModule.registerAsync(config);
      const optionsProvider = module.providers?.find((p) => 'provide' in p && p.provide === REDIS_CACHE_MODULE_OPTIONS);

      expect(optionsProvider).toBeDefined();
    });

    it('should accept inject array', () => {
      const config: RedisConfigAsyncOptions = {
        useFactory: () => ({ host: 'localhost', port: 6379 }),
        inject: ['CONFIG_SERVICE'],
      };

      const module = RedisCacheModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should accept imports array', () => {
      const config: RedisConfigAsyncOptions = {
        useFactory: () => ({ host: 'localhost', port: 6379 }),
        imports: [],
      };

      const module = RedisCacheModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should accept name option', () => {
      const config: RedisConfigAsyncOptions = {
        name: 'custom-redis',
        useFactory: () => ({ host: 'localhost', port: 6379 }),
      };

      const module = RedisCacheModule.registerAsync(config);

      expect(module).toBeDefined();
    });
  });
});
