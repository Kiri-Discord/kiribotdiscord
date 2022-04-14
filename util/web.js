const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require('../config.json');
const WebSocket = require('ws');
const { stripIndents } = require('common-tags');
let count = 0;
module.exports = {
    init: (client) => {
        const wsConnection = new WebSocket(config.baseWSURL, {
            headers: {
                Authorization: 'Bearer ' + config.wsToken
            }
        });
        wsConnection.onopen = () => {
            logger.log('info', '[WEBSOCKET] Connected to WebSocket!');
            count = 0;
        };
        wsConnection.onmessage = async(e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'vote') {
                let user;
                try {
                    user = await client.users.fetch(data.userID);
                } catch (error) {
                    return;
                };
                const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://top.gg/bot/859116638820761630')
                        .setLabel('vote for me on top.gg!')
                    );
                const embed = new MessageEmbed()
                    .setColor('#F4EDB4')
                    .setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                    .setAuthor({name: `hey ${user.username}, thanks for voting ＼(=^‥^)/’`})
                    .setDescription(stripIndents `
                    thank you for being generous and gave me a vote ${blush}

                    you was given a 50% bonus on your next daily token collect, and a free 🎫 **Effect Ticket**!\ntype \`${config.prefix}daily\` in any server to collect your token, or \`${config.prefix}ticket\` to obtain your ticket :tada:${data.weekend ? '\n\nit is the weekend! i have increased your bonus by 80%!' : ''}
                    `)
                    .setFooter({text: `that is the only thing i got to offer right now :) keep voting to explore!`})
                return user.send({ embeds: [embed], components: [row] }).catch(() => null);
            };
        };

        wsConnection.onclose = async (e) => {
            if (count == 10) {
                const owner = await client.users.fetch(client.config.ownerID).catch(() => null);
                if (owner) owner.send(`Websocket lost connection!`);
                client.config.logChannels.forEach(id => {
                    const channel = client.channels.cache.get(id);
                    if (channel) channel.send(`Websocket lost connection!`);
                });
                return logger.log('error', `[WEBSOCKET] WebSocket closed with code ${e.code} and reason ${e.reason} **FINAL**`);
            }
            count++;
            logger.log('error', `[WEBSOCKET] Socket is closed with code ${e.code} and reason ${e.reason} Reconnect will be attempted in 5 seconds. Attempt: ${count}/10`, e.reason);
            setTimeout(function() {
                module.exports.init(client);
            }, 5000);
        };
        wsConnection.onerror = (err) => {
            logger.log('error', `[WEBSOCKET] Socket encountered error and is restarting in 5 seconds (${err.message})`);
            wsConnection.close();
        };
    };
};
