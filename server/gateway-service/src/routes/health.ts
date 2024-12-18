import { Health } from '@notifications/controllers/health';
import express, { Router } from 'express'

class HealthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router()
    }
    public routes(): Router {
        this.router.get('/gateway-health',Health.prototype.health)// vì Express mặc định chỉ truyền 2 tham số là req và res vào handler nên k cần truyền tham số req, res, còn nếu thêm biến id trong
                                                                //hàm health thì sẽ bị lỗi
        return this.router
    }
}

export const healthRoutes = new HealthRoutes()