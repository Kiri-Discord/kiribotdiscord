const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { shorten, pickWhenMany } = require('../../util/util');

exports.run = async (client, message, args) => {
    const query = args.join(" ");
    if (!query) return message.inlineReply('what movie you would like me to search for?')
    try {
        message.channel.startTyping(true);
        const search = await request
        .get('http://api.themoviedb.org/3/search/movie')
        .query({
            api_key: process.env.tmdbKey,
            include_adult: message.channel.nsfw || false,
            query
        });
        if (!search.body.results.length) {
            await message.channel.stopTyping(true);
            return message.inlineReply('no result was found for that movie :pensive: better check if there is typo?');
        }
        let find = search.body.results.find(m => m.title.toLowerCase() === query.toLowerCase()) || search.body.results[0];
        if (search.body.results.length > 1) {
            const resultListFunc = (movie, i) => `\`${i + 1}\` · **${movie.title}** (${movie.release_date || 'TBA'})`;
            find = await pickWhenMany(message, search.body.results, find, resultListFunc);
        };
        const { body } = await request
        .get(`https://api.themoviedb.org/3/movie/${find.id}`)
        .query({ api_key: process.env.tmdbKey });
        const embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setTitle(body.title)
        .setURL(`https://www.themoviedb.org/movie/${body.id}`)
        .setDescription(body.overview ? shorten(body.overview) : 'No description available.')
        .setThumbnail(body.poster_path ? `https://image.tmdb.org/t/p/w500${body.poster_path}` : null)
        .addField(':timer: Runtime', body.runtime ? `${body.runtime} minutes` : 'Not avaliable', true)
        .addField(':calendar_spiral: Release date', body.release_date || '???', true)
        .addField('🎭 Genres', body.genres.length ? body.genres.map(genre => genre.name).join(', ') : '???')
        .addField('🏢 Companies', body.production_companies.length ? body.production_companies.map(c => c.name).join(', ') : '???');
        await message.channel.stopTyping(true);
        return message.channel.send(embed);
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.channel.send("opps, there was an error while fetching the movie's information :pensive: can you try it later?")
    }
}



exports.help = {
	name: "movie",
	description: "Fetch info on a movie based on input",
	usage: "movie <name>",
	example: "movie `Saw`"
};
  
exports.conf = {
	aliases: ['imdb'],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};