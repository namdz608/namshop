import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes'

export class Health {
    public health(_req: Request, res: Response) { //Dấu gạch dưới _ ở trước tên req ngụ ý rằng nó không được sử dụng trong hàm.
        res.status(StatusCodes.OK).send('Notification services is healthy and OK')
    }
}