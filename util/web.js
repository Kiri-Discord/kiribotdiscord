const express = require('express');

module.exports = {
    init: (client) => {
        client.webapp.use(express.json());
        client.webapp.use(`/assets`, express.static(__basedir + '/html/assets/'));
        client.webapp.get('/', (_, res) => res.sendFile(__basedir + '/html/landing.html'));
        client.webapp.get('*', function(req, res) {
            res.render(__basedir + '/html/404.html');
        });
        client.webapp.listen(_port);
        console.log(`[WEB] Listening at port ${_port}`);
    }
}
