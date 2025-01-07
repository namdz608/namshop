import { Logger } from "winston";
import { Application, json, urlencoded, Request, Response, NextFunction } from 'express'
import { winstonLogger, CustomError, IErrorResponse, } from "@namdz608/jobber-shared";
import cookieSession from 'cookie-session';
import cors from 'cors'
import hpp from 'hpp' //hpp là một middleware giúp bảo vệ ứng dụng web của bạn khỏi các lỗ hổng bảo mật liên quan đến HTTP Parameter Pollution, 
//Nó kiểm tra và ngăn chặn các tham số trùng tên trong query string của HTTP request.
import helmet from 'helmet'//helmet là một package rất phổ biến trong Node.js được sử dụng để cải thiện bảo mật của ứng dụng web bằng cách thêm các header HTTP bảo mật vào các phản hồi (response)
import compression from "compression";
import { StatusCodes } from 'http-status-codes';
import 'express-async-errors';
import http from 'http'
require('dotenv').config();
import {elasticsearch} from './elasticsearch'
import { appRoutes } from "./routes";
import { axiosAuthInstance } from "./services/api/auth.service";


const SERVER_PORT = 4000
const log: Logger = winstonLogger('http://localhost:9200', 'apiGatewayServer', 'debug')

export class GatewayServer {
    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public start(): void {
        this.securityMiddleware(this.app)
        this.standardMiddleware(this.app)
        this.routesMiddleware(this.app)
        this.errorHandler(this.app)
        this.startElasticseach()
        this.startServer(this.app)
    }

    private securityMiddleware(app: Application): void {
        app.set('trust proxy', 1)//Thiết lập ứng dụng tin cậy proxy phía trước (thường là load balancer, reverse proxy như Nginx hoặc Cloudflare).
        app.use(
            cookieSession({
                name: 'session',// Tên của cookie chứa session, trong trường hợp này là session.
                keys: [`${process.env.SECRET_KEY_ONE}`, `${process.env.SECRET_KEY_TWO}`],//Mảng khóa để ký và giải mã cookie
                maxAge: 25 * 7 * 3600000,//Thời gian tồn tại của session, được quy đổi từ giờ thành mili giây (7 ngày).
                secure: process.env.NODE_ENV !== 'development' //nếu biến node env mà khác developnent => true , còn giống development trả về false
            })
        )
        app.use(hpp())//Middleware để ngăn chặn HTTP Parameter Pollution
        app.use(helmet())//Middleware của Helmet giúp bảo mật HTTP headers.
        app.use(cors({ //Thiết lập middleware CORS (Cross-Origin Resource Sharing) để kiểm soát quyền truy cập từ các miền khác.
            origin: '*',
            credentials: true,// cho phép gửi cookie từ client khi yêu cầu từ các miền khác.
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']//Các phương thức HTTP được phép (GET, POST, PUT, DELETE, OPTIONS).
        }))

        app.use((req: Request, _res: Response, next: NextFunction) => {
            if (req.session?.jwt) {
              axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosMessageInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosOrderInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            //   axiosReviewInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
            }
            next();
          });
    }

    private startElasticseach(): void {
        elasticsearch.checkConnections()
    }

    private standardMiddleware(app: Application): void {
        app.use(compression())//Giúp cải thiện hiệu suất mạng và tăng tốc độ tải trang, đặc biệt với dữ liệu lớn như JSON hoặc HTML.
        app.use(json({ limit: '200mb' })); // Middleware của Express để parse request body với định dạng JSON.
        app.use(urlencoded({ extended: true, limit: '200mb' }));//Đặt giới hạn kích thước tối đa của request body JSON là 200MB. Nếu vượt quá, ứng dụng sẽ trả lỗi.
    }

    private routesMiddleware(app:Application): void {
        appRoutes(app) // gọi đến hàm appRoutes() trong file routes.ts => các file trong folder routes => goij đến các file trong folder controller
    }

    private errorHandler(app: Application): void {
        //Đây là một middleware được định nghĩa để xử lý mọi yêu cầu đến bất kỳ endpoint nào của ứng dụng, tức là bất kỳ đường dẫn (URL) nào mà ứng dụng nhận được.
        //* có nghĩa là nó sẽ áp dụng cho tất cả các route, bất kể phương thức HTTP (GET, POST, PUT, DELETE, v.v.).
        app.use('*', (req: Request, res: Response, next: NextFunction) => {
            //req.protocol: Lấy giao thức (protocol) của request, ví dụ: http hoặc https.
            //req.get('host'): Lấy phần tên miền hoặc địa chỉ IP của server
            //req.originalUrl: Lấy đường dẫn gốc của URL mà client gửi đến (bao gồm cả query parameters nếu có). Ví dụ: /users?id=123.
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            log.log('error', `${fullUrl} endpoint does not exist.`, '');
            //res.status(StatusCodes.NOT_FOUND): Đặt mã trạng thái HTTP là 404 (Not Found), nghĩa là tài nguyên (endpoint) mà client yêu cầu không tồn tại.
            res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.' });
            //next() là một hàm mà Express gọi để chuyển sang middleware hoặc handler tiếp theo trong chuỗi.
            next();
        });

        app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
            if (error instanceof CustomError) {
                log.log('error', `GatewayService ${error.comingFrom}:`, error);
                res.status(error.statusCode).json(error.serializeErrors());
            }

            next();
        });
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app)
            this.startHttpServer(httpServer)
        } catch (e) {
            log.log('error', 'Gateway service startServer() method error', e)
        }
    }

    private async startHttpServer(httpServer: http.Server): Promise<void> {
        try {
            log.info(`Gateway server has started with process id ${process.pid}`);
            httpServer.listen(SERVER_PORT, () => {
                log.info(`Gateway server running on port ${SERVER_PORT}`);
            })
        } catch (e) {
            log.log('error', 'Gateway service startHttpServer() method error', e)
        }
    }
}

