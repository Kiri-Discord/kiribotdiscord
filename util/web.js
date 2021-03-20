const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

module.exports = {
    init: (client) => {
        client.webapp.use(express.json());
        client.webapp.post("/key", (req, res) => res.json({ key: process.env.reCaptchaKey }))
        client.webapp.use("/verify", express.static(__basedir + "/html/captcha/"))
        client.webapp.use(`/assets`, express.static(__basedir + '/html/assets/'));
        client.webapp.get('/', (_, res) => res.sendFile(__basedir + '/html/landing.html'));
        client.webapp.get("/val", async (req, res) => {
            if ("token" in req.query && "valID" in req.query) {
              const body = new URLSearchParams()
              body.append("secret", process.env.reCaptchaToken);
              body.append("response", req.query.token);
              const apiCall = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                method: "post",
                body,
              });
              const apiRes = await apiCall.json();
              if (apiRes.success === true) {
                const index = await client.dbverify.findOne({
                    valID: req.query.valID
                });
                if (index) {
                  onSuccess(client, index);
                  res.sendFile(__basedir + '/html/success.html');

                } else {
                    res.sendFile(__basedir + '/html/wrong-id.html');
                }
              } else {
                res.status(401).sendFile(__basedir + '/html/failedCaptcha.html');
              }
            } else {
              res.status(400).sendFile(__basedir + '/html/404.html')
            }
        });
        client.webapp.get('*', function(req, res) {
            res.sendFile(__basedir + '/html/404.html')
        });
        client.webapp.listen(_port);
        console.log(`[WEB] Listening at port ${_port}`);
    }
}
async function onSuccess(client, index) {
  const setting = await client.dbguilds.findOne({
      guildID: index.guildID
  });
  const guild = await client.guilds.cache.get(index.guildID);
  if (!guild) return;
  const member = await guild.members.cache.get(index.userID);
  if (!member) return;
  const VerifyRole = guild.roles.cache.get(setting.verifyRole);
  const roleExist = member._roles.includes(setting.verifyRole);
  if (roleExist || !VerifyRole) return;
  await client.dbverify.findOneAndDelete({
    guildID: index.guildID,
    userID: index.userID
  });
  await member.roles.add(VerifyRole).catch(() => {
  return member.send(`oof, so mods from ${guild.name} forgot to give me the role \`MANAGE_ROLES\` :( can you ask them to verify you instead?\n*you will not be kicked after this message*`).then(i => i.delete({ timeout: 7500 }));
  });
  return member.send(`**${member.user.username}**, you have passed my verification! Welcome to ${guild.name}!`).catch(() => {
    return;
  })
}

