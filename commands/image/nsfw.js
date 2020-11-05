const randomanime = require("random-anime");
const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const nsfw = randomanime.nsfw()
    const embed1 = new Discord.MessageEmbed().setColor('#DAF7A6').setTimestamp(new Date()).setDescription(`powered by bell's homework folder`).setTitle("Congratulation, you have failed NNN").setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL()).setImage(nsfw)
    
    const embed2 = new Discord.MessageEmbed()
    .setColor(0x7289DA)
    .setTimestamp(new Date())
    .setDescription(`he will shoot anybody who is trying to fail nnn \nand to call me to do this illegal stuff \nin normal channel\ndo this in a nsfw channel to make him feel happier`)
    .setTitle('say hi to my uncle')
    .setImage('https://i.pinimg.com/originals/65/96/27/6596276817293850804c8d07162792d5.jpg')
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
    
    if (message.channel.nsfw) {
        message.channel.send(embed1);
    } else {
        message.channel.send(embed2);
    }
}

exports.help = {
	name: "nsfw",
	description: "do i even have to explain this again?",
	usage: "nsfw",
	example: "nsfw"
};
  
exports.conf = {
	aliases: ["anime-nsfw","nsfw"],
	cooldown: 4
};