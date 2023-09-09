import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { createLimiter } from '../../middlewares';
config();

const router = express.Router();
const limiter = createLimiter();

router.get('/vigor', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

router.get('/vigor/:name', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

export default router;