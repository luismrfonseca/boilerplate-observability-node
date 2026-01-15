import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    HttpModule,
    WinstonModule.forRoot(winstonOptions), // Provide winston injection
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    makeCounterProvider({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['endpoint', 'method'],
    }),
    makeHistogramProvider({
      name: 'api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
  ],
})
export class AppModule { }
