import { Logger } from "winston";
import { winstonLogger } from "@namdz608/jobber-shared";
import {createConnection} from './connections'
import { Channel } from "amqplib";

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'authQueueConeections', 'debug')

export async function publishDirectMessage(
    channel: Channel,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
  ): Promise<void> {
    try {
      if (!channel) {
        channel = await createConnection() as Channel; //Nếu channel không được cung cấp (null hoặc undefined), hàm sẽ gọi createConnection() để tạo một kết nối mới và ép kiểu kết quả về Channel.
      }
      await channel.assertExchange(exchangeName, 'direct'); //assertExchange đảm bảo rằng exchange với tên exchangeName tồn tại và có kiểu là 'direct'. Nếu exchange chưa tồn tại, nó sẽ được tạo ra. Exchange kiểu 'direct' sẽ định tuyến thông điệp đến các hàng đợi dựa trên routingKey chính xác.
      channel.publish(exchangeName, routingKey, Buffer.from(message));//Sử dụng phương thức publish để gửi thông điệp đến exchange đã chỉ định với routingKey cụ thể. Thông điệp được chuyển đổi thành Buffer trước khi gửi.
      //thứ tự đúng là assertExchange trc r mới publish
      log.info(logMessage);
    } catch (error) {
      log.log('error', 'AuthService Provider publishDirectMessage() method error:', error);
    }
  }