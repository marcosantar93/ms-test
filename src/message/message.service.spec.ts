import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { NATSConfigService } from '../config/NATSConfigService';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from '../factory/winstonConfig';

describe('MessageService', () => {
  let service: MessageService;
  let module: TestingModule;
  const logger: LoggerConfig = new LoggerConfig();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot(logger.console())
      ],
      providers: [ConfigService, {
        provide: 'MESSAGE_CLIENT',
        useFactory: (natsConfigService: NATSConfigService) => ClientProxyFactory.create({ ...natsConfigService.getNATSConfig }),
        inject: [NATSConfigService]
      }, NATSConfigService, MessageService],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });
});
