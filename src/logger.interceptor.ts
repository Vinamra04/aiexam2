import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    const consoleWidth = process.stdout.columns || 80; // Get console width or default to 80
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
    });
    const formattedTime = currentDate.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    const logMessage =
      `\x1b[35m${formattedDate}\x1b[0m` + // Magenta for date
      ` \x1b[34m${formattedTime}\x1b[0m` + // Blue for time
      ` INITIATING REQUEST` +
      ` \x1b[31m${method}\x1b[0m` + // Red for method
      ` \x1b[1m\x1b[32m${url}\x1b[0m`;

    console.log(`${logMessage.padEnd(consoleWidth - 2)}`);
    // console.log("+" + "-".repeat(consoleWidth - 2) + "+"); // Print the top line of the box

    return next.handle().pipe(
      tap(() => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
        });
        const formattedTime = currentDate.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
        });
        const timeSpent = Date.now() - now;

        const logMessage =
          `\x1b[35m${formattedDate}\x1b[0m` + // Magenta for date
          ` \x1b[34m${formattedTime}\x1b[0m` + // Blue for time
          ` REQUEST COMPLETED` +
          ` \x1b[31m${method}\x1b[0m` + // Red for method
          ` \x1b[1m\x1b[32m${url}\x1b[0m` + // Bold and green for URL
          ` \x1b[33m${timeSpent}ms\x1b[0m`; // Yellow for time spent

        console.log(`${logMessage.padEnd(consoleWidth - 2)}`);
        console.log('+' + '-'.repeat(consoleWidth - 2) + '+'); // Print the bottom line of the box
      }),
    );
  }
}
