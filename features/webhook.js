const { Permissions } = require('discord.js')
module.exports = class sendHook {
    constructor(client, channel, content) {
        this.client = client;
        this.channel = channel;
        this.content = content;
        this.hookInstance = null;
    };
    async send() {
        if (!this.hookInstance) return this.find();
        else return this.hookInstance.send(this.content)
    };
    async find() {
        const webhooks = await this.channel.fetchWebhooks();
        if (!webhooks.size) return this.create();
        const webhook = webhooks.find(hook => hook.owner.id === this.client.user.id);
        if (!webhook) return this.create();
        else this.hookInstance = webhook;
        return this.send()
    };
    async create() {
        if (!this.channel.permissionsFor(this.client.user).has(Permissions.FLAGS.MANAGE_WEBHOOKS)) return;
        this.hookInstance = await this.channel.createWebhook('Kiri', {
            avatar: this.client.user.displayAvatarURL(),
        });
        return this.send();
    };
};