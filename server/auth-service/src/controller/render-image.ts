import { Request, Response } from "express";


export async function renderURLimage(req: Request, res: Response): Promise<void> {
    try {
        // Lấy URL từ query string
        // const imageUrl = req.query.url as string;

        const imageUrl = `https://${req.params[0]}`;

        if (!imageUrl) {
            res.status(400).send('URL hình ảnh không được cung cấp.');
        }
        // const imagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
        // if (!imagePattern.test(imageUrl)) {
        //     res.status(400).send('Đường dẫn hình ảnh không hợp lệ.');
        // }
        const response = await fetch(imageUrl);

        if (!response.ok) {
            res.status(500).send('Không thể lấy hình ảnh từ URL đã cho.');
        }
        // Đọc toàn bộ dữ liệu từ response.body thành arrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Gửi buffer hình ảnh ra client
        const contentType: string = response.headers.get('content-type') || 'application/octet-stream';
        
        // Chỉ thiết lập header và gửi dữ liệu một lần
        res.set('Content-Type', contentType);
        res.send(buffer);
    }
    catch (e) {
        console.error('Lỗi server:', e);
        if (!res.headersSent) {  // Kiểm tra xem header đã được gửi chưa
            res.status(500).send('Đã xảy ra lỗi khi tải hình ảnh.');
        }
    }
}
