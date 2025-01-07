import express,{ Application } from "express";
import { Health } from './services/check-graylog';
import { create } from "./controller/signup";
let router = express.Router();
export function appRoutes(app: Application) {
    // app.use('', () => Health.prototype.health)
    router.get('/check-graylog',Health.prototype.health)
    router.post('/signup',create)
    app.use('/api/v1/auth',router)
}