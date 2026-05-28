// src/infrastructure/config/seq.ts

import { Sequelize } from 'sequelize';

// 模拟 Sequelize 实例，实际项目中会连接到数据库
export const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // 关闭日志
});

// 可以在这里定义模型同步等操作，但对于模拟的 LocationRepository 来说不是必需的
// async function initializeDatabase() {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection to database has been established successfully.');
//     // await sequelize.sync({ force: true }); // 生产环境慎用
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }
// initializeDatabase();
