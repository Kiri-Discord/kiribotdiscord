const request = require('node-superfetch');
const { oneLine } = require('common-tags');
const { base64 } = require('../../util/util');
const { face_key, face_secret } = require('../../config.json');
const validUrl = require('valid-url');
const emotions = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'];
const emotionResponse = ['angry', 'disgusted', 'afraid', 'happy', 'uncaring', 'sad', 'surprised'];
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
exports.run = async(client, message, args) => {
    let image;
    let attachments = [...message.attachments.values()];
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.reply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) {
            try {
                const caches = message.channel.messages.cache.filter(msg => msg.attachments.size > 0);
                if (!caches.size) {
                    const fetchs = await message.channel.messages.fetch({ limit: 10 });
                    const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                    const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = target.first().attachments.first().url;
                } else {
                    const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = cache.last().attachments.first().url;
                };
            } catch (error) {
                return message.reply({ content: 'i found no recent photo in this channel :pensive:' });
            }
        } else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.reply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:");
    try {
        message.channel.sendTyping();
        const face = await detect(image);
        if (!face) {;
            return message.channel.send("wait a sec...there isn't any face in this image :frowning:");
        };
        if (face === 'size') {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        const pronoun = face.gender.value === 'Male' ? 'He' : 'She';
        const emotion = emotionResponse[emotions.indexOf(
            emotions.slice(0).sort((a, b) => face.emotion[b] - face.emotion[a])[0]
        )];
        const smile = face.smile.value > face.smile.threshold;
        const beautyScore = face.gender.value === 'Male' ? face.beauty.female_score : face.beauty.male_score;
        const stareEmoji = client.customEmojis.get('staring') ? client.customEmojis.get('staring') : ':grimacing:';;
        return message.reply(oneLine `
            i think this is a photo of a ${face.age.value} year old ${face.gender.value.toLowerCase()} ${stareEmoji}
            
            ${pronoun.toLowerCase()} appears to be ${emotion}, and is ${smile ? 'smiling' : 'not smiling'}. i give this
            face a ${Math.round(beautyScore)} on the 1-100 beauty scale.
            ${beautyScore > 50 ? beautyScore > 70 ? beautyScore > 90 ? 'nice' : 'not bad' : 'not _too_ bad.' : 'nice'}
        `);
    } catch (err) {;
        if (err.status === 400) return message.channel.send("wait a sec...there isn't any face in this image :frowning:");
        if (err.status === 403) return message.channel.send('hang on! the command is overloaded! try again later pls :(');
        else return message.reply(`sorry :( i got an error. try again later! can you check the image files?`)
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
}

exports.help = {
    name: "face",
    description: "give me a portrait and i will try to guess the race, gender, and age of that face 😄",
    usage: ["face `<image attachment or URL>`"],
    example: ["face `https://example.com/cat.jpg`"]
};

exports.conf = {
    aliases: ["face-analysis"],
    cooldown: 6,
    guildOnly: true,
}