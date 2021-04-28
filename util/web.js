const express = require('express');

module.exports = {
    init: (client) => {
        client.webapp.use(express.json());
        client.webapp.get('/', (_, res) => res.send('the heck bros'));
        client.webapp.post("/checkVerify", authenticateToken, async (req, res) => {
            if ("userID" in req.query && "guildID" in req.query) {
              const setting = await client.dbguilds.findOne({
                guildID: req.query.guildID
              });
              if (!setting) return res.json({ code: 204, message: 'NO_GUILD_SETTING_FOUND' });
              const index = await client.dbverify.findOne({
                userID: req.query.userID,
                guildID: req.query.guildID
              });
              if (!index) return res.json({ code: 204, message: 'NO_VERIFICATION_FOUND' })
              const guild = client.guilds.cache.get(req.query.guildID);
              if (!guild) return res.json({ code: 204, message: 'NO_GUILD_FOUND' })
              if (!guild.available) return res.json({ code: 204, message: 'GUILD_NOT_AVAILABLE' });
              if (guild.partial) await guild.fetch();
              const member = guild.members.cache.get(req.query.guildID);
              if (!member) return res.json({ code: 204, message: 'MEMBER_NOT_FOUND' });
              if (member.partial) await member.fetch();
              const roleExist = member._roles.includes(setting.verifyRole);
              if (roleExist) return res.json({ code: 204, message: 'ALREADY_VERIFIED' });
              if (!verifyRole) return res.json({ code: 204, message: 'ROLE_NOT_EXIST' });
              res.json({ code: 200, message: 'SUCCESS' });
              await client.dbverify.findOneAndDelete({
                guildID: req.query.userID,
                userID: req.query.guildID
              });
              await client.verifytimers.deleteTimer(req.query.guildID, req.query.userID);
              if (!guild.me.hasPermission('MANAGE_ROLES')) {
                try {
                  return member.send(`oof, so mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`);
                } catch (error) {
                  const verifyChannel = guild.channels.cache.get(setting.verifyChannelID);
                  if (!verifyChannel || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                  else return verifyChannel.send(`<@!${member.user.id}>, sorry but mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`);
                }
              } else {
                await member.roles.add(VerifyRole);
                try {
                  return member.send(`**${member.user.username}**, you have passed my verification! Welcome to ${guild.name}!`);
                } catch (error) {
                  if (!verifyChannel || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                  else return verifyChannel.send(`<@!${member.user.id}>, you have passed my verification! Welcome to ${guild.name}!`)
                }
              }
            } else {
              return res.status(400).json({ code: 400, message: 'MISSING_QUERY' })
            }
        });
        client.webapp.get('*', function(req, res) {
            res.status(404).send('wrong call bruh')
        });
        client.webapp.listen(_port);
        console.log(`[WEB] Listening at port ${_port}`);
    }
};
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401);
  if (token !== process.env.APItoken) return res.sendStatus(401);
  if (err) return res.sendStatus(403)
  next()
};