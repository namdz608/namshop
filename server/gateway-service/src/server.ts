import { Logger } from "winston";
import { Application } from 'express'
import { winstonLogger } from "@namdz608/jobber-shared";
import cookieSession from 'cookie-session';
import cors from 'cors'
import hpp from 'hpp'
import helmet from 'helmet'

const SERVER_PORT = 4000
const log: Logger = winstonLogger('', 'apiGatewayServer', 'debug')

export class GatewayServer {
    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public start(): void {

    }

    private securityMiddleware(app: Application): void {
        app.set('trust proxy', 1)
        app.use(
            cookieSession({
                name:'session',
                keys:[],
                maxAge: 25*7*3600000,
                secure: false
            })
        )
        app.use(hpp())
        app.use(helmet())
        app.use(cors({
            origin: '',
            credentials: true,
            methods: ['GET', 'POST','PUT','DELETE','OPTIONS'] 
        }))
    }
}