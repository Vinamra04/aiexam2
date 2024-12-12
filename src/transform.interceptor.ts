import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export function getPropValue(obj, key) {
  return key.split('.').reduce((o, x) => (o == undefined ? o : o[x]), obj);
}
export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // console.log('its from non-graphql');
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        return {
          data: getPropValue(data, 'result') || data,
          statusCode,
          // msg: getPropValue(data,'message') || '',
          Message: getPropValue(data, 'message') || '',
          Status: [200, 201].includes(+statusCode),
        };
      }),
    );
  }
}
