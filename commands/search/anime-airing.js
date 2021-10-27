const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const moment = require('moment-timezone');
const { today, tomorrow } = require('../../util/util');
const airingGraphQL = stripIndents `
	query AiringSchedule($greater: Int, $lower: Int) {
		anime: Page {
			results: airingSchedules(airingAt_greater: $greater, airingAt_lesser: $lower) {
				airingAt
				media {
					id
					title {
						english
						romaji
					}
				}
			}
		}
	}
`;

exports.run = async(client, message, args) => {
    try {
        const anime = await getList();
        if (!anime) return message.channel.send('no anime is airing today...');
        const mapped = anime.sort((a, b) => a.airingAt - b.airingAt).map(ani => {
            const title = ani.media.title.english || ani.media.title.romaji;
            const airingAt = moment(ani.airingAt * 1000).tz('Asia/Tokyo').format('h:mm A');
            return `• ${title} (@${airingAt} JST)`;
        });
        return message.channel.send(stripIndents `
            **Anime(s) airing on ${moment().tz('Asia/Tokyo').format('dddd, MMMM Do, YYYY')}:**
            ${mapped.join('\n')}
        `);
    } catch (err) {
        return message.reply(`oh no, an error occurred while i was trying to get the anime showtime today! try again later :pensive:`);
    };
};

async function getList() {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: {
                greater: Number.parseInt(today(9).getTime() / 1000, 10),
                lower: Number.parseInt(tomorrow(9).getTime() / 1000, 10)
            },
            query: airingGraphQL
        });
    if (!body.data.anime.results.length) return null;
    return body.data.anime.results;
}

exports.help = {
    name: "anime-airing",
    description: "get you a list of the anime that air today",
    usage: ["anime-airing"],
    example: ["anime-airing"]
};

exports.conf = {
    aliases: ["airing-anime", "anichart", "aniair"],
    cooldown: 4,
    guildOnly: true,
};