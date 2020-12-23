const ms = require("ms");
exports.run = async (client, message, args) => {
    
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
      });
      const prefix = setting.prefix;
  let time = args.join(" ");
  
  if (!time) return message.reply("please includes the time format. all valid time format are \`s, m, hrs\`!");
  
  let convert = ms(time); // This will results the milliseconds.
  let toSecond = Math.floor(convert / 1000); // This will convert the ms to s. (seconds)
  
  if (!toSecond || toSecond == undefined) return message.reply("please insert the valid time format! all valid time format are \`s, m, hrs\`!");
  
  if (toSecond > 21600 || toSecond < 1) return message.reply("the timer should be more than or equal to 1 second or less than 6 hours!");
  await client.dbguilds.findOneAndUpdate({
    guildID: message.guild.id,
  },
  {
    verifyTimeout: convert
  })
  .catch(err => console.error(err));
  return message.channel.send({embed: {color: "f3f3f3", description: `☑️ new member will be kicked in **${ms(ms(time), {long: true})}** if not verify. if you can't get it working, use \`${prefix}setverify\` first!`}});
}
exports.help = {
	name: "setverifytimeout",
	description: "How long do you want unverified people to stay in your guild?",
	usage: "setverifytimeout <time>",
	example: ["setverify `5hrs`", "setverify `10m`"]
};

exports.conf = {
	aliases: ["verifytimeout"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};

