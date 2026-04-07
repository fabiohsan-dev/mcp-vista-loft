import { env } from '../config/env.js';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export const logger = {
  info: (msg: string, meta?: any) => log('INFO', msg, meta),
  warn: (msg: string, meta?: any) => log('WARN', msg, meta),
  error: (msg: string, error?: any) => log('ERROR', msg, error),
  debug: (msg: string, meta?: any) => {
    if (env.NODE_ENV === 'development') log('DEBUG', msg, meta);
  }
};

function log(level: LogLevel, message: string, meta?: any) {
  const logEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && { 
      meta: meta instanceof Error ? { 
        name: meta.name, 
        message: meta.message, 
        stack: env.NODE_ENV === 'development' ? meta.stack : undefined 
      } : meta 
    }),
  });
  
  // O MCP usa stdout para o protocolo. Logs PRECISAM ir para stderr.
  process.stderr.write(logEntry + '\n');
}
