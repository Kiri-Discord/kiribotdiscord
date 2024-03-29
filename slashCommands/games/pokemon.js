const { MessageEmbed, MessageAttachment } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const { silhouette } = require('../../util/canvas');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Pokemon Solid.ttf'), { family: 'Pokemon' });
const pokemonCount = 893;

exports.run = async(client, interaction) => {
    const channelId = interaction.channel.id;
    const current = client.games.get(channelId);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
    client.games.set(channelId, { prompt: `you should wait until **${interaction.user.username}** is finished with their game first :(` });
    const pokemon = Math.floor(Math.random() * (pokemonCount + 1))
    try {
        await interaction.deferReply();
        const data = await client.pokemon.fetch(pokemon.toString());
        const names = data.names.map(name => name.name.toLowerCase());
        const image = await createImage(data, true);
        const embed = new MessageEmbed()
            .setColor('#7DBBEB')
            .setTitle('you have 15 seconds, who\'s that Pokémon?')
            .setImage(`attachment://${image.name}`);
        await interaction.editReply({
            embeds: [embed],
            files: [new MessageAttachment(image.attachment, image.name)]
        });
        const msgs = await interaction.channel.awaitMessages({
            filter: res => res.author.id === interaction.user.id,
            max: 1,
            time: 15000
        });
        const answerimage = await createImage(data, false);
        client.games.delete(channelId);
        const embed1 = new MessageEmbed()
            .setColor('#7DBBEB')
            .setTitle(`time is up! it's ${data.name}!`)
            .setImage(`attachment://${answerimage.name}`)
        if (!msgs.size) return interaction.followUp({
            embeds: [embed1],
            files: [new MessageAttachment(answerimage.attachment, answerimage.name)]
        });
        const guess = msgs.first().content.toLowerCase();
        const slug = client.pokemon.makeSlug(guess);
        if (!names.includes(guess) && data.slug !== slug) {
            embed1.setTitle(`nope! it's ${data.name}!`)
            return interaction.followUp({
                embeds: [embed1],
                files: [new MessageAttachment(answerimage.attachment, answerimage.name)]
            });
        }
        embed1.setTitle(`nice! it's ${data.name}!`);
        return interaction.followUp({
            embeds: [embed1],
            files: [new MessageAttachment(answerimage.attachment, answerimage.name)]
        })
    } catch (err) {
        client.games.delete(channelId);
        return logger.log('error', err);
    };
};
async function createImage(pokemon, hide) {
    const name = `${pokemon.id}${hide ? '-hidden' : ''}.png`;
    const image = await request.get(pokemon.spriteImageURL);
    const file = hide ? 'hidden' : 'show';
    const bg = await loadImage(
        path.join(__dirname, '..', '..', 'assets', 'images', 'whos-that-pokemon', `${file}.png`)
    );
    const pkmn = await loadImage(image.body);
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bg, 0, 0);
    if (hide) {
        const silhouetteCanvas = createCanvas(pkmn.width, pkmn.height);
        const silhouetteCtx = silhouetteCanvas.getContext('2d');
        silhouetteCtx.drawImage(pkmn, 0, 0);
        silhouette(silhouetteCtx, 0, 0, pkmn.width, pkmn.height);
        ctx.drawImage(silhouetteCanvas, 30, 39, 200, 200);
    } else {
        ctx.drawImage(pkmn, 30, 39, 200, 200);
        ctx.font = '60px Pokemon';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#3c5aa6';
        ctx.strokeText(pokemon.name, 362, 158, 240);
        ctx.fillStyle = '#ffcb05';
        ctx.fillText(pokemon.name, 362, 158, 240);
    }
    return { attachment: canvas.toBuffer(), name };
}

exports.help = {
    name: "whos-that-pokemon",
    description: "guess who that Pokémon is, based on their silhouette.",
    usage: ["whos-that-pokemon"],
    example: ["whos-that-pokemon"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};