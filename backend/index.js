import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import healthRouter from './routes/health.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
app.use(cors({ origin: env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(httpLogger);
app.use('/', healthRouter);
app.use(errorHandler);
const port = env.PORT;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`EventDAO backend listening on port ${port}`);
});
//# sourceMappingURL=index.js.map