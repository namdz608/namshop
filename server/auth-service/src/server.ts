import { Logger } from "winston";
import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from "@namdz608/jobber-shared";
import { Application, json, NextFunction, Request, Response, urlencoded } from "express";
import cors from 'cors'
import http from 'http';
import { verify } from 'jsonwebtoken'
import hpp from 'hpp' //hpp là một middleware giúp bảo vệ ứng dụng web của bạn khỏi các lỗ hổng bảo mật liên quan đến HTTP Parameter Pollution, 
//Nó kiểm tra và ngăn chặn các tham số trùng tên trong query string của HTTP request.
import helmet from 'helmet'//helmet là một package rất phổ biến trong Node.js được sử dụng để cải thiện bảo mật của ứng dụng web bằng cách thêm các header HTTP bảo mật vào các phản hồi (response)
import compression from "compression";
import { appRoutes } from './routes'
require('dotenv').config();
import {createConnection} from './queues/connections'
import { checkConnections } from './elasticsearch'
import { Channel } from "amqplib";

const SERVER_PORT = 4002;
const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authElastich server', 'debug')

export let authChannel: Channel;

export function start(app: Application): void {
    securityMiddleware(app);
    standardMiddleware(app);
    routeMiddleware(app);// dùng để gọi các route endpoints
    startQueues();
    startElasticSearch();
    errorHandler(app);
    startServer(app);
}

function securityMiddleware(app: Application): void {
    app.set('trust proxy', 1)//Thiết lập ứng dụng tin cậy proxy phía trước (thường là load balancer, reverse proxy như Nginx hoặc Cloudflare).
    app.use(hpp())//Middleware để ngăn chặn HTTP Parameter Pollution
    app.use(helmet())//Middleware của Helmet giúp bảo mật HTTP headers.
    app.use(cors({ //Thiết lập middleware CORS (Cross-Origin Resource Sharing) để kiểm soát quyền truy cập từ các miền khác.
        origin: process.env.API_GATEWAY_URL, // Chỉ định domain (nguồn gốc) được phép truy cập tài nguyên từ server.
        credentials: true,// cho phép gửi cookie từ client khi yêu cầu từ các miền khác.
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']//Các phương thức HTTP được phép (GET, POST, PUT, DELETE, OPTIONS).
    }))
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            console.log('token from auth-service', token)
            const payload: IAuthPayload = verify(token, `${process.env.JWT_TOKEN}`) as IAuthPayload //gán biến payload = IAuthPayload để cho cùng kiểu dữ liệu với req.currentUser là IAuthPayload
            req.currentUser = payload // biến req.currentUser chính là đc kế thừa từ lớp express xong cấu hình lại trong phần jobber-shared
        }
        next()
    })
}
function standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));

}

function routeMiddleware(app: Application): void {
    appRoutes(app)
}

async function startQueues(): Promise<void> {
    authChannel= await createConnection() as Channel
}

function startElasticSearch(): void {
    checkConnections()
}

function errorHandler(app: Application) {
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
        if (error instanceof CustomError) {
            log.log('error', `GatewayService ${error.comingFrom}:`, error);
            res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
    });
}

function startServer(app: Application) {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`Authentication server has started with process id ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Authentication server running on port ${SERVER_PORT}`);
        });
    } catch (e) {
        log.log('error', 'AuthService startServer() method error:', e);
    }
}

