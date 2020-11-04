import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NATSConfigService } from './config/NATSConfigService';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './factory/winstonConfig';
import { InjectMetadataInterceptor } from './interceptors/InjectMetadataInterceptor';

async function bootstrap() {
  const logger: LoggerConfig = LoggerConfig.getInstance();
  const winstonLogger = WinstonModule.createLogger(logger.console());

  const context = await NestFactory.createApplicationContext(AppModule.register(), {
    logger: winstonLogger
  });

  const natsConfigService : NATSConfigService = context.get(NATSConfigService);

  context.close();

  const app = await NestFactory.createMicroservice(AppModule.register(), {
    ...natsConfigService.getNATSConfig,
    logger: winstonLogger
  });

  const globalInterceptors = [
    new InjectMetadataInterceptor()
  ];

  app.useGlobalInterceptors(...globalInterceptors);

  app.listen(() => winstonLogger.log('Microservice ms-test running'));

}
bootstrap();