const mongoose = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family:4
        };

        mongoose.connect(process.env.mongourl, dbOptions);
        mongoose.set('useFindAndModify', false);
        mongoose.Promise = global.Promise;

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