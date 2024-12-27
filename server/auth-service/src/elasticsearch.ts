import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";
import { Client } from "@elastic/elasticsearch";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
require('dotenv').config();

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');

const elasticSearchClient = new Client({
    node: `${process.env.ELASTIC_SEARCH_URL}`
});

export async function checkConnections(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
        log.info('AuthService Service is connecting')
        try {
            const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({})
            log.info(`AuthService ElasticSearch health status - ${health.status}`);
            isConnected = true;
        } catch (e) {
            log.error('Connection to Elastichsearch failed, Retrying...')
            log.log('eror', 'AuthService checkConnections() method error', e)
        }
    }
}
