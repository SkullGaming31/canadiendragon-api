import { config } from 'dotenv';
import mongoose, { MongooseError } from 'mongoose';
config();

export const connectTwitchDatabase = async (connectionString: string): Promise<void> => {
	mongoose.set('strictQuery', false);

	try {
		// Connect to the Twitch database
		await mongoose.connect(connectionString, { connectTimeoutMS: 10000 });
		console.log('Twitch MongoDB connection established successfully');
		const { connection: DB } = mongoose;

		DB.on('connected', () => {
			console.log('Twitch MongoDB connection re-established successfully');
		});

		DB.on('error', (error: MongooseError) => {
			console.error('Twitch MongoDB connection error:', error.name + '\n' + error.message + '\n' + error.stack);
		});

		DB.on('disconnected', () => {
			console.warn('Twitch MongoDB disconnected');
		});
	} catch (error) {
		console.error('Error connecting to Twitch MongoDB', error);
	}
};

export const connectDiscordDatabase = async (connectionString: string): Promise<void> => {
	mongoose.set('strictQuery', false);

	try {
		// Connect to the Discord database
		await mongoose.connect(connectionString, { connectTimeoutMS: 10000 });
		console.log('Discord MongoDB connection established successfully');
		const { connection: DB } = mongoose;

		DB.on('connected', () => {
			console.log('Discord MongoDB connection re-established successfully');
		});

		DB.on('error', (error: MongooseError) => {
			console.error('Discord MongoDB connection error:', error.name + '\n' + error.message + '\n' + error.stack);
		});

		DB.on('disconnected', () => {
			console.warn('Discord MongoDB disconnected');
		});
	} catch (error) {
		console.error('Error connecting to Discord MongoDB', error);
	}
};