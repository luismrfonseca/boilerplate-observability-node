import { Injectable, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { trace, context, Span } from '@opentelemetry/api';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly tracer = trace.getTracer('app-service');

  constructor(
    @InjectMetric('api_requests_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('api_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
  ) { }

  getHello() {
    this.requestCounter.inc({ endpoint: '/api/hello', method: 'GET' });
    this.logger.log('Processing hello request', 'AppService');

    return {
      message: 'Hello from NestJS with OpenTelemetry! 🚀',
      timestamp: new Date().toISOString(),
      service: 'nestjs-backend',
    };
  }

  async slowOperation() {
    const end = this.requestDuration.startTimer({ endpoint: '/api/slow' });
    this.requestCounter.inc({ endpoint: '/api/slow', method: 'GET' });

    this.logger.log('Starting slow operation', 'AppService');
    const span = this.tracer.startSpan('slow-operation');

    try {
      span.setAttribute('operation.type', 'slow');
      span.setAttribute('operation.duration', 3000);

      // Simulate slow operation
      await this.delay(3000);

      span.setStatus({ code: 1 }); // OK
      this.logger.log('Slow operation completed successfully', 'AppService');
      return {
        message: 'Slow operation completed! 🐌',
        duration: '3 seconds',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Slow operation failed', error.stack, 'AppService');
      span.setStatus({ code: 2, message: error.message }); // ERROR
      throw error;
    } finally {
      span.end();
      end();
    }
  }

  async nestedOperation() {
    const end = this.requestDuration.startTimer({ endpoint: '/api/nested' });
    this.requestCounter.inc({ endpoint: '/api/nested', method: 'GET' });

    const parentSpan = this.tracer.startSpan('nested-operation-parent');

    try {
      parentSpan.setAttribute('operation.type', 'nested');

      // First nested operation
      await this.nestedChild1();

      // Second nested operation
      await this.nestedChild2();

      parentSpan.setStatus({ code: 1 });
      return {
        message: 'Nested operations completed! 🎯',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      parentSpan.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      parentSpan.end();
      end();
    }
  }

  private async nestedChild1() {
    const span = this.tracer.startSpan('nested-child-1');
    try {
      span.setAttribute('child.id', 1);
      await this.delay(1000);
      span.setStatus({ code: 1 });
    } finally {
      span.end();
    }
  }

  private async nestedChild2() {
    const span = this.tracer.startSpan('nested-child-remote-call');
    try {
      span.setAttribute('child.id', 2);
      span.setAttribute('remote.service', 'nestjs-worker');

      this.logger.log('Calling remote worker service...', 'AppService');

      // The trace context is automatically propagated by OpenTelemetry via HttpService
      const response = await lastValueFrom(
        this.httpService.get('http://localhost:3003/work/process?taskId=remote-task-' + Date.now())
      );

      this.logger.log(`Received response from worker: ${JSON.stringify(response.data)}`, 'AppService');

      span.setAttribute('remote.response', JSON.stringify(response.data));
      span.setStatus({ code: 1 });
    } catch (error) {
      this.logger.error('Failed to call worker service', error.stack, 'AppService');
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
