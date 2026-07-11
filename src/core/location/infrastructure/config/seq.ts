import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(

process.env.MYSQL_DATABASE || "saas",

process.env.MYSQL_USER || "root",

process.env.MYSQL_PASSWORD || "princess",

{

host: process.env.MYSQL_HOST || "localhost",

port: Number(process.env.MYSQL_PORT || 3307),

dialect: "mysql",

logging: console.log,

}

);