const Redis = require('ioredis');
const { redis_host, redis_pass } = process.env;
const redis = new Redis({
	port: 18109,
	host: redis_host,
	enableReadyCheck: true,
	password: redis_pass,
	db: 0
});

module.exports = class RedisClient {
	static get db() {
		return redis;
	}

	static start() {
		redis.on('connect', () => console.info('Connecting to Redis database...'));
		redis.on('ready', () => console.info('Redis database ready!'));
		redis.on('error', error => console.error(`Redis encountered error:\n${error}`));
		redis.on('reconnecting', () => console.warn('Redis reconnecting...'));
	}
};