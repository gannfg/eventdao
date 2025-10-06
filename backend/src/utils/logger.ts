import morgan from 'morgan';

export const httpLogger = morgan('dev');

export function logInfo(...messages: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log('[INFO]', ...messages);
}

export function logError(...messages: unknown[]): void {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', ...messages);
}
