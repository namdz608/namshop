//https://www.npmjs.com/package/winston#usage

import winston, { Logger } from "winston";
import { ElasticsearchTransformer, ElasticsearchTransport, LogData, TransformedData } from "winston-elasticsearch";

const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData)
}

export const winstonLogger = (elasticsearchNode: string, name: string, level: string): Logger => {
  const options = {
    console: {
      level,
      handleExepcions: true,
      json: false,
      colorize: true
    },
    elasticsearch: {
      transformer: esTransformer,
      clientOps: {
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false
      }
    }

  }

  const elasticsearchTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticsearch)
  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [new winston.transports.Console(options.console), elasticsearchTransport]
  })
  return logger
} // Hàm sẽ lấy thông tin log ra , transport data và gửi lên elasticsearch 