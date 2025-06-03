import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express'; 

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // Inject Logger service với context là tên của Interceptor
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Chỉ áp dụng cho HTTP requests (bỏ qua GraphQL, RPC, etc. nếu có)
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl, ip } = request; // Lấy method, url, ip
    const userAgent = request.get('user-agent') || ''; // Lấy user agent

    // Ghi log trước khi xử lý request
    this.logger.log(
      `[Request] ${method} ${originalUrl} - ${userAgent} ${ip}`,
    );

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap((data) => { // Log khi thành công
          const { statusCode } = response;
          const contentLength = response.get('content-length');
          const elapsedTime = Date.now() - now;
          this.logger.log(
            `[Response] ${method} ${originalUrl} ${statusCode} ${contentLength || '-'}b - ${elapsedTime}ms`,
          );
          
        }),
      );
  }
}