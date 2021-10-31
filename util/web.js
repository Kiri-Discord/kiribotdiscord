const express = require('express');
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require('../config.json');
const { stripIndents } = require('common-tags');
module.exports = {
    init: (client) => {
        app.use(express.json());
        app.use(helmet());
        app.use(compression());
        app.disable("x-powered-by");
        app.get('/', authenticateToken, (_, res) => res.send('the heck bros'));
        app.post("/checkVerify", authenticateToken, async(req, res) => {
            if ("userID" in req.query && "guildID" in req.query) {
                await client.verifytimers.deleteTimer(req.query.guildID, req.query.userID);
                const setting = await client.dbguilds.findOne({
                    guildID: req.query.guildID
                });
                if (!setting) return res.json({ code: 204, message: 'NO_GUILD_SETTING_FOUND' });
                const guild = client.guilds.cache.get(req.query.guildID);
                if (!guild) return res.json({ code: 204, message: 'NO_GUILD_FOUND' })
                if (!guild.available) return res.json({ code: 204, message: 'GUILD_NOT_AVAILABLE' });
                if (guild.partial) await guild.fetch();
                const member = guild.members.cache.get(req.query.userID);
                if (!member) return res.json({ code: 204, message: 'MEMBER_NOT_FOUND' });
                if (member.partial) await member.fetch();
                const roleExist = member._roles.includes(setting.verifyRole);
                if (roleExist) return res.json({ code: 204, message: 'ALREADY_VERIFIED' });
                const verifyRole = guild.roles.cache.get(setting.verifyRole);
                if (!verifyRole) return res.json({ code: 204, message: 'ROLE_NOT_EXIST' });
                res.json({ code: 200, message: 'SUCCESS' });
                if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                    try {
                        return member.send(`oof, so mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`);
                    } catch (error) {
                        const verifyChannel = guild.channels.cache.get(setting.verifyChannelID);
                        if (!verifyChannel || !verifyChannel.viewable || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        else return verifyChannel.send(`<@!${member.user.id}>, sorry but mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`).then(m => {
                            setTimeout(() => {
                                m.delete()
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
                                m.delete()
                            }, 6000);
                        });
                    };
                };
            } else {
                return res.status(400).json({ code: 400, message: 'MISSING_QUERY' })
            };
        });
        app.post('/vote', authenticateToken, async(req, res) => {
            if ("userID" in req.body) {
                let user;
                try {
                    user = await client.users.fetch(req.body.userID);
                } catch (error) {
                    return res.status(400);
                };
                const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
                const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://top.gg/bot/859116638820761630')
                        .setLabel('Vote us on top.gg!')
                    );
                const embed = new MessageEmbed()
                    .setColor('#F4EDB4')
                    .setAuthor(`hey ${user.username}, thanks for voting ＼(=^‥^)/’`, client.user.displayAvatarURL())
                    .setDescription(stripIndents `
                    thank you for being generous and gave me a vote ${blush}

                    you was given a 50% bonus on your next daily token collect! type \`${config.prefix}daily\` in any server to collect your token :tada:${req.body.weekend ? '\n\nit is the weekend! i have increased your bonus by 80%!' : ''}
                    that is the only thing i have to offer right now ${duh} keep voting to explore!
                    `)
                res.status(200).json({ code: 200 });
                if (req.body.type !== 'test') {
                    const voteStorage = client.vote;
                    const vote = new voteStorage({
                        userID: user.id,
                        collectMutiply: req.body.weekend ? 2 : 1.2
                    });
                    await vote.save();
                };
                return user.send({ embeds: [embed], components: [row] }).catch(() => null);
            } else {
                return res.status(400);
            };
        });
        app.get('*', authenticateToken, function(req, res) {
            res.status(404).send('wrong call bruh')
        });
        app.listen(config.PORT);
        logger.log('info', `[WEB] Listening at port ${config.PORT}`);
    }
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401);
    if (token !== config.apiToken) return res.sendStatus(401);
    next()
};