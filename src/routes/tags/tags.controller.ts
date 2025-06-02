import { 
  Body, 
  Controller, 
  Delete,
  Get, 
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { 
  CreateTagDto,
  UpdateTagDto,
  TagResponseDto,
  TagListDto,
  TagQueryDto,
  PopularTagsDto
} from './dto/tags.dto';
import { Auth } from '../../common/decorators/validators/auth-guard/auth.decorators';
import { AuthType } from '../../shared/constants/auth.constant';
import { AdminOnlyAccess } from '../../common/decorators/validators/auth-guard/combined.decorators'; // ← FIX IMPORT

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI TẠO ĐƯỢC TAG
  @ZodSerializerDto(TagResponseDto)
  async createTag(@Body() createData: CreateTagDto) {
    return await this.tagsService.createTag(createData);
  }

  @Get()
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(TagListDto)
  async getTags(@Query() query: TagQueryDto) {
    return await this.tagsService.getTags(query);
  }

  @Get('popular')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(PopularTagsDto)
  async getPopularTags(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return await this.tagsService.getPopularTags(limitNumber);
  }

  @Get('dropdown')
  @Auth([AuthType.None]) // Public route - cho dropdown selection
  async getAllTagsForDropdown() {
    return await this.tagsService.getAllTagsForDropdown();
  }

  @Get(':id')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(TagResponseDto)
  async getTagById(@Param('id', ParseIntPipe) id: number) {
    return await this.tagsService.getTagById(id);
  }

  @Get('slug/:slug')
  @Auth([AuthType.None]) // Public route
  @ZodSerializerDto(TagResponseDto)
  async getTagBySlug(@Param('slug') slug: string) {
    return await this.tagsService.getTagBySlug(slug);
  }

  @Put(':id')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI CẬP NHẬT ĐƯỢC TAG
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TagResponseDto)
  async updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateTagDto
  ) {
    return await this.tagsService.updateTag(id, updateData);
  }

  @Delete(':id')
  @AdminOnlyAccess() // ← CHỈ ADMIN MỚI XÓA ĐƯỢC TAG
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    await this.tagsService.deleteTag(id);
  }
}