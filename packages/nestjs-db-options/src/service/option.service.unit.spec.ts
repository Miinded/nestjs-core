import { Test, TestingModule } from '@nestjs/testing';
import { OptionService } from './option.service';
import { OptionRepository } from '../entities/option.repository';
import { OptionEntity } from '../entities/option.entity';
import { InternalServerErrorException } from '@nestjs/common';

describe('OptionService', () => {
  let service: OptionService;
  let mockRepository: jest.Mocked<OptionRepository>;
  let module: TestingModule;

  beforeEach(async () => {
    mockRepository = {
      get: jest.fn(),
      find: jest.fn(),
      set: jest.fn(),
      gets: jest.fn(),
    } as unknown as jest.Mocked<OptionRepository>;

    module = await Test.createTestingModule({
      providers: [
        OptionService,
        {
          provide: OptionRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OptionService>(OptionService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return value for string format', async () => {
      const entity = { id: 1, key: 'test_key', value: 'test_value', format: 'string' } as OptionEntity;
      mockRepository.get.mockResolvedValue(entity);

      const result = await service.get('test_key');
      expect(result).toBe('test_value');
    });

    it('should return value for int format', async () => {
      const entity = { id: 1, key: 'test_key', value: '42', format: 'int' } as OptionEntity;
      mockRepository.get.mockResolvedValue(entity);

      const result = await service.get('test_key');
      expect(result).toBe(42);
    });

    it('should return value for float format', async () => {
      const entity = { id: 1, key: 'test_key', value: '3.14', format: 'float' } as OptionEntity;
      mockRepository.get.mockResolvedValue(entity);

      const result = await service.get('test_key');
      expect(result).toBe(3.14);
    });

    it('should return value for json format', async () => {
      const entity = { id: 1, key: 'test_key', value: '{"name":"test"}', format: 'json' } as OptionEntity;
      mockRepository.get.mockResolvedValue(entity);

      const result = await service.get('test_key');
      expect(result).toEqual({ name: 'test' });
    });

    it('should throw when option not found', async () => {
      mockRepository.get.mockResolvedValue(null);

      await expect(service.get('missing_key')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAll', () => {
    it('should return all matching options', async () => {
      const entities = [
        { id: 1, key: 'key1', value: 'value1', format: 'string' },
        { id: 2, key: 'key2', value: 'value2', format: 'string' },
      ] as OptionEntity[];
      mockRepository.find.mockResolvedValue(entities);

      const result = await service.getAll('key');
      expect(result).toHaveLength(2);
      expect(result).toEqual(['value1', 'value2']);
    });

    it('should throw when no options found', async () => {
      mockRepository.find.mockResolvedValue([]);

      await expect(service.getAll('missing')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('gets', () => {
    it('should return values for multiple keys', async () => {
      const entities = [
        { id: 1, key: 'key1', value: 'value1', format: 'string' },
        { id: 2, key: 'key2', value: '42', format: 'int' },
      ] as OptionEntity[];
      mockRepository.find.mockResolvedValue(entities);

      const result = await service.gets(['key1', 'key2']);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no options found', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.gets(['missing1', 'missing2']);
      expect(result).toEqual([]);
    });
  });

  describe('set', () => {
    it('should set option and return formatted value', async () => {
      const entity = { id: 1, key: 'test_key', value: 'test_value', format: 'string' } as OptionEntity;
      mockRepository.set.mockResolvedValue(entity);

      const result = await service.set('test_key', 'test_value', 'string');
      expect(result).toEqual({ key: 'test_key', format: 'string', value: 'test_value' });
    });

    it('should set json value', async () => {
      const entity = { id: 1, key: 'test_key', value: '{"data":true}', format: 'json' } as OptionEntity;
      mockRepository.set.mockResolvedValue(entity);

      const result = await service.set('test_key', { data: true }, 'json');
      expect(result.value).toEqual({ data: true });
    });
  });

  describe('toOption', () => {
    it('should parse string format', () => {
      const entity = { id: 1, key: 'key', value: 'value', format: 'string' } as OptionEntity;
      const result = service.toOption(entity);
      expect(result.value).toBe('value');
    });

    it('should parse int format', () => {
      const entity = { id: 1, key: 'key', value: '123', format: 'int' } as OptionEntity;
      const result = service.toOption(entity);
      expect(result.value).toBe(123);
    });

    it('should parse float format', () => {
      const entity = { id: 1, key: 'key', value: '3.14', format: 'float' } as OptionEntity;
      const result = service.toOption(entity);
      expect(result.value).toBe(3.14);
    });

    it('should parse json format', () => {
      const entity = { id: 1, key: 'key', value: '{"a":1}', format: 'json' } as OptionEntity;
      const result = service.toOption(entity);
      expect(result.value).toEqual({ a: 1 });
    });

    it('should throw on invalid json', () => {
      const entity = { id: 1, key: 'key', value: 'invalid json', format: 'json' } as OptionEntity;
      expect(() => service.toOption(entity)).toThrow(InternalServerErrorException);
    });

    it('should throw on unknown format', () => {
      const entity = { id: 1, key: 'key', value: 'value', format: 'unknown' } as OptionEntity;
      expect(() => service.toOption(entity)).toThrow(InternalServerErrorException);
    });
  });
});
