import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

let pool;
const db = process.env.DB_NAME
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD


const connectMysql = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: user,
      password: password,
      database: db,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log(`Connected to the mysql database at ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
  }
  return pool;
};

export default connectMysql;

