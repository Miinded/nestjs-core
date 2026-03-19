import { DbOptionsModule } from './db-options.module';
import { OptionService } from './service/option.service';
import { OptionRepository } from './entities/option.repository';

describe('DbOptionsModule', () => {
  it('should be defined', () => {
    expect(DbOptionsModule).toBeDefined();
  });

  it('should have OptionService in providers', () => {
    const providers = Reflect.getMetadata('providers', DbOptionsModule) || [];
    expect(providers).toContain(OptionService);
  });

  it('should have OptionRepository in providers', () => {
    const providers = Reflect.getMetadata('providers', DbOptionsModule) || [];
    expect(providers).toContain(OptionRepository);
  });

  it('should export OptionService', () => {
    const exports = Reflect.getMetadata('exports', DbOptionsModule) || [];
    expect(exports).toContain(OptionService);
  });

  it('should export OptionRepository', () => {
    const exports = Reflect.getMetadata('exports', DbOptionsModule) || [];
    expect(exports).toContain(OptionRepository);
  });
});
