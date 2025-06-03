import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('Blog API Documentation')
    .setDescription('Complete Blog API with authentication, posts, categories, tags, and user management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter `JWT` token',
        in: 'header',
      },
      'JWT-auth', 
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Posts', 'Blog posts management')
    .addTag('Categories', 'Blog categories management')
    .addTag('Tags', 'Blog tags management')
    .addTag('Users', 'User profile and admin management')
    .addServer('http://localhost:3000', 'Development server')
    .build();

 

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: '/api-docs-json',
    swaggerOptions: {
      persistAuthorization: true, 
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customfavIcon: '/favicon.ico',
    customSiteTitle: 'Blog API Docs',
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`📚 Swagger docs available at: http://localhost:3000/api-docs`);

  // Display server information using console.table
  // displayServerInfo(port);
}

function displayServerInfo(port: string | number) {
  console.log('\n🚀 BLOG BACKEND SERVER STARTED SUCCESSFULLY\n');
  
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