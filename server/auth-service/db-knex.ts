import knex, { Knex } from 'knex';
import  config  from './knexfile';

const knexConfig: Knex.Config = config.environment;

const db = knex(knexConfig);

export default db;