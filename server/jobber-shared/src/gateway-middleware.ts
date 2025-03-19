import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from './error-handler';

const tokens: string[] = ['auth', 'seller', 'gig', 'search', 'buyer', 'message', 'order', 'review']

export async function verifyGatewayRequest(req: Request, _res: Response, next: NextFunction) {
    if (!req.headers?.gatewayToken) {
        throw new NotAuthorizedError('invalid request', 'verifyGatewayRequest() method') //nếu headers k có biến gatewaytoken sẽ trả ra như kia
    }
    const token: string = req.headers?.gatewayToken as string
    if (!token) {
        throw new NotAuthorizedError('invalid request', 'verifyGatewayRequest() method')
    }
    try {
        const payload: { id: string, iat: number } = JWT.verify(token, 'H4eyprB4x0bA5Kw') as { id: string, iat: number }
        // tạo 1 biến payload có kiểu dữ liệu là {id:string , iat: number } gán cho biến JWT và JWT.verify(token, '') trả về kiểu dữ liệu
        // là any nên có thể gán cho là as {id:string , iat: number } 
        console.log('payload',payload)
        if (!token.includes(payload.id)) {
            throw new NotAuthorizedError('invalid request', 'verifyGatewayRequest() method')
        }
    } catch (e) {
        throw new NotAuthorizedError('invalid request', 'verifyGatewayRequest() method')
    }
    next()
}




