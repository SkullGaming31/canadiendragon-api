import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDiscordDatabase, connectTwitchDatabase } from './database';
config();

function notFound(req: Request, res: Response, next: NextFunction) {
	const error = new Error(`Not Found - ${req.originalUrl}`);
	res.status(404);
	next(error);
}


function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode);
	res.json({
		status: statusCode,
		message: error.message,
		stack: process.env.Enviroment === 'prod' ? '🥞' : error.stack
	});
	next();
}

// Define a function to create a rate limiter middleware
export function createLimiter() {
	return rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per windowMs
	});
}

// Middleware for Twitch database connection
const establishTwitchDbConnection = async (req: Request, res: Response, next: NextFunction) => {
	if (!mongoose.connection.readyState) {
		await connectTwitchDatabase(process.env.TWITCH_DATABASE_MONGO_URI as string);
	}
	next();
};

// Middleware for Discord database connection
const establishDiscordDbConnection = async (req: Request, res: Response, next: NextFunction) => {
	if (!mongoose.connection.readyState) {
		await connectDiscordDatabase(process.env.DISCORD_DATABASE_MONGO_URI as string);
	}
	next();
};

export default { notFound, errorHandler, createLimiter, establishTwitchDbConnection, establishDiscordDbConnection };