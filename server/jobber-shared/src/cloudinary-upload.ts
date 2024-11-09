import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { error } from 'winston'

export function uploads(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(file, {
      public_id, overwrite, invalidate, resource_type: 'auto',
    },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          resolve(error)
        }
        else {
          resolve(result)
        }
      })
  })
};

export function videoUpload(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(file, {
      public_id, overwrite, invalidate, resource_type: 'video',
      chunk_size: 50000 //k muốn ng dùng upload quá 500MB
    },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          resolve(error)
        }
        else {
          resolve(result)
        }
      })
  })
}; // khởi tạo 1 function tên là videoUpload với các tham số truyền vào có cấu trúc dữ liệu, : Promise là sẽ hàm uploads sẽ phải trả về dạng là promise
// => return new Promise, hàm error, résult là các biến của thư viện

