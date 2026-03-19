import { Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { OPTION_FORMAT } from '../dtos/option.dto';
import { OptionEntity } from './option.entity';

@Injectable()
export class OptionRepository extends Repository<OptionEntity> {
  constructor(readonly dataSource: DataSource) {
    super(OptionEntity, dataSource.createEntityManager());
  }

  public get(key: string): Promise<OptionEntity | null> {
    return this.findOne({ where: { key } });
  }

  public gets(key: string): Promise<OptionEntity[]> {
    return this.find({ where: { key: Like(key.replace('*', '%')) } });
  }

  public async set(key: string, value: any, format: OPTION_FORMAT): Promise<OptionEntity> {
    if (format === 'json') {
      value = JSON.stringify(value);
    }
    return this.save({
      ...(await this.get(key)),
      key,
      value,
      format,
    });
  }
}
