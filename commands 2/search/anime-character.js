const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const { embedURL, cleanAnilistHTML, trimArray } = require('../../util/util');
const searchGraphQL = stripIndents `
	query ($search: String) {
		characters: Page (perPage: 1) {
			results: characters (search: $search) { id }
		}
	}
`;
const resultGraphQL = stripIndents `
	query ($id: Int!) {
		Character (id: $id) {
			id
			name {
				first
				last
			}
			image {
				large
				medium
			}
			description(asHtml: false)
			siteUrl
			media(page: 1, perPage: 25) {
				edges {
					node {
						title {
							english
							romaji
						}
						type
						siteUrl
					}
				}
			}
		}
	}
`;
const types = {
    ANIME: 'Anime',
    MANGA: 'Manga'
};

exports.run = async(client, message, args) => {
        let query = args.join(" ");
        if (!query) return message.reply("you have to give me a character's name :(")
        try {
            const id = await search(query);
            if (!id) return message.reply('i couldn\'t find any result for that character :(');
            const character = await fetchCharacter(id);
            const embed = new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setURL(character.siteUrl)
                .setThumbnail(character.image.large || character.image.medium || null)
                .setTitle(`${character.name.first || ''}${character.name.last ? ` ${character.name.last}` : ''}`)
            .setDescription(character.description ? cleanAnilistHTML(character.description, false) : 'No description found :(')
            .addField('😀 Appearances', trimArray(character.media.edges.map(edge => {
                const title = edge.node.title.english || edge.node.title.romaji;
                return embedURL(`${title} (${types[edge.node.type]})`, edge.node.siteUrl);
            }), 5).join(', '));
        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        return message.channel.send('sorry :( i got no result. the server might be down tho.')
    }
}

async function search(query) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: { search: query },
            query: searchGraphQL
        });
    if (!body.data.characters.results.length) return null;
    return body.data.characters.results[0].id;
}

async function fetchCharacter(id) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: { id },
            query: resultGraphQL
        });
    return body.data.Character;
}



exports.help = {
	name: "anime-character",
	description: "search an anime character.\nonly character from official release will be searched :)",
	usage: "anime-character `<name>`",
	example: "anime-character `Bell`"
};
  
exports.conf = {
	aliases: ["animecharacter"],
    cooldown: 5,
    guildOnly: true,
    
	channelPerms: ["EMBED_LINKS"]
};