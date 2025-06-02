import { PrismaClient, UserRole, UserStatus, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Tạo Admin User
  const adminPassword = await bcrypt.hash('admin123', 12); // password admin nè
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@blog.com',
      password: adminPassword,
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Tạo Author User
  const authorPassword = await bcrypt.hash('author123', 12);
  const author = await prisma.user.upsert({
    where: { email: 'author@blog.com' },
    update: {},
    create: {
      username: 'author',
      email: 'author@blog.com',
      password: authorPassword,
      fullName: 'Blog Author',
      role: UserRole.AUTHOR,
      status: UserStatus.ACTIVE,
    },
  });

  // Tạo Regular User
  const userPassword = await bcrypt.hash('user123', 12);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@blog.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@blog.com',
      password: userPassword,
      fullName: 'Regular User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    },
  });

  // Tạo Categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'All about technology and programming',
      color: '#3B82F6',
    },
  });

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Lifestyle and personal development',
      color: '#10B981',
    },
  });

  // Tạo Tags
  const jsTag = await prisma.tag.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: {
      name: 'JavaScript',
      slug: 'javascript',
    },
  });

  const nestjsTag = await prisma.tag.upsert({
    where: { slug: 'nestjs' },
    update: {},
    create: {
      name: 'NestJS',
      slug: 'nestjs',
    },
  });

  const reactTag = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: {
      name: 'React',
      slug: 'react',
    },
  });

  // Tạo Sample Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with NestJS',
      slug: 'getting-started-with-nestjs',
      content: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications...',
      excerpt: 'Learn the basics of NestJS framework',
      status: PostStatus.PUBLISHED,
      authorId: author.id,
      categoryId: techCategory.id,
      publishedAt: new Date(),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'React Best Practices 2025',
      slug: 'react-best-practices-2025',
      content: 'Here are the top React best practices for 2025...',
      excerpt: 'Modern React development practices',
      status: PostStatus.DRAFT,
      authorId: author.id,
      categoryId: techCategory.id,
    },
  });

  // Thêm Tags vào Posts
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: nestjsTag.id },
      { postId: post1.id, tagId: jsTag.id },
      { postId: post2.id, tagId: reactTag.id },
      { postId: post2.id, tagId: jsTag.id },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log('\n📊 Created:');
  console.log(`👤 Admin: admin@blog.com / admin123`);
  console.log(`✍️  Author: author@blog.com / author123`);
  console.log(`👥 User: user@blog.com / user123`);
  console.log(`📁 Categories: ${techCategory.name}, ${lifestyleCategory.name}`);
  console.log(`🏷️  Tags: ${jsTag.name}, ${nestjsTag.name}, ${reactTag.name}`);
  console.log(`📝 Posts: ${post1.title}, ${post2.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });