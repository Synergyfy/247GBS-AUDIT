import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const { method, url, body } = req;
    const now = Date.now();

    // 1. Sanitize Body (Hide passwords/tokens)
    const sanitizedBody = { ...body };
    const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'refresh_token'];
    
    sensitiveKeys.forEach(key => {
      if (key in sanitizedBody) sanitizedBody[key] = '********';
    });

    // 2. Log Request
    const bodyString = Object.keys(sanitizedBody).length > 0 ? JSON.stringify(sanitizedBody) : '';
    this.logger.log(`Incoming: [${method}] ${url} ${bodyString ? `| Body: ${bodyString}` : ''}`);

    // 3. Handle Response
    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - now;
        const statusCode = res.statusCode;
        
        // Determine log level based on status
        if (statusCode >= 500) {
          this.logger.error(`Outgoing: [${method}] ${url} - Status: ${statusCode} - Duration: ${delay}ms`);
        } else if (statusCode >= 400) {
          this.logger.warn(`Outgoing: [${method}] ${url} - Status: ${statusCode} - Duration: ${delay}ms`);
        } else {
          this.logger.log(`Outgoing: [${method}] ${url} - Status: ${statusCode} - Duration: ${delay}ms`);
        }
      }),
    );
  }
}
