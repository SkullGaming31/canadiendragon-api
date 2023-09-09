import { Document, Model, Schema, model } from 'mongoose';

export interface IDiscordToken extends Document {
	GuildId: string;
	access_token: string;
	refresh_token: string;
	scope: string[];
	expires_in: number;
}

const discordTokenSchema = new Schema<IDiscordToken>({
	GuildId: {
		type: String,
		required: true
	},
	access_token: {
		type: String,
		required: true
	},
	refresh_token: {
		type: String,
		required: true
	},
	scope: {
		type: [String],
		required: true
	},
	expires_in: {
		type: Number,
		required: true
	}
});
// obtainmentTimestamp is saved in seconds same with expires_in

export const TokenModelDiscord: Model<IDiscordToken> = model<IDiscordToken>('token', discordTokenSchema);