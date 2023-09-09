import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { createLimiter } from '../../middlewares';
config();

const router = express.Router();
const limiter = createLimiter();

router.get('/warframe/frame', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

router.get('/warframe/frame/:name', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

router.get('/warframe/item', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

router.get('/warframe/item/:name', limiter, async (req: Request, res: Response) => {
	res.json({ msg: 'Not Implemented Yet' });
});

export default router;