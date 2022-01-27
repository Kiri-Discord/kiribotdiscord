const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require('../config.json');
const WebSocket = require('ws');
const { stripIndents } = require('common-tags');
const { deleteIfAble } = require('../util/util');
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
            if (data.type === 'verifyRequest') {
                await client.verifytimers.deleteTimer(data.guildID, data.userID);
                const { uuid } = data;
                const setting = await client.db.guilds.findOne({
                    guildID: data.guildID
                });
                if (!setting) return wsConnection.send(JSON.stringify({ code: 204, type: 'verifyResponse', message: 'NO_GUILD_SETTING_FOUND', uuid }));
                const guild = await client.guilds.fetch(data.guildID).catch(() => null);

                if (!guild) return wsConnection.send(JSON.stringify({ code: 204, type: 'verifyResponse', message: 'NO_GUILD_FOUND', uuid }));
                if (!guild.available) return wsConnection.send(JSON.stringify({ code: 204, type: 'verifyResponse', message: 'GUILD_NOT_AVAILABLE', uuid }));

                if (guild.partial) await guild.fetch();
                const member = await guild.members.fetch(data.userID).catch(() => null);
                if (!member) return wsConnection.send(JSON.stringify({ code: 204, message: 'MEMBER_NOT_FOUND', type: 'verifyResponse', uuid }));

                const roleExist = member._roles.includes(setting.verifyRole);

                if (roleExist) return wsConnection.send(JSON.stringify({ code: 204, message: 'ALREADY_VERIFIED', uuid, type: 'verifyResponse' }));

                const verifyRole = await guild.roles.fetch(setting.verifyRole).catch(() => null);
                if (!verifyRole) return wsConnection.send(JSON.stringify({ code: 204, message: 'ROLE_NOT_EXIST', uuid, type: 'verifyResponse' }));

                wsConnection.send(JSON.stringify({ code: 200, message: 'SUCCESS', uuid, type: 'verifyResponse' }));

                if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES) || !verifyRole.editable) {
                    try {
                        return member.send(`oof, so mods from **${guild.name}** forgot to give me \`MANAGE_ROLES\` permission to gain you access to the server, or the verify role is above my highest role! can you ask them to verify you instead?\n\n**you will not be kicked after this message**`);
                    } catch (error) {
                        const verifyChannel = await guild.channels.fetch(setting.verifyChannelID).catch(() => null);
                        if (!verifyChannel || !verifyChannel.viewable || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        else return verifyChannel.send(`<@!${member.user.id}>, sorry but mods from **${guild.name}** forgot to give me the \`MANAGE_ROLES\` permission to gain you access to the server, or the verify role is above my highest role! can you ask them to verify you instead?\n\n**you will not be kicked after this message**`).then(m => {
                            setTimeout(() => {
                                deleteIfAble(m)
                            }, 6000);
                        });
                    };
                } else {
                    await member.roles.add(setting.verifyRole);
                    try {
                        return member.send(`**${member.user.username}**, you have passed my verification! Welcome to ${guild.name}!`);
                    } catch (error) {
                        if (!verifyChannel || !verifyChannel.viewable || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        else return verifyChannel.send(`<@!${member.user.id}>, you have passed my verification! Welcome to ${guild.name}!`).then(m => {
                            setTimeout(() => {
                                deleteIfAble(m)
                            }, 6000);
                        });
                    };
                };
            };
        };

        wsConnection.onclose = (e) => {
            if (count == 10) return logger.log('error', `[WEBSOCKET] WebSocket closed with code ${e.code} and reason ${e.reason} **FINAL**`);
            count++;
            logger.log('error', `[WEBSOCKET] Socket is closed with code ${e.code} Reconnect will be attempted in 5 seconds. Attempt: ${count}/10`, e.reason);
            setTimeout(function() {
                module.exports.init(client);
            }, 5000);
        };

        wsConnection.onerror = (err) => {
            logger.log('error', `[WEBSOCKET] Socket encountered error and is restarting in 5 seconds (${err.message})`);
            wsConnection.close();
            // setTimeout(function() {
            //     module.exports.init(client);
            // }, 30000);
        };
    }
};