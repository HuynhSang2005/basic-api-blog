import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './repository/categories.repo';
import { SlugService } from 'src/shared/services/slug.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, SlugService],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}