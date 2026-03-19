import { Module } from '@nestjs/common';
import { OptionService } from './service/option.service';
import { OptionRepository } from './entities/option.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionEntity } from './entities';

const repositories = [OptionRepository];
const services = [OptionService];
const providers = [...repositories, ...services];

@Module({
  imports: [
    //
    TypeOrmModule.forFeature([OptionEntity]),
  ],
  controllers: [],
  providers,
  exports: [...providers],
})
export class DbOptionsModule {}
