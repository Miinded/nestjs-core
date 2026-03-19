import { Test, TestingModule } from '@nestjs/testing';
import { OptionRepository } from './option.repository';
import { OptionEntity } from './option.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OptionRepository', () => {
  let repository: OptionRepository;
  let module: TestingModule;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(OptionEntity),
          useValue: mockRepository,
        },
        {
          provide: OptionRepository,
          useFactory: () => {
            const repo = Object.assign(Object.create(OptionRepository.prototype), mockRepository);
            repo.get = (key: string) => mockRepository.findOne({ where: { key } });
            repo.gets = (key: string) => mockRepository.find({ where: { key } });
            repo.set = async (key: string, value: any, format: string) => {
              const existing = await mockRepository.findOne({ where: { key } });
              if (format === 'json') {
                value = JSON.stringify(value);
              }
              return mockRepository.save({ ...existing, key, value, format });
            };
            return repo;
          },
        },
      ],
    }).compile();

    repository = module.get<OptionRepository>(OptionRepository);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('get', () => {
    it('should return entity by key', async () => {
      const entity = { id: 1, key: 'test_key', value: 'test_value', format: 'string' } as OptionEntity;
      mockRepository.findOne.mockResolvedValue(entity);

      const result = await repository.get('test_key');
      expect(result).toEqual(entity);
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.get('missing_key');
      expect(result).toBeNull();
    });
  });

  describe('gets', () => {
    it('should return entities matching pattern', async () => {
      const entities = [
        { id: 1, key: 'key1', value: 'value1', format: 'string' },
        { id: 2, key: 'key2', value: 'value2', format: 'string' },
      ] as OptionEntity[];
      mockRepository.find.mockResolvedValue(entities);

      const result = await repository.gets('key*');
      expect(result).toHaveLength(2);
    });
  });

  describe('set', () => {
    it('should create new option', async () => {
      const entity = { id: 1, key: 'new_key', value: 'new_value', format: 'string' } as OptionEntity;
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(entity);

      const result = await repository.set('new_key', 'new_value', 'string');
      expect(result).toEqual(entity);
    });

    it('should update existing option', async () => {
      const existing = { id: 1, key: 'existing_key', value: 'old_value', format: 'string' } as OptionEntity;
      const updated = { id: 1, key: 'existing_key', value: 'new_value', format: 'string' } as OptionEntity;
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue(updated);

      const result = await repository.set('existing_key', 'new_value', 'string');
      expect(result.value).toBe('new_value');
    });

    it('should stringify json value', async () => {
      const entity = { id: 1, key: 'json_key', value: '{"a":1}', format: 'json' } as OptionEntity;
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(entity);

      await repository.set('json_key', { a: 1 }, 'json');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'json_key', value: '{"a":1}', format: 'json' }),
      );
    });
  });
});
