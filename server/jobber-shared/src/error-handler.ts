//file này để xử lý các lỗi trả về

import { StatusCodes } from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  comingFrom: string;
  serializeErrors(): IError;  // Hàm này bắt buộc trả về dạng IErorrs
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
  comingFrom: string;
}

// Xuất ra một lớp trừu tượng `CustomError` mở rộng từ lớp `Error`
export abstract class CustomError extends Error {
  // Hai thuộc tính trừu tượng bắt buộc phải được khai báo trong các lớp con
  abstract statusCode: number;
  abstract status: string;
  comingFrom: string;

  // Hàm khởi tạo nhận vào hai tham số: `message` và `comingFrom`
  constructor(message: string, comingFrom: string) {
    super(message);
    this.comingFrom = comingFrom;
  }

  serializeErrors(): IError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      comingFrom: this.comingFrom,
    }
  }
}

//các class dưới kế thừa từ abtracst nên có thể tùy chỉnh biến statusCode hoặc status theo ý muốn
export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class FileTooLargeError extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class ServerError extends CustomError {
  statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  status = 'error';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}