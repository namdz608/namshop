import axios from 'axios';
import { AxiosService } from '../../services/axios';
require('dotenv').config();

export let axiosAuthInstance: ReturnType<typeof axios.create>;
class AuthService{
    axiosService: AxiosService;

    constructor() {
      this.axiosService = new AxiosService(`${process.env.AUTH_BASE_URL}/api/v1/auth`, 'auth');//Khởi Tạo AxiosService: Tạo một instance của AxiosService với cấu hình cụ thể cho dịch vụ xác thực.
      axiosAuthInstance = this.axiosService.axios; //Gán thuộc tính axios từ axiosService vào biến axiosAuthInstance đã khai báo trước đó. Điều này cho phép các module khác sử dụng axiosAuthInstance để thực hiện các yêu cầu HTTP đã được cấu hình sẵn trong AxiosService.
    }
}

export const authService: AuthService = new AuthService();