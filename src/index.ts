import cors from 'cors';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { apiRouter } from './api';
import middlewares from './middlewares';
config();

// Enable CORS for your web application's origin
const corsOptions = {
	origin: 'http://localhost:3001', // Replace with your web app's URL
};

const app = express();
const Port = process.env.PORT;
app.use(cors(corsOptions));
app.use(helmet());
// app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static('public'));


app.get('/', (req: Request, res: Response) => { res.json({ message: 'Hello World' }); });
// Apply the middleware to the relevant routes
app.use('/api/v1', apiRouter);
app.use('/auth/twitch/callback', middlewares.establishTwitchDbConnection);
app.use('/auth/discord/redirect', middlewares.establishDiscordDbConnection);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
app.listen(Port, () => console.log(`Ready: http://localhost:${Port}`));