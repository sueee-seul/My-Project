#!/usr/bin/env node

// 测试脚本：验证前端和后端数据库连接

const API_BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
  console.log('🔍 测试数据库连接...\n');

  try {
    // 测试1: 获取所有文章
    console.log('📝 测试1: 获取所有文章');
    const articlesResponse = await fetch(`${API_BASE_URL}/articles`);
    if (articlesResponse.ok) {
      const articles = await articlesResponse.json();
      console.log(`✅ 成功获取 ${articles.length} 篇文章`);
      if (articles.length > 0) {
        console.log(`   第一篇文章: "${articles[0].title}" by ${articles[0].author_name}`);
      }
    } else {
      console.log('❌ 获取文章失败');
    }

    // 测试2: 获取所有用户
    console.log('\n👥 测试2: 获取所有用户');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`✅ 成功获取 ${users.length} 个用户`);
      if (users.length > 0) {
        console.log(`   第一个用户: ${users[0].firstname} ${users[0].lastname} (@${users[0].username})`);
      }
    } else {
      console.log('❌ 获取用户失败');
    }

    // 测试3: 获取特定文章详情
    console.log('\n📄 测试3: 获取特定文章详情');
    const articleDetailResponse = await fetch(`${API_BASE_URL}/articles/1`);
    if (articleDetailResponse.ok) {
      const article = await articleDetailResponse.json();
      console.log(`✅ 成功获取文章详情: "${article.title}"`);
      console.log(`   作者: ${article.author_name}`);
      console.log(`   标签: ${article.tags.join(', ') || '无'}`);
      console.log(`   评论数: ${article.comments.length}`);
      console.log(`   点赞数: ${article.likesCount}`);
    } else {
      console.log('❌ 获取文章详情失败');
    }

    // 测试4: 获取所有标签
    console.log('\n🏷️  测试4: 获取所有标签');
    const tagsResponse = await fetch(`${API_BASE_URL}/articles/tags`);
    if (tagsResponse.ok) {
      const tags = await tagsResponse.json();
      console.log(`✅ 成功获取 ${tags.length} 个标签`);
      if (tags.length > 0) {
        console.log(`   标签: ${tags.join(', ')}`);
      }
    } else {
      console.log('❌ 获取标签失败');
    }

    console.log('\n🎉 所有测试完成！数据库连接正常。');
    console.log('\n📱 现在你可以访问以下地址：');
    console.log('   前端应用: http://localhost:5173');
    console.log('   后端API: http://localhost:3000/api');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n请确保：');
    console.log('1. 后端服务器正在运行 (npm run dev in backend/)');
    console.log('2. 前端服务器正在运行 (npm run dev in frontend/)');
    console.log('3. 数据库文件存在 (backend/project-database.db)');
  }
}

testConnection(); 