const mongoose = require('mongoose');
const config = require('../config.json');

module.exports = {
    init: async() => {
        const dbOptions = {
            keepAlive: true,
            autoIndex: false,
            connectTimeoutMS: 10000,
            family: 4,
        };
        mongoose.Promise = global.Promise;
        mongoose.set('bufferCommands', false);
        mongoose.connection.on('connected', () => {
            logger.log('info', '[MONGO] Mongoose has successfully connected!');
        });

        mongoose.connection.on('err', err => {
            logger.log('error', `[MONGO] Mongoose connection error: \n${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.log('warn', '[MONGO] Mongoose connection lost');
        });
        await mongoose.connect(config.mongourl, dbOptions).catch(() => {
            logger.log('error', '[MONGO] Mongoose connect failed');
            process.exit(1);
        });
        return true;
    }
}