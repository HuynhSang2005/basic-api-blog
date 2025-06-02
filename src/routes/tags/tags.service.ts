import { Injectable } from '@nestjs/common';
import { TagsRepository } from './repository/tags.repo';
import { 
  CreateTagType,
  UpdateTagType,
  TagResponseType,
  TagListType,
  TagQueryType,
  PopularTagsType
} from './model/tags.model';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagsRepository: TagsRepository,
  ) {}

  async createTag(data: CreateTagType): Promise<TagResponseType> {
    return await this.tagsRepository.createTag(data);
  }

  async getTags(query: TagQueryType): Promise<TagListType> {
    return await this.tagsRepository.getTags(query);
  }

  async getTagById(id: number): Promise<TagResponseType> {
    return await this.tagsRepository.getTagById(id);
  }

  async getTagBySlug(slug: string): Promise<TagResponseType> {
    return await this.tagsRepository.getTagBySlug(slug);
  }

  async updateTag(id: number, data: UpdateTagType): Promise<TagResponseType> {
    return await this.tagsRepository.updateTag(id, data);
  }

  async deleteTag(id: number): Promise<void> {
    await this.tagsRepository.deleteTag(id);
  }

  async getPopularTags(limit: number = 10): Promise<PopularTagsType> {
    return await this.tagsRepository.getPopularTags(limit);
  }

  async getAllTagsForDropdown(): Promise<TagResponseType[]> {
    return await this.tagsRepository.getAllTagsForDropdown();
  }
}