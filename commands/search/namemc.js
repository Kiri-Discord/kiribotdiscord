const lookupName = require("namemc").lookupName;
const { MessageEmbed } = require('discord.js');
const humanizeDuration = require("humanize-duration");

exports.run = async (client, message, args) => {
    if (!args[0]) return message.inlineReply('provide me a Minecraft username or UUID pls :(');
    const users = await lookupName(args[0]);
    if (!users) return message.inlineReply("i can't find any Minecraft user with that name :(\n*btw, that name is avaliable for you to choose! good news for you :)*");
    let user;
    if (Array.isArray(users)) {
        user = users[0]
    } else {
        user = users
    };
    let pastname = [];
    let skinsurl = [];
    if (user.skins.pastSkins.length >= 5) {
        for (let counter = 0; counter < 5; ++counter) {
            skinsurl.push(`[**[${counter + 1}](${user.skins.pastSkins[counter].url})**] : Changed ${humanizeDuration(Date.now() - user.skins.pastSkins[counter].changedAt)} ago`)
        }
    } else {
        for (let counter = 0; counter < user.skins.pastSkins.length; ++counter) {
            skinsurl.push(`[**[${counter + 1}](${user.skins.pastSkins[counter].url})**] : Changed ${humanizeDuration(Date.now() - user.skins.pastSkins[counter].changedAt)} ago`)
        }
    };
    if (user.pastNames.length >= 10) {
        for (let counter = 0; counter < 10; ++counter) {
            let date;
            if (user.pastNames[counter].changedAt === null) {
                date = `a while ago`
            } else {
                date = `${humanizeDuration(Date.now() - user.pastNames[counter].changedAt)} ago`
            }
            pastname.push(`**${user.pastNames[counter].name}**, changed ${date}`)
        }
    } else {
        for (let counter = 0; counter < user.pastNames.length; ++counter) {
            let date;
            if (user.pastNames[counter].changedAt === null) {
                date = `a while ago`
            } else {
                date = `${humanizeDuration(Date.now() - user.pastNames[counter].changedAt)} ago`
            }
            pastname.push(`**${user.pastNames[counter].name}**, changed ${date}`)
        }
    }

    const embed = new MessageEmbed()
    .setColor(message.guild ? message.guild.me.displayHexColor : '#ffe6cc')
    .setThumbnail(user.skins.renders.face)
    .setTitle(`${user.currentName}'s profile`)
    .setFooter(`Note: due to Discord limitation, not all past skin and names will be shown, sorry :(`)
    .setAuthor(`NameMC`, 'https://i.ibb.co/2ctx3M2/download.png', 'https://namemc.com')
    .setDescription(`UUID: \`${user.uuid}\``)
    .addField(`Skin(s):`, skinsurl.join("\n"))
    .setURL(`https://namemc.com/${user.profileId}`)
    .setImage(user.skins.renders.body)
    .addField(`Past names:`, pastname.join("\n"), true)

    if (user.skins.renders.cape) {
        embed.addField('Cape', `[Here](${user.skins.renders.cape})`, true)
    }

    return message.channel.send(embed);
}
exports.help = {
  name: "namemc",
  description: "Search for a Minecraft player on NameMC",
  usage: ["namemc `<UUID>`", "namemc `<username>`"],
  example: ["namemc `Notch`", "namemc `0a0dcec8-6c00-4410-92aa-34a3d87da243`"]
}

exports.conf = {
  aliases: ["minecraft", "mcname"],
  cooldown: 5,
  guildOnly: true,
  
  channelPerms: ["EMBED_LINKS"]
}
