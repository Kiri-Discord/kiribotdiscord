const { readdirSync } = require("fs");
module.exports = client => {
    const events = readdirSync("./events/");
    for (let event of events) {
        client.on(event.split(".")[0], (...args) => sync.require(`../events/${event}`)(client, ...args));
    }
}