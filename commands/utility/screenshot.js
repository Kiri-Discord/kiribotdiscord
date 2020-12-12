const request = require('node-superfetch');
const url = require('url');
const Discord = require('discord.js')

let pornList = null;


exports.help = {
    name: "screenshot",
    description: "take a screenshot of a site :)\n**avoid rick roll!**",
    usage: "screenshot <link>",
    example: "screenshot <link>"
};
  
exports.conf = {
    aliases: ["capture"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
    clientPerms: [],
    userPerms: [],
	clientPerms: []
}


exports.run = async (client, message, args) => {
    const embed2 = new Discord.MessageEmbed()
    .setColor(0x7289DA)
    .setDescription(`he will shoot anybody who is trying to do this illegal stuff in normal channel\nenter this link in a nsfw channel to make him feel happier :)`)
    .setTitle('say hi to my uncle')
    .setImage('https://i.pinimg.com/originals/65/96/27/6596276817293850804c8d07162792d5.jpg')

    let query = args[0];
    if (!query) return message.reply('you have to give me an URL where i will take the screenshot from :(') 
    let site;

    if (/^(https?:\/\/)/i.test(query)) {
        site = query
    } else {
        site = `http://${query}`
    }

    try {
        if (!pornList) await fetchPornList();
        const parsed = url.parse(site);
        if (pornList.some(pornURL => parsed.host === pornURL) && !message.channel.nsfw) {
            return message.channel.send(embed2);
        }
        message.channel.startTyping(true);
        const { body } = await request.get(`https://image.thum.io/get/width/1920/crop/675/noanimate/${site}`);
        await message.channel.stopTyping(true);
        return message.channel.send('*powered by bell\'s laptop*',{ files: [{ attachment: body, name: 'screenshot.png' }] });
    } catch (err) {
        await message.channel.stopTyping(true);
        if (err.status === 404) return message.channel.send('i could\'t take a screenshot of that site :( maybe your URL is invaild?');
        return message.channel.send(`sorry :( i got an error. try again later! maybe bell's laptop is drunk.`);
    }


}

async function fetchPornList(force = false) {
    if (!force && pornList) return pornList;
    const { text } = await request.get('https://raw.githubusercontent.com/blocklistproject/Lists/master/porn.txt');
    pornList = text.split('\n')
        .filter(site => site && !site.startsWith('#'))
        .map(site => site.replace(/^(0.0.0.0 )/, ''));
    return pornList;
}
