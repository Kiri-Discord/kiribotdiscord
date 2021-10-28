const request = require('node-superfetch');
const { oneLine } = require('common-tags');
const { base64 } = require('../../../util/util');
const { face_key, face_secret } = require('../../../config.json');
const validUrl = require('valid-url');
const emotions = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'];
const emotionResponse = ['angry', 'disgusted', 'afraid', 'happy', 'uncaring', 'sad', 'surprised'];
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

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
            return interaction.reply({ content: "that isn't a correct URL!", ephemeral: true });
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
    try {
        await interaction.deferReply();
        const face = await detect(image);
        if (!face) {
            return interaction.editReply("wait a sec...there isn't any face in this image :frowning:");
        };
        if (face === 'size') {
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        const pronoun = face.gender.value === 'Male' ? 'He' : 'She';
        const emotion = emotionResponse[emotions.indexOf(
            emotions.slice(0).sort((a, b) => face.emotion[b] - face.emotion[a])[0]
        )];
        const smile = face.smile.value > face.smile.threshold;
        const beautyScore = face.gender.value === 'Male' ? face.beauty.female_score : face.beauty.male_score;
        const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare') : ':grimacing:';;
        return interaction.editReply(oneLine `
            i think this is a photo of a ${face.age.value} year old ${face.gender.value.toLowerCase()} ${stareEmoji}
            
            ${pronoun.toLowerCase()} appears to be ${emotion}, and is ${smile ? 'smiling' : 'not smiling'}. i give this
            face a ${Math.round(beautyScore)} on the 1-100 beauty scale.
            ${beautyScore > 50 ? beautyScore > 70 ? beautyScore > 90 ? 'nice' : 'not bad' : 'not _too_ bad.' : 'nice'}
        `);
    } catch (err) {;
        if (err.status === 400) return interaction.editReply("wait a sec...there isn't any face in this image :frowning:");
        if (err.status === 403) return interaction.editReply('hang on! the command is overloaded! try again later pls :(');
        else return interaction.editReply(`sorry :( i got an error. try again later! can you check the image files?`)
    }
}

async function detect(image) {
    const imgData = await request.get(image);
    if (Buffer.byteLength(imgData.body) >= 2e+6) return 'size';
    const { body } = await request
        .post('https://api-us.faceplusplus.com/facepp/v3/detect')
        .attach('image_base64', base64(imgData.body))
        .query({
            api_key: face_key,
            api_secret: face_secret,
            return_attributes: 'gender,age,smiling,emotion,ethnicity,beauty'
        });
    if (!body.faces || !body.faces.length) return null;
    return body.faces[0].attributes;
};