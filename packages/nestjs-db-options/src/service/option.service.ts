import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OptionRepository } from '../entities/option.repository';
import { OPTION, OPTION_FORMAT } from '../dtos/option.dto';
import { OptionEntity } from '../entities/option.entity';
import { In, Like } from 'typeorm';

@Injectable()
export class OptionService {
  constructor(protected optionRepository: OptionRepository) {}

  public async get<T = any>(key: string): Promise<T> {
    const option = await this.optionRepository.get(key);

    if (!option) {
      throw new InternalServerErrorException('Option[key:' + key + '] not found (code: op-s-14)');
    }

    return this.toOption(option).value as T;
  }

  public async getAll<T = unknown>(key: string): Promise<T[]> {
    const options = await this.optionRepository.find({
      where: {
        key: Like('%' + key + '%'),
      },
    });

    if (options.length <= 0) {
      throw new InternalServerErrorException('Option[key:%' + key + '%] not found (code: op-s-14)');
    }

    return options.map((option) => this.toOption(option).value as T);
  }

  public async gets<T = unknown>(keys: string[]): Promise<T[]> {
    const options = await this.optionRepository.find({
      where: {
        key: In(keys),
      },
    });

    return options.map((option) => this.toOption(option).value as T);
  }

  public async set(key: string, value: unknown, format: OPTION_FORMAT): Promise<OPTION> {
    return this.optionRepository.set(key, value, format).then((option) => this.toOption(option));
  }

  public toOption(option: OptionEntity): OPTION {
    let value: unknown = null;
    // formatage du retour
    switch (option.format as OPTION_FORMAT) {
      case 'string':
        value = option.value;
        break;
      case 'int':
        value = parseInt(option.value);
        break;
      case 'float':
        value = parseFloat(option.value);
        break;
      case 'json':
        try {
          value = JSON.parse(option.value);
        } catch (e) {
          throw new InternalServerErrorException('JSON Parse error [key:' + option.key + '] (code: op-s-41)');
        }
        break;
      default:
        throw new InternalServerErrorException(
          'Option.Format[format:' + option.format + '] not match  (code: op-s-45)',
        );
    }

    return {
      key: option.key,
      format: option.format as OPTION_FORMAT,
      value: value,
    };
  }
}
