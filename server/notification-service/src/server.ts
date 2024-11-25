import { winstonLogger } from "@namdz608/jobber-shared";
import 'express-async-errors'
import { Logger } from "winston";
import http from 'http' 
import { config } from "@notifications/config"; //goi den bien ELASTIC_SEARCH_URL trong file config.ts ( cau hinh path trong tsconfig)
import { Application } from "express"
import { healthRoute } from "./routes";
import { checkConnection } from "./elasticsearch";

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

export function start(app: Application) {
    startServer(app)

    // goi den route http://localhost:4001/notification-health
    app.use('',healthRoute())
    startQueues()
    startElasticsearch()
}

async function startQueues(): Promise<void> {
    
}

function startElasticsearch(): void {
    checkConnection()
}

async function startServer(app: Application ): Promise<void> {
    try{
        const httpServer : http.Server = new http.Server(app)
        log.info(`worker with process id of ${process.pid} on notification server`)
        httpServer.listen(SERVER_PORT, ()=> {
            log.info(`notification server is start tin on port ${SERVER_PORT}`)
        })
    }catch(e){
        // log.log('error', 'Notification start server ', e)
    }
}

