import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { MicroserviceMessage } from '../interface/MicroserviceMessage';
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessageService implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('MESSAGE_CLIENT') private client: ClientProxy,
    private configService: ConfigService
    ){};

  sendMessage<Toutput = any, Tinput = any>(pattern: Record<string, any> | string, message: MicroserviceMessage<Tinput>): Observable<Toutput> {
    return this.client.send<Toutput, MicroserviceMessage<Tinput>>(pattern, message);
  }

  emitMessage<Toutput = any, Tinput = any>(pattern: Record<string, any> | string, message: MicroserviceMessage<Tinput>): Observable<Toutput> {
    return this.client.emit<Toutput, MicroserviceMessage<Tinput>>(pattern, message);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      this.logger.error(err, 'Connection to client has failed, start recovery');
      process.exit(1);
    }
    setInterval(async () => {
      try {
        await this.client.emit('ms-test"', 'healthcheck').toPromise();
        this.logger.info('TEST MESSAGE');
      } catch (err) {
        this.logger.error(err, 'Healthcheck has failed, start recovery');
        process.exit(2);
      }
    }, +this.configService.get<string>('HEALTHCHECK_INTERVAL'));
  }
}
