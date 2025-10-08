import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import healthRouter from './routes/health.js';
import usersRouter from './routes/users.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());
app.use(httpLogger);

app.use('/', healthRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(`EventDAO backend listening on port ${port}`);
});
