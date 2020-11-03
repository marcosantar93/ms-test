import { ConfigModule } from '@nestjs/config';
import { Module, DynamicModule } from '@nestjs/common';
import { NATSConfigService } from './config/NATSConfigService';
import { object as JoiObject, string as JoiString, number as JoiNumber } from '@hapi/joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './factory/winstonConfig';
import { MetricsModule } from './metrics/metrics.module';
import { MessageModule } from './message/message.module';
const logger: LoggerConfig = new LoggerConfig();    

@Module({})
export class AppModule {
  public static register(): DynamicModule {
    const imports = [
      WinstonModule.forRoot(logger.console()),
      ConfigModule.forRoot({
        isGlobal: true,
        validationSchema: JoiObject({
          NODE_ENV: JoiString()
            .valid('development', 'production', 'test')
            .default('development'),
          PORT: JoiNumber().port().default(3030),
          NATS_URL: JoiString().required().default('nats://localhost:4222'),
          NATS_USER: JoiString(),
          NATS_PASSWORD: JoiString(),INFLUX_URL: JoiString().uri()
        })
      }),
      MetricsModule,
      MessageModule
    ];

    const controllers = [AppController];

    const providers = [NATSConfigService, AppService];

    return {
      module: AppModule,
      imports,
      controllers,
      providers,
    };
  }
}