const { Manager } = require("lavacord");

module.exports = class extends Manager {
    constructor(client, nodes, options) {
        super(nodes, options || {});
        this.client = client;
        this.send = (packet) => {
            const guild = this.client.guilds.cache.get(packet.d.guild_id);
            if (guild) return guild.shard.send(packet);
        };
        if (client.guilds.cache) {
            client.ws
                .on("VOICE_SERVER_UPDATE", this.voiceServerUpdate.bind(this))
                .on("VOICE_STATE_UPDATE", this.voiceStateUpdate.bind(this))
                .on("GUILD_CREATE", async data => {
                    for (const state of data.voice_states) {
                        await this.voiceStateUpdate({...state, guild_id: data.id });
                    }
                });
        } else {
            client.on("raw", async(packet) => {
                switch (packet.t) {
                    case "VOICE_SERVER_UPDATE":
                        await this.voiceServerUpdate(packet.d);
                        break;
                    case "VOICE_STATE_UPDATE":
                        await this.voiceStateUpdate(packet.d);
                        break;
                    case "GUILD_CREATE":
                        for (const state of packet.d.voice_states) {
                            await this.voiceStateUpdate({...state, guild_id: packet.d.id });
                        }
                        break;
                }
            });
        }
    }
}