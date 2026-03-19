import { RedisConfig } from './redis-config.type';

export const getRedisConfig = (_prefix = ''): RedisConfig => {
  const prefix = _prefix != '' ? _prefix + '_' : '';
  const keyword = 'REDIS_';
  return {
    host: process.env[`${prefix}${keyword}HOST`] as string,
    password: process.env[`${prefix}${keyword}PASSWORD`],
    db: +Number(process.env[`${prefix}${keyword}DB`]),
    port: +Number(process.env[`${prefix}${keyword}PORT`]),
  };
};
