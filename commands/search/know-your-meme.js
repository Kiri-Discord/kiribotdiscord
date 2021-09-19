const request = require('node-superfetch');
const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');
const { shorten } = require('../../util/util');


exports.run = async(client, message, args) => {
    try {
        const query = args.join(' ');
        if (!query) return message.reply('what meme to you want to search? :eyes:');
        const res = await search(query);
        if (!res) {;
            return message.channel.send('no results was found for that meme :pensive:');
        }
        const data = await fetchMeme(res);
        const embed = new MessageEmbed()
            .setColor(message.member.displayHexColor)
            .setTitle(data.name)
            .setURL(data.url)
            .setImage(data.thumbnail);
        if (data.description) embed.setDescription(shorten(data.description));;
        return message.channel.send({ embeds: [embed] });
    } catch (err) {;
        return message.reply(`sorry :( i got an error. try again later! the server might be down tho.`)
    };

    async function search(query) {
        const { text } = await request
            .get('https://knowyourmeme.com/search')
            .query({ q: query });
        const $ = cheerio.load(text);
        const res = $('.entry-grid-body').find('tr td a').first().attr('href');
        if (!res) return null;
        return res;
    }

    async function fetchMeme(res) {
        const { text } = await request.get(`https://knowyourmeme.com${res}`);
        const $ = cheerio.load(text);
        const thumbnail = $('a[class="photo left wide"]').first().attr('href') ||
            $('a[class="photo left "]').first().attr('href') ||
            null;
        return {
            name: $('h1').first().text().trim(),
            url: `https://knowyourmeme.com${res}`,
            description: getMemeDescription($),
            thumbnail
        };
    };

    function getMemeDescription($) {
        const children = $('.bodycopy').first().children();
        let foundAbout = false;
        for (let i = 0; i < children.length; i++) {
            const text = children.eq(i).text();
            if (foundAbout) {
                if (text) return text;
            } else if (text === 'About') {
                foundAbout = true;
            }
        }
        return null;
    };
};

exports.help = {
    name: "know-your-meme",
    description: "get info about a meme on Know Your Meme",
    usage: ["know-your-meme `<query>`"],
    example: ["know-your-meme `amogus`"]
};

exports.conf = {
    aliases: ["knowyourmeme", "kym"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};