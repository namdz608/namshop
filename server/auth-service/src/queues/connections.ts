import client, { Channel, Connection } from 'amqplib';
require('dotenv').config();
import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authQueueConeections', 'debug')

export async function createConnection(): Promise<Channel | undefined> {
    try {
        const connection: Connection = await client.connect(`${process.env.RABBITMQ_ENDPOINT}`)
        const channel: Channel = await connection.createChannel()
        log.info('authQueueConeections server connect to queue successfully')
        closeConnection(channel,connection)
        return channel
    } catch (e) {
        log.log('error', 'authQueueConeections createConnection() method')
        return undefined
    }
}

function closeConnection(channel: Channel, connection: Connection): void {
    process.once('SIGINT',async ()=>{
        await channel.close()
        await connection.close()
    })
}

