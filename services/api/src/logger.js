import pino from 'pino';

// Optional OpenTelemetry integration
function otelLabels() {
  try {
    // Skip OpenTelemetry for now to fix build issues
    return {};
  } catch {
    return {};
  }
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
