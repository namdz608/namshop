import express, { Application } from "express";
import { Health } from './services/check-graylog';
import { create } from "./controller/signup";
import { renderURLimage } from './controller/render-image'
let router = express.Router();
export function appRoutes(app: Application) {
    router.get('/check-graylog', Health.prototype.health)
    router.post('/signup', create)
    router.get('/rx/url/*', (_req, _res, next) => {
        console.log('Đã nhận được yêu cầu tới /rx');
        next();
    }, renderURLimage)
    app.use('/api/v1/auth', router)
}