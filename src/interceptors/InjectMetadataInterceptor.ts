import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { NatsContext } from "@nestjs/microservices";

export class InjectMetadataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    if (context.getType() === 'rpc') {
      const message = context.getArgByIndex(0);
      
      const natsContext = context.switchToRpc().getContext<NatsContext>();

      if (message.metadata.info) {
        if (Array.isArray(message.metadata.info)) {
          message.metadata.info = message.metadata.info.concat(natsContext.getArgs())
        } else {
          message.metadata.info = [message.metadata.info].concat(natsContext.getArgs());
        }
      } else {
        message.metadata.info = [...natsContext.getArgs()];
      }
    }

    return next.handle();
  }
  
}