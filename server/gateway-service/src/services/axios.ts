import axios from 'axios'
import {sign } from 'jsonwebtoken'//Được dùng để tạo JWT (JSON Web Token), thường để xác thực hoặc bảo mật.
require('dotenv').config();

export class AxiosService { //Lớp AxiosService giúp chuẩn hóa cách tạo các instance axios khi giao tiếp với nhiều API khác nhau. Nó tự động thêm JWT vào headers nếu cần, giúp việc xác thực API trở nên dễ dàng hơn.
    public axios: ReturnType<typeof axios.create> //ReturnType<typeof axios.create> - Đây là kiểu trả về của hàm axios.create(), tương ứng với một instance của Axios (AxiosInstance).
    constructor(baseUrl: string, serviceName: string){
        this.axios = this.axiosCreateInstance(baseUrl, serviceName);
    }
    public axiosCreateInstance(baseUrl: string, serviceName?: string): ReturnType<typeof axios.create> { // hàm trả về dạng ReturnType<typeof axios.create> để có thể gán với biến axios
        let requestGatewayToken = '';
        if (serviceName) {
          requestGatewayToken = sign({ id: serviceName }, `${process.env.GATEWAY_JWT_TOKEN}`); //Payload của JWT là { id: serviceName }. Secret để ký JWT được lấy từ biến môi trường GATEWAY_JWT_TOKEN.
        }
        const instance: ReturnType<typeof axios.create> = axios.create({
          baseURL: baseUrl, //baseURL: URL cơ bản để thực hiện yêu cầu HTTP.
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            gatewayToken: requestGatewayToken //gatewayToken: Dùng cho xác thực, nếu được cung cấp.
          },
          withCredentials: true //Cho phép gửi cookie trong các yêu cầu (hữu ích cho xác thực session).
        });
        return instance;
      }

}

// Vi du cach su dung lop
//=======================
// const apiService = new AxiosService('https://api.example.com', 'myService');
// apiService.axios.get('/endpoint').then(response => {
//     console.log(response.data);
// });

//Instance axios này sẽ tự động có baseURL và header gatewayToken.