import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Make sure this is at the top

const sequelize = new Sequelize(
  process.env.DB_NAME || 'east',

  process.env.DB_USER || 'root',  // Default username and password for MySQL,
  process.env.DB_PASSWORD || 'princess',
  {
    host: process.env.DB_HOST || 'localhost',
    port: (process.env.DB_PORT || 3307 ) as number,
    dialect: 'mysql',
    logging: console.log
  }
);

export default sequelize;
