import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
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
                const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({})
                log.info(`GatewayService ElasticSearch health status - ${health.status}`);
                isConnected = true;
            }catch(e){
                log.error('Connection to Elastichsearch failed, Retrying...')
                log.log('eror','Gateway checkConnections() method error', e)
            }
        }
    }
}

export const elasticsearch : Elasticsearch = new Elasticsearch()