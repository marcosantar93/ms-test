import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { NATSConfigService } from './config/NATSConfigService';
import { object as JoiObject, string as JoiString, number as JoiNumber } from '@hapi/joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerConfig } from './factory/winstonConfig';
import { WinstonModule } from 'nest-winston';
import { MetricsModule } from './metrics/metrics.module';
import { MessageModule } from './message/message.module';
import { MessageService } from './message/message.service';
import { of } from 'rxjs';

describe('AppController', () => {
  let appController: AppController;
  let messageService: MessageService;
  let app: TestingModule;
  const logger: LoggerConfig = new LoggerConfig();

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
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
      ],
      controllers: [AppController],
      providers: [NATSConfigService, AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    messageService = app.get<MessageService>(MessageService);
    appController = app.get<AppController>(AppController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('youtMessageHandler', () => {
    it('should return same data as passed', () => {
      const data = {
        data: 'test',
        metadata: 'metadata'
      };
      expect(appController.yourMessageHandler(data)).toEqual(data);
    });
  });
  
  describe('yourPostHandler', () => {
    it('should return data returned by sendMessage', async () => {
      const data = 'test';
      jest.spyOn(messageService, 'sendMessage').mockImplementation(() => {
        return of({
          data
        });
      });

      const response = await appController.yourPostHandler({}, 'test');

      expect(response).toBe(data);
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
  

  afterAll(async () => {
    if(app) {
      await app.close();
    }
  });
});
