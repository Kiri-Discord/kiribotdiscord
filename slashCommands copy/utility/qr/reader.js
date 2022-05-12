const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { MessageActionRow, MessageButton } = require('discord.js');
const { shorten } = require('../../../util/util');

exports.run = async(client, interaction) => {
    const url = interaction.options.getString('url');
    let image;
    if (url) {
        if (validUrl.isWebUri(url)) {
            if (!fileTypeRe.test(url)) return interaction.reply({
                content: "uh i think that URL you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:",
                ephemeral: true
            });
            image = url;
        } else {
            return interaction.reply({ content: "that is not a valid URL :pensive:", ephemeral: true });
        }
    } else {
        try {
            const caches = interaction.channel.messages.cache.filter(msg => msg.attachments.size > 0);
            if (!caches.size) {
                const fetchs = await interaction.channel.messages.fetch({ limit: 10 });
                const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                image = target.first().attachments.first().url;
            } else {
                const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                image = cache.last().attachments.first().url;
            };
        } catch (error) {
            return interaction.reply({ content: 'i found no recent photo in this channel :pensive:', ephemeral: true });
        };
    };
    await interaction.deferReply();
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/read-qr-code/')
            .query({ fileurl: image });
        const data = body[0].symbol[0];
        if (!data.data) return interaction.editReply(`i couldn't get a link from this QR code. are you sure that this is the right image?`);
        if (validUrl.isWebUri(data.data)) {
            const row = new MessageActionRow()
                .addComponents(new MessageButton()
                    .setStyle('LINK')
                    .setURL(data.data)
                    .setLabel('Avatar URL'))
            return interaction.editReply({ content: `here is your link:`, components: [row] });
        } else {
            return interaction.editReply({ content: `here is your decoded text:\n||${shorten(data.data), 1800}||` });
        };
    } catch (err) {
        return interaction.editReply(`sorry :pensive: i got an error. try again later! can you check the image files?`);
    };
};