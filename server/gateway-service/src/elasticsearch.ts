import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";
import { Client } from "@elastic/elasticsearch";
require('dotenv').config();

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');

class Elasticsearch {
    private elasticSearchClient: Client;

    constructor() {
        this.elasticSearchClient = new Client({
            node: `${process.env.ELASTIC_SEARCH_URL}`
        })
    }

    public async  checkConnections(): Promise<void> {
        let isConnected = false;
        while(!isConnected){
            log.info('Gateway Service is connecting')
            try{

            }catch(e){
                
            }
        }
    }
}

export const elasticsearch : Elasticsearch = new Elasticsearch()