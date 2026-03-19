import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheService } from './redis-cache.service';

type MockRedis = {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  keys: jest.Mock;
  mget: jest.Mock;
  ttl: jest.Mock;
  pipeline: jest.Mock;
};

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let mockRedis: MockRedis;
  let module: TestingModule;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      mget: jest.fn(),
      ttl: jest.fn(),
      pipeline: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([[null, 'OK']]),
      }),
    };

    module = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return parsed JSON value', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ name: 'test' }));
      const result = await service.get<{ name: string }>('key');
      expect(result).toEqual({ name: 'test' });
    });

    it('should return null on error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));
      const result = await service.get('key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without ttl', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await service.set('key', { data: 'value' });
      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ data: 'value' }));
    });

    it('should set value with ttl', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const result = await service.set('key', { data: 'value' }, 3600);
      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ data: 'value' }), 'EX', 3600);
    });

    it('should return false on error', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));
      const result = await service.set('key', 'value');
      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should return true when key deleted', async () => {
      mockRedis.del.mockResolvedValue(1);
      const result = await service.del('key');
      expect(result).toBe(true);
    });

    it('should return false when key not found', async () => {
      mockRedis.del.mockResolvedValue(0);
      const result = await service.del('key');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));
      const result = await service.del('key');
      expect(result).toBe(false);
    });
  });

  describe('getAllByKey', () => {
    it('should return keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      const result = await service.getAllByKey('key*');
      expect(result).toEqual(['key1', 'key2', 'key3']);
    });

    it('should return undefined on error', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));
      const result = await service.getAllByKey('key*');
      expect(result).toBeUndefined();
    });
  });

  describe('mget', () => {
    it('should return multiple values', async () => {
      mockRedis.mget.mockResolvedValue([JSON.stringify({ id: 1 }), null, JSON.stringify({ id: 3 })]);
      const result = await service.mget<{ id: number }>(['key1', 'key2', 'key3']);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: 1 });
      expect(result[1]).toBeNull();
      expect(result[2]).toEqual({ id: 3 });
    });

    it('should return empty array on error', async () => {
      mockRedis.mget.mockRejectedValue(new Error('Redis error'));
      const result = await service.mget(['key1', 'key2']);
      expect(result).toEqual([]);
    });
  });

  describe('mgetByKey', () => {
    it('should return null when no keys found', async () => {
      mockRedis.keys.mockResolvedValue([]);
      const result = await service.mgetByKey('pattern*');
      expect(result).toBeNull();
    });

    it('should return values for matching keys', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2']);
      mockRedis.mget.mockResolvedValue([JSON.stringify({ v: 1 }), JSON.stringify({ v: 2 })]);
      const result = await service.mgetByKey('key*');
      expect(result).toHaveLength(2);
    });
  });

  describe('mdel', () => {
    it('should delete multiple keys', async () => {
      mockRedis.del.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
      const result = await service.mdel(['key1', 'key2']);
      expect(result).toEqual([true, true]);
    });
  });

  describe('mset', () => {
    it('should set multiple values', async () => {
      const result = await service.mset([
        { key: 'key1', value: 'val1' },
        { key: 'key2', value: 'val2', ttl: 60 },
      ]);
      expect(result).toBeDefined();
    });
  });

  describe('ttl', () => {
    it('should return ttl value', async () => {
      mockRedis.ttl.mockResolvedValue(3600);
      const result = await service.ttl('key');
      expect(result).toBe(3600);
    });

    it('should return null on error', async () => {
      mockRedis.ttl.mockRejectedValue(new Error('Redis error'));
      const result = await service.ttl('key');
      expect(result).toBeNull();
    });
  });
});
