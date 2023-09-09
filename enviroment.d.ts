declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_GUILD_ID: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DEV_DISCORD_GUILD_ID: string;
      DEV_DISCORD_BOT_TOKEN: string;
      DEV_DISCORD_CLIENT_ID: string;
      DEV_DISCORD_CLIENT_SECRET: string;
      DEV_DISCORD_REDIRECT_URL: string;
      Enviroment: 'dev' | 'prod' | 'debug';
      PORT: number;
      TWITCH_DATABASE_MONGO_URI: string;
      DISCORD_MONGO_DATABASE_URI: string;
    }
  }
}

export { };
