import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NATSConfigService } from './config/NATSConfigService';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './factory/winstonConfig';

async function bootstrap() {
  const logger: LoggerConfig = LoggerConfig.getInstance();
  const winstonLogger = WinstonModule.createLogger(logger.console());

  const app = await NestFactory.create(
    AppModule.register(),
    {
      cors: true,
      logger: winstonLogger
    }
  );

  const natsConfigService : NATSConfigService = app.get(NATSConfigService);
  const configService : ConfigService = app.get<ConfigService>(ConfigService);

  app.connectMicroservice({
    ...natsConfigService.getNATSConfig
  });

  const port = configService.get<number>('PORT') || 3000;
  app.startAllMicroservicesAsync();

  await app.listen(port, () => winstonLogger.log(`Hybrid ms-test test running on port ${port}`));

}
bootstrap();
