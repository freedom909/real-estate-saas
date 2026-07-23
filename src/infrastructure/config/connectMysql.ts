import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

let pool;
const db = process.env.DB_NAME
const user = process.env.DB_USER


const connectMysql = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: user,

      database: db,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Connected to the mysql database on port 3306');
  }
  return pool;
};

export default connectMysql;

