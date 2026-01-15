import { Injectable, Logger } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly tracer = trace.getTracer('worker-service');

  async processTask(taskId: string) {
    const span = this.tracer.startSpan('process-worker-task');
    span.setAttribute('task.id', taskId);

    this.logger.log(`Worker processing task: ${taskId}`);

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 500));

    span.addEvent('Task halfway done');

    await new Promise(resolve => setTimeout(resolve, 500));

    this.logger.log(`Worker completed task: ${taskId}`);
    span.end();

    return {
      status: 'completed',
      taskId,
      processor: 'nestjs-worker',
      timestamp: new Date().toISOString()
    };
  }
}
