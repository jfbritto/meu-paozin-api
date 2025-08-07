import { SetMetadata } from '@nestjs/common';

export const DATADOG_METRICS_KEY = 'datadog_metrics';
export const DATADOG_EVENTS_KEY = 'datadog_events';

export interface DatadogMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface DatadogEvent {
  name: string;
  attributes?: Record<string, any>;
}

export const DatadogMetrics = (...metrics: DatadogMetric[]) =>
  SetMetadata(DATADOG_METRICS_KEY, metrics);

export const DatadogEvents = (...events: DatadogEvent[]) =>
  SetMetadata(DATADOG_EVENTS_KEY, events);

export const DatadogTrace = (operationName: string, tags?: Record<string, string>) =>
  SetMetadata('datadog_trace', { operationName, tags }); 