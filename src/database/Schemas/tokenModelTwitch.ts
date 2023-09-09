import { Document, Model, Schema, model } from 'mongoose';


export interface ITwitchToken extends Document {
	twitchId: string;
	login: string;
	access_token: string;
	refresh_token: string;
	scope: string[];
	expires_in: number;
	obtainmentTimestamp: number;
}

const tokenSchema = new Schema<ITwitchToken>({
	twitchId: {
		type: String,
		required: true
	},
	login: {
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
	},
	obtainmentTimestamp: {
		type: Number,
		required: true
	},
});
// obtainmentTimestamp is saved in seconds same with expires_in

// Define your Twitch token model using the model method
export const TokenModelTwitch: Model<ITwitchToken> = model<ITwitchToken>('tokens', tokenSchema);