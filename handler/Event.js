const { readdirSync } = require("fs");
module.exports = (c, isManager) => {
    if (!isManager) {
        const events = readdirSync("./events/Client/");
        for (let event of events) {
            const func = require(`../events/Client/${event}`);
            c.on(event.split(".")[0], (...args) => {
                func(c, ...args);
            });
        };
    } else {
        const events = readdirSync("./events/ClusterManager/");
        for (let event of events) {
            const func = require(`../events/ClusterManager/${event}`);
            c.on(event.split(".")[0], (...args) => {
                func(...args);
            });
        };
    }
}