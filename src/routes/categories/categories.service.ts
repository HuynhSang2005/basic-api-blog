import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './repository/categories.repo';
import { 
  CreateCategoryType,
  UpdateCategoryType,
  CategoryResponseType,
  CategoryListType,
  CategoryQueryType
} from './model/categories.model';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async createCategory(data: CreateCategoryType): Promise<CategoryResponseType> {
    return await this.categoriesRepository.createCategory(data);
  }

  async getCategories(query: CategoryQueryType): Promise<CategoryListType> {
    return await this.categoriesRepository.getCategories(query);
  }

  async getCategoryById(id: number): Promise<CategoryResponseType> {
    return await this.categoriesRepository.getCategoryById(id);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseType> {
    return await this.categoriesRepository.getCategoryBySlug(slug);
  }

  async updateCategory(id: number, data: UpdateCategoryType): Promise<CategoryResponseType> {
    return await this.categoriesRepository.updateCategory(id, data);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.categoriesRepository.deleteCategory(id);
  }
}