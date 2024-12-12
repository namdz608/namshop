import express, { Express } from 'express'
import { GatewayServer } from './server'


function initialize(): void {
    const app: Express = express()
    const server: GatewayServer = new GatewayServer(app) // mỗi khi tạo 1 oẹct class mới thì phải truyền cả các biến đc gọi trong constructor()
    server.start()
}

initialize()