const Redis = require('ioredis');
const redis = new Redis({
	port: process.env.redis_port,
	host: process.env.redis_host,
	enableReadyCheck: true,
	password: process.env.redis_pass,
	db: 0
});


module.exports = class RedisClient {
	static get db() {
		return redis;
	}

	static start() {
		redis.on('connect', () => console.log('[REDIS] Connecting...'));
		redis.on('ready', () => console.log('[REDIS] Ready!'));
		redis.on('error', error => console.error(`[REDIS] Encountered error:\n${error}`));
		redis.on('reconnecting', () => console.warn('[REDIS] Reconnecting...'));
	}
};