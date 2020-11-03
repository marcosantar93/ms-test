import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './filters/ExceptionsFilter';
import { NATSConfigService } from './config/NATSConfigService';
import { TimeoutInterceptor } from './interceptors/TimeoutInterceptor';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './factory/winstonConfig';

async function bootstrap() {
  const logger: LoggerConfig = new LoggerConfig();
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
  
  app.use(helmet());
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter);


  app.connectMicroservice({
    ...natsConfigService.getNATSConfig
  });

  const globalInterceptors = [];

  globalInterceptors.push(
    new TimeoutInterceptor()
  );
  app.useGlobalInterceptors(... globalInterceptors);

  const port = configService.get<number>('PORT') || 3000;
  app.startAllMicroservicesAsync();

  await app.listen(port, () => winstonLogger.log(`Hybrid ms-test test running on port ${port}`));

}
bootstrap();
