import { BadRequestError, IAuthPayload, NotAuthorizedError } from '@namdz608/jobber-shared'
import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
require('dotenv').config();

class AuthMiddleWare {
    public verifyUser(req: Request, _res: Response, next: NextFunction): void {
        if (req.headers.authorization) {
            console.log('middleware from auth/svc/middleware')
            try {
                const token = req.headers.authorization.split(' ')[1]
                let payload = verify(token, `${process.env.JWT_TOKEN}`) as IAuthPayload //gán biến payload = IAuthPayload để cho cùng kiểu dữ liệu với req.currentUser là IAuthPayload
                req.currentUser = payload // biến req.currentUser chính là đc kế thừa từ lớp express xong cấu hình lại trong phần jobber-shared
            } catch (e) {
                throw new NotAuthorizedError('Token is not available. Please login again', 'GatewayService verify method session error')
            }
            next()
        }
        else {
            throw new NotAuthorizedError('Token is not available. Please login again', 'GatewayService verify method error')
        }
    }

    public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
        if (!req.currentUser) {
            throw new BadRequestError('token is invalid', 'gateway service checkauthen error')
        }
        next()
    }
}

export const authMiddleware: AuthMiddleWare = new AuthMiddleWare()