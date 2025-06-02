import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Display server information using console.table
  displayServerInfo(port);
}

function displayServerInfo(port: string | number) {
  console.log('\n🚀 ECOMMERCE BACKEND SERVER STARTED SUCCESSFULLY\n');
  
  // Extract database port from DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || '';
  const dbPortMatch = databaseUrl.match(/:(\d+)\//);
  const dbPort = dbPortMatch ? dbPortMatch[1] : 'You must check the database URL';
  
  // Server Information Table
  const serverInfo = {
    'Environment': process.env.NODE_ENV ?? 'development',
    'Server Port': port.toString(),
    'Database Port': dbPort,
    'Started At': new Date().toLocaleString('vi-VN'),
    'Node Version': process.version,
    'Platform': process.platform,
    // 'Server URL': `http://localhost:${port}`,
    // 'Database URL': `postgresql://localhost:${dbPort}`,
    'Process ID': process.pid.toString(),
    'Memory Usage': `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
  };
  console.table(serverInfo);
  // console.log('🎉 Backend server is ready to handle requests!\n');
}

bootstrap();