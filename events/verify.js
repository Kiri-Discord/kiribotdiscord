const Discord = require("discord.js");

module.exports = async (client, message) => {

    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
      });
    const verifydb = await client.dbverify.findOne({
    guildID: message.guild.id,
    userID: message.author.id,
  });


  const alreadyHasRole = message.member._roles.includes(setting.verifyRole);

  try {
    if (message.channel.id === setting.verifyChannelID) {
        if (message.content.startsWith("resend")) {
            let code = verifydb.code;
            await message.delete();
            let verifyChannel = message.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);
            const dm = new Discord.MessageEmbed()
            .setColor(0x7289DA)
            .setTitle(`Welcome to ${message.guild.name}!`)
            .setDescription(`Hello! Before you get started, I just want you to verify yourself first.\nPut the below code into the channel ${verifyChannel} to verify yourself.`)
            .addField(`This is your code:`, `||${code}||`)
            await message.author.send(dm).catch(() => {
              return message.reply("Your DM is still locked. Unlock your DM first.")
              .then(i => i.delete({timeout: 10000}));
            })
            
            return message.reply("Check your DM.").then(i => i.delete({timeout: 10000}));
        }
        if (!alreadyHasRole) {
            if (!message.author.bot) {
                let code = verifydb.code;
                if (message.content !== `${code}`) {
                    await message.delete();
                    message.reply("Are you sure that it is the right code?").then(i => i.delete({timeout: 10000}));
                }
                if (message.content === `${code}`) {
                    await message.delete();
                    await client.dbverify.findOneAndDelete({
                        guildID: message.guild.id,
                        userID: message.author.id,
                    })
                    message.member.roles.add(setting.verifyRole).then(() => {
                        message.reply(`you have passed my verification! Welcome to ${message.guild.name}!`).then(i => i.delete({timeout: 7500}));
                    }).catch(err => {
                        message.reply("Oof, so this guild's mod forgot to give me the role \`MANAGE_ROLES\` :( can you ask them to verify you instead?").then(i => i.delete({timeout: 7500}));
                    });

                }
            }
        }
    }
  } catch (error) {
    return 
  }
}





















