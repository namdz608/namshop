import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'

export function uploads(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> {
  return new Promise((resolve) => {

  })
 }; 