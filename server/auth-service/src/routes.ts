import express,{ Application } from "express";
import { Health } from './services/check-graylog';
let router = express.Router();
export function appRoutes(app: Application) {
    // app.use('', () => Health.prototype.health)
    router.get('/check-graylog',Health.prototype.health)
    app.use('/',router)
}