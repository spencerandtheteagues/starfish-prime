// OpenTelemetry bootstrap (example).
// Enable by copying this file to src/otel-init.mjs and installing the deps below.
// Deps (pinned suggestion):
//   npm i @opentelemetry/sdk-node@0.52.0 @opentelemetry/api@1.8.0 @opentelemetry/resources@1.8.0 \
//         @opentelemetry/semantic-conventions@1.23.0 @opentelemetry/auto-instrumentations-node@0.52.0 \
//         @opentelemetry/exporter-trace-otlp-http@0.52.0 @opentelemetry/exporter-metrics-otlp-http@0.52.0

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';

try {
  const [{ NodeSDK } , { getNodeAutoInstrumentations }, api, { Resource }, { SemanticResourceAttributes }, { OTLPTraceExporter }, { OTLPMetricExporter }] = await Promise.all([
    import('@opentelemetry/sdk-node'),
    import('@opentelemetry/auto-instrumentations-node'),
    import('@opentelemetry/api'),
    import('@opentelemetry/resources'),
    import('@opentelemetry/semantic-conventions'),
    import('@opentelemetry/exporter-trace-otlp-http'),
    import('@opentelemetry/exporter-metrics-otlp-http')
  ]);

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'one-shot-api',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production'
    }),
    traceExporter: new OTLPTraceExporter({ url: endpoint + '/v1/traces' }),
    metricExporter: new OTLPMetricExporter({ url: endpoint + '/v1/metrics' }),
    instrumentations: [
      getNodeAutoInstrumentations()
    ]
  });

  await sdk.start();
  // Optional: clean shutdown (Node will process SIGTERM/SIGINT)
  process.once('SIGTERM', () => sdk.shutdown().catch(() => {}));
  process.once('SIGINT', () => sdk.shutdown().catch(() => {}));
} catch (e) {
  // Do not crash the app if OTel deps are missing
  console.warn('[otel-init] OpenTelemetry not enabled:', e?.message || e);
}
