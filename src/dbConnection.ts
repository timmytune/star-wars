import {Sequelize} from "sequelize";
import { env } from "process";
const isTest = env.NODE_ENV === 'test'


let db_name: string = env.DB_NAME && !isTest ? env.DB_NAME : "test"
let db_username: string = env.DB_USER ? env.DB_USER : "test"
let db_password: string = env.DB_PASS ? env.DB_PASS : ""
let db_host: string = env.DB_HOST ? env.DB_HOST : "localhost"
let db_port: number = env.DB_PORT ? parseInt(env.DB_PORT) : 0




export const sequelize =  new Sequelize(db_name, db_username, db_password, {
    host: db_host,
    port: db_port,
    dialect:  'mysql'
  });