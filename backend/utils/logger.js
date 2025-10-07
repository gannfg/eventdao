import morgan from 'morgan';
export const httpLogger = morgan('dev');
export function logInfo(...messages) {
    // eslint-disable-next-line no-console
    console.log('[INFO]', ...messages);
}
export function logError(...messages) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...messages);
}
//# sourceMappingURL=logger.js.map