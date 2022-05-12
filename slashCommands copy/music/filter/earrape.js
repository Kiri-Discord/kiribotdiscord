const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });

    await interaction.deferReply();
    let cooldownStorage = await client.db.cooldowns.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!cooldownStorage) {
        const model = client.db.cooldowns;
        cooldownStorage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    let expire = cooldownStorage.ticketExpire;
    if (!expire || expire < Date.now()) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `your 🎫 **Effect Ticket** was expired, or you don't have one! obtain one with \`/ticket\`!` }] });

    const bands = new Array(6).fill(null).map((n, i) => ({ band: i, gain: 0.5 }));
    queue.player.equalizer(bands);
    queue.player.volume(350);
    const sayoriEmoji = client.customEmojis.get("smug");
    interaction.editReply({ embeds: [{ color: "#bee7f7", description: `applied earrape to your current queue! this might take a few second... ${sayoriEmoji}` }], content: `to reset all effect, use \`/reset\`!` })
    if (queue.textChannel.id !== interaction.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} applied earrape to the current queue ${sayoriEmoji}` }], content: `to reset all effect, use \`/reset\`!` });
};