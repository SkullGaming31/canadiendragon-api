import axios from 'axios';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { connectDiscordDatabase } from '../../database';
import { TokenModelDiscord } from '../../database/Schemas/tokenModelDiscord';
import { createLimiter } from '../../middlewares';
config();

const router = express.Router();
const limiter = createLimiter();

const discordClientID = process.env.DEV_DISCORD_CLIENT_ID as string;
const discordClientSecret = process.env.DEV_DISCORD_CLIENT_SECRET as string;

router.get('/discord', limiter, async (req: Request, res: Response) => {
	// await connectDatabase(process.env.DISCORD_MONGO_DATABASE_URI as string);
	const discordAuth = generateDiscordAuthUrl(['identify', 'guilds', 'applications.commands', 'bot', 'connections']);
	res.redirect(discordAuth);
});

router.get('/auth/discord/redirect', limiter, async (req: Request, res: Response) => {
	await connectDiscordDatabase(process.env.DISCORD_MONGO_DATABASE_URI as string);
	const { code } = req.query;
	if (code) {
		try {
			const tokenResponse = await axios.post(
				'https://discord.com/api/oauth2/token',
				new URLSearchParams({
					client_id: discordClientID,
					client_secret: discordClientSecret,
					code: code as string,
					grant_type: 'authorization_code',
					redirect_uri: 'http://localhost:3001/api/v1/auth/discord/redirect',
					scope: 'identify applications.commands bot connections guilds ',
				}).toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			const oauthData = tokenResponse.data;
			// console.log(oauthData);
			const { access_token, expires_in, refresh_token, scope, guild } = oauthData;

			// const oauth2 = await axios.get('https://discord.com/api/oauth2/@me', {
			// 	headers: {
			// 		Authorization: `Bearer ${access_token}`,
			// 		'Content-Type': 'application/x-www-form-urlencoded'
			// 	}
			// });

			// const oauthResponse = oauth2.data;
			// console.log(oauthResponse);

			// Connect to MongoDB using Mongoose
			// const mongoURI = process.env.DISCORD_MONGO_DATABASE_URI as string; // Replace with your MongoDB URI and database name
			// mongoose.connect(mongoURI);

			// Check if a document with the same GuildId already exists
			const existingToken = await TokenModelDiscord.findOne({ GuildId: guild.id });

			if (existingToken) {
				// Update the existing document
				existingToken.access_token = access_token;
				existingToken.expires_in = expires_in;
				existingToken.refresh_token = refresh_token;
				existingToken.scope = scope;
				await existingToken.save();

				console.log('Token details updated in MongoDB using Mongoose');
			} else {
				// Create a new token document
				const newToken = new TokenModelDiscord({
					access_token,
					expires_in,
					refresh_token,
					scope,
					GuildId: guild.id,
				});
				await newToken.save();

				console.log('Token details created and inserted into MongoDB using Mongoose');
			}

			// Send the response once, after processing the token
			res.redirect('/api/v1');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			// Handle errors
			if (error.response && error.response.status === 401) {
				console.error('Unauthorized token:', error.response.data);
				return res.status(401).send('Unauthorized token');
			}

			console.error('Error exchanging token:', error);
			return res.status(500).send('Error exchanging token');
		}
	} else {
		// Send a response for other cases where 'code' is not available
		res.redirect('/api/v1');
	}
});

function generateDiscordAuthUrl(scopes: string[]): string {
	const joinedScopes = scopes.join(' '); // Join the scopes as a single string
	const encodedScopes = encodeURIComponent(joinedScopes); // Encode the scopes
	return `https://discord.com/api/oauth2/authorize?client_id=${discordClientID}&permissions=30092622032118&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fv1%2Fauth%2Fdiscord%2Fredirect&response_type=code&scope=${encodedScopes}`;
}

export default router;