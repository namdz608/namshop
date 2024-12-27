import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";
import { Sequelize } from 'sequelize';
require('dotenv').config();

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const sequelize: Sequelize = new Sequelize(process.env.MYSQL_DB!,  {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      multipleStatements: true
    }
  });

export async function databaseConnection(): Promise<void> {
    try{
        await sequelize.authenticate()
        log.info('Auth Service Mysql db has been establish')
    }catch(e){
        log.error('Auth Service - Unable to connect to db')
        log.log('error', 'AuthService connection err',e)
    }
}