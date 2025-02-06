import express, { Application } from "express";
import { Health } from './services/check-graylog';
import { create } from "./controller/signup";
import { renderURLimage } from './controller/render-image'
import { read } from "./controller/signin";
import { update } from "./controller/verify-email";
import { forgotPassword, resetPassword, changePassword } from "./controller/password";
import { read_user, resendEmail } from "./controller/current-user";
import { token } from "./controller/refresh-token";

let router = express.Router();
export function appRoutes(app: Application) {
    router.get('/check-graylog', Health.prototype.health)
    router.post('/signup', create)
    router.post('/signin', read)
    router.put('/verify-email', update)
    router.put('/forgot-password', forgotPassword)
    router.put('/reset-password/:token', resetPassword)
    router.put('/reset-password', changePassword)
    router.get('/currentuser',read_user)
    router.post('/resend-email', resendEmail)
    router.get('/refresh-token/:username', token)
    router.get('/rx/url/*', (_req, _res, next) => {
        console.log('Đã nhận được yêu cầu tới /rx');
        next();
    }, renderURLimage)
    app.use('/api/v1/auth', router)
}