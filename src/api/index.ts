/* eslint-disable @typescript-eslint/no-unused-vars */

import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { createLimiter } from '../middlewares';
import discordRoutes from './routes/discordRoutes';
import twitchRoutes from './routes/twitchRoutes';
config();

export const apiRouter = express.Router();
const limiter = createLimiter();

apiRouter.get('/', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'welcome' });
});

apiRouter.use(twitchRoutes);
apiRouter.use(discordRoutes);