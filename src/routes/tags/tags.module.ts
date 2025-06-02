import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagsRepository } from './repository/tags.repo';
import { SlugService } from 'src/shared/services/slug.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService, TagsRepository, SlugService],
  exports: [TagsService, TagsRepository],
})
export class TagsModule {}