const request = require('node-superfetch');
const { oneLine } = require('common-tags');
const { base64 } = require('../../util/util');
const { face_key, face_secret } = process.env;
const emotions = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'];
const emotionResponse = ['angry', 'disgusted', 'afraid', 'happy', 'uncaring', 'sad', 'surprised'];

exports.run = async (client, message, args) => {
    let attachments = message.attachments.array();
    if (attachments.length === 0) return message.inlineReply("can you upload image along with that command?").then(m => m.delete({ timeout: 5000 }));
    else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
    let image = attachments[0].url
    try {
        message.channel.startTyping(true);
        const face = await detect(image);
        if (!face) return message.channel.send("wait a sec...there isn't any face in this image :frowning:").then(() => message.channel.stopTyping(true)).then(m => m.delete({ timeout: 5000 }));
        if (face === 'size') return message.channel.send("the file is way too big for me to upload lmao").then(() => message.channel.stopTyping(true)).then(m => m.delete({ timeout: 5000 }));
        const pronoun = face.gender.value === 'Male' ? 'He' : 'She';
        const emotion = emotionResponse[emotions.indexOf(
            emotions.slice(0).sort((a, b) => face.emotion[b] - face.emotion[a])[0]
        )];
        const smile = face.smile.value > face.smile.threshold;
        const beautyScore = face.gender.value === 'Male' ? face.beauty.female_score : face.beauty.male_score;
        const stareEmoji = client.customEmojis.get('stare') ? client.customEmojis.get('stare') : ':grimacing:';
        await message.channel.stopTyping(true);
        return message.inlineReply(oneLine`
            i think this is a photo of a ${face.age.value} year old ${face.gender.value.toLowerCase()} ${stareEmoji}
            
            ${pronoun.toLowerCase()} appears to be ${emotion}, and is ${smile ? 'smiling' : 'not smiling'}. i give this
            face a ${Math.round(beautyScore)} on the 1-100 beauty scale.
            ${beautyScore > 50 ? beautyScore > 70 ? beautyScore > 90 ? 'nice' : 'not bad' : 'not _too_ bad.' : 'nice'}
        `);
    } catch (err) {
        await message.channel.stopTyping(true);
        if (err.status === 400) return message.channel.send("wait a sec...there isn't any face in this image :frowning:");
        if (err.status === 403) return message.channel.send('hang on! the command is overloaded! try again later pls :(');
        else return message.inlineReply(`sorry :( i got an error. try again later! can you check the image files?`)
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
    usage: "face <image>",
    example: "face"
};

exports.conf = {
    aliases: ["face-analysis"],
    cooldown: 6,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
}