import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  MethodNotAllowedException,
  NotAcceptableException,
  RequestTimeoutException,
  ConflictException,
  GoneException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  ImATeapotException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const msg =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // console.log(typeof msg, msg, msg['message']);
    response.status(status).json({
      statusCode: status,
      Status: [200, 201].includes(+status),
      // timestamp: new Date().toISOString(),
      // path: request.url,
      Message:
        typeof msg == 'string' || typeof msg == 'number' ? msg : msg['message'],
      // msg: exception.message,
      data: [],
    });
  }
}

export function getExceptionClassByCode(str: any) {
  const code = str.match(/(\d+)/);
  let error: any = '';
  if (typeof code[0] == 'string') {
    code[0] = parseInt(code[0]);
  }
  switch (code[0]) {
    case 400:
      error = BadRequestException;
      break;
    case 401:
      error = UnauthorizedException;
      break;
    case 403:
      error = ForbiddenException;
      break;
    case 404:
      error = NotFoundException;
      break;
    case 405:
      error = MethodNotAllowedException;
      break;
    case 406:
      error = NotAcceptableException;
      break;
    case 408:
      error = RequestTimeoutException;
      break;
    case 409:
      error = ConflictException;
      break;
    case 410:
      error = GoneException;
      break;
    case 413:
      error = PayloadTooLargeException;
      break;
    case 415:
      error = UnsupportedMediaTypeException;
      break;
    case 418:
      error = ImATeapotException;
      break;
    case 422:
      error = UnprocessableEntityException;
      break;
    case 500:
      error = InternalServerErrorException;
      break;
    case 501:
      error = NotImplementedException;
      break;
    case 502:
      error = BadGatewayException;
      break;
    case 503:
      error = ServiceUnavailableException;
      break;
    case 504:
      error = GatewayTimeoutException;
      break;
    // case 505: error = HttpVersionNotSupportedException; break;
    default:
      error = NotFoundException;
      break;
  }
  return error;
}
