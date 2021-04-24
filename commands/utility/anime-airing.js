const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const moment = require('moment-timezone');
const { today, tomorrow } = require('../../util/util');
const airingGraphQL = stripIndents`
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

exports.run = async (client, message, args) => {
    try {
        const anime = await getList();
        if (!anime) return message.channel.send('no anime is airing today...');
        const mapped = anime.sort((a, b) => a.airingAt - b.airingAt).map(ani => {
            const title = ani.media.title.english || ani.media.title.romaji;
            const airingAt = moment(ani.airingAt * 1000).tz('Asia/Tokyo').format('h:mm A');
            return `• ${title} (@${airingAt} JST)`;
        });
        return message.channel.send(stripIndents`
            **these is/are anime(s) airing on ${moment().tz('Asia/Tokyo').format('dddd, MMMM Do, YYYY')}**
            ${mapped.join('\n')}
        `);
    } catch (err) {
        return message.inlineReply(`oh no, an error occurred while i was trying to get the showtime :( try again later!`);
    }
}

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
    name: "ani-airing",
    description: "i will responds with a list of the anime that air today with this :D",
    usage: "ani-airing",
    example: "ani-airing"
};

exports.conf = {
    aliases: ["airing-anime", "anichart", "aniair"],
    cooldown: 4,
    guildOnly: true,
}