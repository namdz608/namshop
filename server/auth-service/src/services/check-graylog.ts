import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes'
const graylog2 = require('graylog2');

const logger = new graylog2.graylog({
    servers: [{ host: '3.21.37.10', port: 514 }] // Replace the "host" per your Graylog domain
  });

export class Health {
    public health(_req: Request, res: Response) { //Dấu gạch dưới _ ở trước tên req ngụ ý rằng nó không được sử dụng trong hàm.
        logger.log('Simple message example');
        res.status(StatusCodes.OK).send('Notification services is healthy and OK')
    }
}