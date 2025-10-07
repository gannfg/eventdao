import { ZodError } from 'zod';
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'ValidationError', issues: err.issues });
        return;
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    res.status(500).json({ error: 'InternalServerError', message });
}
//# sourceMappingURL=errorHandler.js.map