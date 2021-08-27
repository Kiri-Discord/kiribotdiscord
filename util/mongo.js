const mongoose = require('mongoose');

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
        mongoose.connect(process.env.mongourl, dbOptions);
        mongoose.connection.on('connected', () => {
            console.log('[MONGO] Mongoose has successfully connected!');
        });

        mongoose.connection.on('err', err => {
            console.error(`[MONGO] Mongoose connection error: \n${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[MONGO] Mongoose connection lost');
        });
    }
}