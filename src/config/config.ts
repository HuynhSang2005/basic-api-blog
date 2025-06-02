import { z } from 'zod';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({
  path: '.env',
})

// Kiểm tra file .env có tồn tại không
if (!fs.existsSync(path.resolve('.env'))) {
  console.error('❌ File .env không tồn tại.');
  process.exit(1);
}

// Schema validation cho environment variables
const configSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL không được để trống'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET không được để trống'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET không được để trống'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1, 'ACCESS_TOKEN_EXPIRES_IN không được để trống'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, 'REFRESH_TOKEN_EXPIRES_IN không được để trống'),
});

const configServer = configSchema.safeParse(process.env);

if(!configServer.success) {
  console.log('Các giá trị trong file .env không hợp lệ:');
  console.log(configServer.error.format())
  process.exit(1);
}

const envConfig = configServer.data;
export default envConfig;
