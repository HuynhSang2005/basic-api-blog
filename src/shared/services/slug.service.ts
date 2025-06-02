import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  generateSlug(text: string): string {
    return slugify(text, {
      lower: true,      // Chuyển về chữ thường
      strict: true,     // Xóa các ký tự đặc biệt
      locale: 'vi',     // Hỗ trợ tiếng Việt
      trim: true        // Xóa khoảng trắng đầu cuối
    });
  }

  // Tạo slug unique bằng cách thêm số nếu trùng
  async generateUniqueSlug(
    text: string, 
    checkExistsFn: (slug: string) => Promise<boolean>
  ): Promise<string> {
    let baseSlug = this.generateSlug(text);
    let slug = baseSlug;
    let counter = 1;

    while (await checkExistsFn(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}