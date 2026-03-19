import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { RedisCacheService } from './service/redis-cache.service';
import { RedisConfig } from './common/redis-config.type';
import { REDIS_CACHE_MODULE_OPTIONS } from './redis-cache.constants';
import { RedisModule } from '@nestjs-modules/ioredis';

export type RedisConfigAsyncOptions = {
  name?: string;
  useFactory: (...args: any[]) => Promise<RedisConfig> | RedisConfig;
  inject?: any[];
} & Pick<ModuleMetadata, 'imports'>;

@Module({})
export class RedisCacheModule {
  static registerAsync(options: RedisConfigAsyncOptions): DynamicModule {
    const providers = [
      {
        provide: REDIS_CACHE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      RedisCacheService,
    ];

    return {
      module: RedisCacheModule,
      global: true,
      imports: [
        //
        RedisModule.forRootAsync({
          useFactory: (config: RedisConfig) => ({
            type: 'single',
            url: `redis://:${config.password}@${config.host}:${config.port}/${config.db}`,
          }),
          inject: [REDIS_CACHE_MODULE_OPTIONS],
        }),
        ...(options?.imports || []),
      ],
      providers,
      exports: [...providers],
    };
  }
}
