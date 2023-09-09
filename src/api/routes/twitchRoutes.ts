/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { connectTwitchDatabase } from '../../database';
import { ITwitchToken, TokenModelTwitch } from '../../database/Schemas/tokenModelTwitch';
import { createLimiter } from '../../middlewares';
import { sleep } from '../../misc/util';
config();


interface validate {
	client_id: string,
	login: string,
	scopes: string[],
	user_id: string,
	expires_in: number
}
interface TokenData {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string[];
	token_type: string;
}

const router = express.Router();
const limiter = createLimiter();

const twitchClientId = process.env.TWITCH_CLIENT_ID as string;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET as string;
const twitchRedirectUri = 'http://localhost:3001/api/v1/auth/twitch/callback';
const botScopes = 'chat:edit chat:read channel:moderate bits:read user:edit channel:manage:schedule channel:manage:redemptions channel:read:charity channel:edit:commercial channel:manage:broadcast channel:manage:moderators channel:manage:polls channel:manage:predictions channel:manage:raids channel:read:editors channel:read:goals channel:read:hype_train channel:read:polls channel:read:predictions channel:read:redemptions channel:read:subscriptions channel:read:vips channel:manage:vips clips:edit moderation:read moderator:manage:automod moderator:manage:automod_settings moderator:manage:banned_users moderator:manage:shield_mode moderator:manage:announcements moderator:manage:shoutouts moderator:manage:blocked_terms moderator:manage:chat_messages moderator:manage:chat_settings moderator:manage:guest_star moderator:read:automod_settings moderator:read:blocked_terms moderator:read:shoutouts moderator:read:followers moderator:read:shield_mode moderator:read:chat_settings moderator:read:chatters moderator:read:guest_star user:manage:whispers user:read:subscriptions';
const userScopes = 'bits:read channel:edit:commercial channel:manage:broadcast channel:manage:polls channel:manage:predictions channel:manage:redemptions channel:manage:schedule channel:manage:moderators channel:manage:raids channel:manage:vips channel:read:vips channel:read:polls channel:read:predictions channel:read:redemptions channel:read:editors channel:read:goals channel:read:hype_train channel:read:subscriptions channel_subscriptions clips:edit moderation:read moderator:manage:automod moderator:manage:automod_settings moderator:manage:banned_users moderator:manage:shield_mode moderator:manage:announcements moderator:manage:shoutouts moderator:manage:blocked_terms moderator:manage:chat_messages moderator:manage:chat_settings moderator:manage:guest_star moderator:read:automod_settings moderator:read:blocked_terms moderator:read:shoutouts moderator:read:followers moderator:read:shield_mode moderator:read:chat_settings moderator:read:chatters moderator:read:guest_star user:edit user:edit:follows user:manage:blocked_users user:read:blocked_users user:read:broadcast user:read:email user:read:follows user:read:subscriptions user:edit:broadcast user:manage:whispers';

router.get('/auth/twitch/success', async (req: Request, res: Response) => {
	res.status(200).send('You can now close this page');
	await sleep(5000);
	res.redirect('/api/v1');
});

//#region Twitch Auth
router.get('/twitch', limiter, async (req: Request, res: Response) => {
	// Redirect the user to the Twitch authorization page with all scopes
	const userAuthUrl = generateAuthUrl(['bits:read', 'channel:edit:commercial', 'channel:manage:broadcast', 'channel:manage:polls', 'channel:manage:predictions', 'channel:manage:redemptions', 'channel:manage:schedule', 'channel:manage:moderators', 'channel:manage:raids', 'channel:manage:vips', 'channel:read:vips', 'channel:read:polls', 'channel:read:predictions', 'channel:read:redemptions', 'channel:read:editors', 'channel:read:goals', 'channel:read:hype_train', 'channel:read:subscriptions', 'channel_subscriptions', 'clips:edit', 'moderation:read', 'moderator:manage:automod', 'moderator:manage:automod_settings', 'moderator:manage:banned_users', 'moderator:manage:shield_mode', 'moderator:manage:announcements', 'moderator:manage:shoutouts', 'moderator:manage:blocked_terms', 'moderator:manage:chat_messages', 'moderator:manage:chat_settings', 'moderator:manage:guest_star', 'moderator:read:automod_settings', 'moderator:read:blocked_terms', 'moderator:read:shoutouts', 'moderator:read:followers', 'moderator:read:shield_mode', 'moderator:read:chat_settings', 'moderator:read:chatters', 'moderator:read:guest_star', 'user:edit', 'user:edit:follows', 'user:manage:blocked_users', 'user:read:blocked_users', 'user:read:broadcast', 'user:read:email', 'user:read:follows', 'user:read:subscriptions', 'user:edit:broadcast', 'user:manage:whispers']);
	const botAuthUrl = generateAuthUrl(['chat:edit', 'chat:read', 'channel:moderate', 'bits:read', 'user:edit', 'channel:manage:schedule', 'channel:manage:redemptions', 'channel:read:charity', 'channel:edit:commercial', 'channel:manage:broadcast', 'channel:manage:moderators', 'channel:manage:polls', 'channel:manage:predictions', 'channel:manage:raids', 'channel:read:editors', 'channel:read:goals', 'channel:read:hype_train', 'channel:read:polls', 'channel:read:predictions', 'channel:read:redemptions', 'channel:read:subscriptions', 'channel:read:vips', 'channel:manage:vips', 'clips:edit', 'moderation:read', 'moderator:manage:automod', 'moderator:manage:automod_settings', 'moderator:manage:banned_users', 'moderator:manage:shield_mode', 'moderator:manage:announcements', 'moderator:manage:shoutouts', 'moderator:manage:blocked_terms', 'moderator:manage:chat_messages', 'moderator:manage:chat_settings', 'moderator:manage:guest_star', 'moderator:read:automod_settings', 'moderator:read:blocked_terms', 'moderator:read:shoutouts', 'moderator:read:followers', 'moderator:read:shield_mode', 'moderator:read:chat_settings', 'moderator:read:chatters', 'moderator:read:guest_star', 'user:manage:whispers', 'user:read:subscriptions']);
	res.redirect(userAuthUrl);
});
router.get('/auth/twitch/callback', limiter, async (req: Request, res: Response) => {
	await connectTwitchDatabase(process.env.TWITCH_DATABASE_MONGO_URI as string);

	const { code } = req.query;
	try {
		if (typeof code === 'string') {
			// Exchange the authorization code for an access token
			const tokenResponse: AxiosResponse<TokenData> = await axios.post<TokenData>(
				'https://id.twitch.tv/oauth2/token',
				null,
				{
					params: {
						client_id: twitchClientId,
						client_secret: twitchClientSecret,
						code,
						grant_type: 'authorization_code',
						redirect_uri: twitchRedirectUri,
						scope: userScopes,
					},
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			const { access_token, refresh_token, expires_in } = tokenResponse.data;

			// Get the user ID
			const validateResponse: AxiosResponse<validate> = await axios.get<validate>('https://id.twitch.tv/oauth2/validate', {
				headers: {
					'Authorization': `Bearer ${access_token}`
				}
			});

			const { user_id: twitchId, login, scopes } = validateResponse.data;

			console.log('twitchId before findOne:', twitchId);
			const existingUser = await TokenModelTwitch.findOne<ITwitchToken>({ twitchId: twitchId });
			console.log('hello: ', existingUser);


			if (existingUser) {
				await updateAccessToken(existingUser.twitchId, existingUser.login, access_token, refresh_token, scopes, expires_in);
			} else {
				await saveAccessToken(twitchId, login, access_token, refresh_token, scopes, expires_in);
			}

			// Redirect the user to the success page
			if (res.statusCode === 200) {
				res.redirect('/api/v1');
			}
		}
	} catch (err) { console.error('Error exchanging authorization code for access token:', err); }
});

const saveAccessToken = async (twitchId: string, login: string, access_token: string, refresh_token: string, scope: string[], expires_in: number) => {
	const obtainmentTimestamp = Date.now(); // Obtain the current timestamp in epoch milliseconds

	const newAccessToken = new TokenModelTwitch({
		twitchId,
		login,
		access_token,
		refresh_token,
		scope,
		expires_in,
		obtainmentTimestamp
	});

	try {
		const savedAccessToken = await newAccessToken.save();
		console.log('Access token saved:', savedAccessToken);
	} catch (error) {
		console.error('Error saving access token:', error);
	}
};

// Update an access token in the database with expiresIn
const updateAccessToken = async (tokenId: string, login: string, accessToken: string, refreshToken: string, scope: string[], expires_in: number) => {
	const obtainmentTimestamp = Date.now(); // Obtain the current timestamp in epoch milliseconds

	try {
		const updatedAccessToken = await TokenModelTwitch.findOneAndUpdate<ITwitchToken>(
			{ twitchId: tokenId },
			{ login, accessToken, refreshToken, scope, expires_in, obtainmentTimestamp },
			{ new: true },
		);
		console.log('Access token updated:', updatedAccessToken);
	} catch (error) {
		console.error('Error updating access token:', error);
	}
};

function generateAuthUrl(scopes: string[]): string {
	const joinedScopes = scopes.join('%20');
	return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${twitchClientId}&redirect_uri=${twitchRedirectUri}&scope=${joinedScopes}`;
}

export default router;
