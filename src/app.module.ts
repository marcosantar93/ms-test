import { ConfigModule } from '@nestjs/config';
import { Module, DynamicModule } from '@nestjs/common';
import { NATSConfigService } from './config/NATSConfigService';
import { object as JoiObject, string as JoiString, number as JoiNumber } from '@hapi/joi';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './factory/winstonConfig';
import { MessageModule } from './message/message.module';
const logger: LoggerConfig = LoggerConfig.getInstance();    

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
          NATS_PASSWORD: JoiString(),
        })
      }),
      MessageModule
    ];

    const controllers = [];

    const providers = [NATSConfigService];

    return {
      module: AppModule,
      imports,
      controllers,
      providers,
    };
  }
}