const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, interaction) => {
    try {
        let query = interaction.options.getString('text');
        let author = interaction.user;
        await interaction.deferReply();
        if (!query) {
            const setting = await client.db.guilds.findOne({
                guildID: interaction.guild.id
            });
            const prefix = setting ? setting.prefix : client.config.prefix;
            const cache = interaction.channel.messages.cache.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
            if (!cache) {
                const messages = await interaction.channel.messages.fetch({ limit: 10 });
                const msg = messages.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
                query = msg.cleanContent;
                author = msg.author;
            } else {
                query = cache.cleanContent;
                author = cache.author;
            }
        }
        let text = await sfw.OwOify({ text: query });;
        return interaction.editReply(`**${author.username}** was saying: ${text.owo.toLowerCase()}`)
    } catch (error) {;
        return interaction.editReply('hmm, there was no message to transfrom. can you provide one for me or send one in the chat before this?')
    }
};