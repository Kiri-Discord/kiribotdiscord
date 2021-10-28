const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { shorten, pickWhenMany } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const query = interaction.options.getString('name');
    try {
        await interaction.deferReply();
        const search = await request
            .get('http://api.themoviedb.org/3/search/movie')
            .query({
                api_key: client.config.tmdbKey,
                include_adult: interaction.channel.nsfw || false,
                query
            });
        if (!search.body.results.length) {;
            return interaction.editReply('no result was found for that movie :pensive: better check if there is typo?');
        }
        let find = search.body.results.find(m => m.title.toLowerCase() === query.toLowerCase()) || search.body.results[0];
        if (search.body.results.length > 1) {
            const resultListFunc = (movie, i) => movie = {
                label: movie.title,
                description: movie.release_date || 'TBA',
                value: i.toString(),
            };
            find = await pickWhenMany(interaction, search.body.results, find, resultListFunc);
        };
        const { body } = await request
            .get(`https://api.themoviedb.org/3/movie/${find.id}`)
            .query({ api_key: client.config.tmdbKey });
        const embed = new MessageEmbed()
            .setColor(interaction.member.displayHexColor)
            .setTitle(body.title)
            .setURL(`https://www.themoviedb.org/movie/${body.id}`)
            .setDescription(body.overview ? shorten(body.overview) : 'No description available.')
            .setThumbnail(body.poster_path ? `https://image.tmdb.org/t/p/w500${body.poster_path}` : null)
            .addField('\`⏲️\` Runtime', body.runtime ? `${body.runtime} minutes` : 'Not avaliable', true)
            .addField('\`🗓️\` Release date', body.release_date || '???', true)
            .addField('\`🎭\` Genres', body.genres.length ? body.genres.map(genre => genre.name).join(', ') : '???')
            .addField('\`🏢\` Companies', body.production_companies.length ? body.production_companies.map(c => c.name).join(', ') : '???');;
        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error)
        return interaction.editReply("opps, there was an error while fetching the movie's information. can you try it later? :p")
    };
};

exports.help = {
    name: "movie",
    description: "fetch a movie's information base on your keyword",
    usage: ["movie <name>"],
    example: ["movie `The Slik Road`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('name')
            .setRequired(true)
            .setDescription('what movie would you like to search for?')
        ),
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};