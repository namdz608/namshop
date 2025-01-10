import { Application } from "express";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";

const BASE_PATH = '/api/gateway/v1';
export const appRoutes = (app: Application) => {
    app.use('', healthRoutes.routes())
    app.use(BASE_PATH, authRoutes.routes());
}