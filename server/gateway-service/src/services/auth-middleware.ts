import { BadRequestError, IAuthPayload, NotAuthorizedError } from '@namdz608/jobber-shared'
import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
require('dotenv').config();

class AuthMiddleWare {
    public verifyUser(req: Request, _res: Response, next: NextFunction): void {
        if (!req.session?.jwt) {
            throw new NotAuthorizedError('Token is not available. Please login again', 'GatewayService verify method error')
        }
        try{
            let payload = verify(req.session?.jwt, `${process.env.JWT_TOKEN}`) as IAuthPayload
            req.currentUser = payload
        }catch(e){
            throw new NotAuthorizedError('Token is not available. Please login again', 'GatewayService verify method session error')
        }
        next()
    }

    public checkAuthentication(req: Request, _res: Response, next: NextFunction):void {
        if(!req.currentUser){
            throw new BadRequestError('token is invalid','gateway service checkauthen error')
        }
        next()
    }
}

export const authMiddleware: AuthMiddleWare = new AuthMiddleWare()