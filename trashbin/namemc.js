const { lookupName } = require("namemc");
const { lookupUUID } = require("namemc");
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { count } = require("../../model/hug");

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
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}


exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply('provide me a Minecraft username or UUID pls :(');
    const result = await lookupName(args[0]);
    if (!result) return message.reply("i can't find any Minecraft user with that name :(\n*btw, that name is avaliable for you to choose! good news for you :)*")
    
    const user = result[0];
    let skinsurl = [];
    let pastname = [];
    if (user.imageUrls.skins.length >= 15) {
        for (let counter = 0; counter < 15; ++counter) {
            skinsurl.push(`[${counter + 1}](${user.imageUrls.skins[counter]})`)
        }
    } else {
        for (let counter = 0; counter < user.imageUrls.skins.length; ++counter) {
            skinsurl.push(`[${counter + 1}](${user.imageUrls.skins[counter]})`)
        }
    };
    if (user.pastNames.length >= 10) {
        for (let counter = 0; counter < 10; ++counter) {
            let date;
            if (user.pastNames[counter].changedAt === null) {
                date = `a while ago`
            } else {
                date = `${user.pastNames[counter].changedAt}`
            }
            pastname.push(`**${user.pastNames[counter].name}**, changed ${date}`)
        }
    } else {
        for (let counter = 0; counter < user.pastNames.length; ++counter) {
            let date;
            if (user.pastNames[counter].changedAt === null) {
                date = `a while ago`
            } else {
                date = `${user.pastNames[counter].changedAt}`
            }
            pastname.push(`**${user.pastNames[counter].name}**, changed ${date}`)
        }
    }

    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setThumbnail(user.imageUrls.face)
    .setTitle(`${user.currentName}'s profile`)
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setAuthor(`NameMC`, 'https://i.ibb.co/2ctx3M2/download.png', 'https://namemc.com')
    .setDescription(`UUID: \`${user.uuid}\`\n\n*Note: i can show only a total of 10 previous name and 15 skins link at a time, sorry :(*`)
    .addField(`Skin(s):`, skinsurl.join(", "), true)
    .setURL(`https://namemc.com/${user.profileId}`)
    .setImage(user.imageUrls.body)
    .addField(`Past names:`, pastname.join("\n"))

    if (user.imageUrls.cape) {
        embed.addField('Cape', `[Here](${user.imageUrls.cape})`, true)
    }

    return message.channel.send(embed);
}