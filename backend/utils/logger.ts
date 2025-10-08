import morgan from 'morgan';

export const httpLogger = morgan('dev');

export function logInfo(...messages: unknown[]): void {
  console.log('[INFO]', ...messages);
}

export function logError(...messages: unknown[]): void {
  console.error('[ERROR]', ...messages);
}
