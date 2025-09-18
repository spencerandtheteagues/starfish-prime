import pino from 'pino';

let otelApi = null;
try { otelApi = await import('@opentelemetry/api'); } catch {}

function otelLabels() {
  try {
    if (!otelApi) return {};
    const span = otelApi.trace.getSpan(otelApi.context.active());
    const sc = span && span.spanContext ? span.spanContext() : null;
    if (!sc) return {};
    return { traceId: sc.traceId, spanId: sc.spanId };
  } catch { return {}; }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization','res.headers.authorization','password','token','authorization','refreshToken'],
  base: null,
  msgPrefix: '',
  hooks: {},
  formatters: {
    bindings(bindings) { return { pid: bindings.pid, hostname: bindings.hostname }; },
    level(label, number) { return { level: label }; }
  },
  mixin() { return otelLabels(); }
});

export default logger;
