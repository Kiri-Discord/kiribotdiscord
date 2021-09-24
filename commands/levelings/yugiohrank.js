const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { firstUpperCase } = require('../../util/util');
const { wrapText } = require('../../util/canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Matrix Book.ttf'), { family: 'Matrix Book' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Matrix Small Caps.ttf'), { family: 'Matrix' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Stone Serif.ttf'), { family: 'Stone Serif' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Stone Serif Small Caps.ttf'), {
    family: 'Stone Serif Small Caps'
});
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Stone Serif LT Italic.ttf'), {
    family: 'Stone Serif LT Italic'
});


exports.run = async(client, message, args) => {
    let rank;
    let mention = await getMemberfromMention(args[0], message.guild) || message.member;

    let target = await client.dbleveling.findOne({
        guildId: message.guild.id,
        userId: mention.user.id
    });

    if (!target) return message.reply({ embeds: [{ color: "#bee7f7", description: `❌ you or that user doesn't have any leveling data yet! stay around a little longer :D` }] });

    const res = client.leveling.getLevelBounds(target.level + 1)

    let neededXP = res.lowerBound - target.xp

    const result = await client.dbleveling.find({
        guildId: message.guild.id,
    }).sort({
        xp: -1
    })

    if (!result) {
        return message.reply({ embeds: [{ color: "#bee7f7", description: `❌ this guild doesn't have any leveling data yet! stay around a little longer :slight_smile_` }] })
    };
    for (let counter = 0; counter < result.length; ++counter) {
        let member = message.guild.members.cache.get(result[counter].userId)
        if (!member) {
            client.dbleveling.findOneAndDelete({
                userId: result[counter].userId,
                guildId: message.guild.id,
            }, (err) => {
                if (err) logger.log('error', err)
            });
        } else if (member.user.id === mention.user.id) {
            rank = counter + 1
        };
    };
    const type = "monster"
    const list1 = [
        "effect",
        "fusion",
        "link",
        "normal",
        "ritual",
        "synchro",
        "token",
        "xyz",
    ];
    const list2 = [
        "dark",
        "divine",
        "earth",
        "fire",
        "laugh",
        "light",
        "spell",
        "trap",
        "water",
        "wind",
    ];
    message.channel.sendTyping();
    const randommonsterType = Math.floor(Math.random() * (list1.length - 1) + 1);

    const randomattribute = Math.floor(Math.random() * (list2.length - 1) + 1);
    const monsterType = list1[randommonsterType]
    const attribute = list2[randomattribute]
    const id = Math.floor(Math.random() * 100000000);

    const setID = Math.floor(Math.random() * 1000);;
    try {
        const name = `${mention.user.tag}`
        const species = "species"
        const effect = `Originated from ${message.guild.name}. Might hurt you while ranked ${rank} in this guild.`
        const level = target.level;
        const atk = `${target.xp}`
        const def = `${neededXP}`
        const base = await loadImage(
            path.join(__dirname, '..', '..', 'assets', 'images', 'yu-gi-oh-gen', 'bases', `${monsterType}.png`)
        );
        const atr = await loadImage(
            path.join(__dirname, '..', '..', 'assets', 'images', 'yu-gi-oh-gen', 'atrs', `${attribute}.png`)
        );
        const { body } = await request.get(mention.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }));
        const data = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, base.width, base.height);
        const height = 617 / data.width;
        ctx.drawImage(data, 98, 217, 617, data.height * height);
        ctx.drawImage(base, 0, 0);
        ctx.drawImage(atr, 686, 55 + (monsterType === 'link' ? 4 : 0), 70, 70);
        if (level > 0) {
            const levelToUse = monsterType === 'xyz' ? 'rank' : 'level';
            const levelI = await loadImage(
                path.join(__dirname, '..', '..', 'assets', 'images', 'yu-gi-oh-gen', `${levelToUse}.png`)
            );
            const maxLvl = level > 10 ? 10 : level;
            for (let i = 0; i < maxLvl; i++) {
                let levelX;
                if (monsterType === 'xyz') levelX = 76 + (50 * i) + (5 * i);
                else levelX = 686 - (50 * i) - (5 * i);
                ctx.drawImage(levelI, levelX, 141, 50, 50);
            };
        };
        ctx.fillStyle = monsterType === 'xyz' || monsterType === 'link' ? 'white' : 'black';
        ctx.textBaseline = 'top';
        ctx.font = '87px Matrix';
        ctx.fillText(name, 60, 57, 620);
        ctx.fillStyle = 'black';
        ctx.font = '31px Stone Serif Small Caps';
        let typeStr = `[ ${firstUpperCase(species)} / ${firstUpperCase(monsterType)}`;
        if (monsterType !== 'normal' && monsterType !== 'effect' && monsterType !== 'token') {
            typeStr += ' / Effect';
        }
        typeStr += ' ]';
        ctx.fillText(typeStr, 60, 894);
        ctx.font = '29px Stone Serif';
        ctx.fillText(atk.padStart(4, '  '), 514, 1079);
        if (monsterType === 'link') ctx.fillText(def, 722, 1079);
        else ctx.fillText(def.padStart(4, '  '), 675, 1079);
        ctx.font = monsterType === 'normal' ? '27px Stone Serif LT Italic' : '27px Matrix Book';
        const wrappedEffect = await wrapText(ctx, effect, 690);
        const trimmed = wrappedEffect.slice(0, type === 'monster' ? 4 : 6);
        ctx.fillText(trimmed.join('\n'), 63, 933 - (type === 'monster' ? 0 : 34));
        ctx.font = '22px Stone Serif';
        ctx.fillStyle = monsterType === 'xyz' ? 'white' : 'black';
        ctx.fillText(id.toString().padStart(8, '0'), 43, 1128);
        ctx.fillText(`KIRI-EN${setID.toString().padStart(3, '0')}`, 589 - (monsterType === 'link' ? 58 : 0), 849);
        return message.channel.send({ content: `*i proudly present* **${mention.user.username}** *yugioh card!*`, files: [{ attachment: canvas.toBuffer(), name: 'yu-gi-oh-gen.png' }] })
    } catch (err) {
        return message.channel.send(`sorry :( i got an error. try again later!`);
    };
}


exports.help = {
    name: "yugiohrank",
    description: "generate yours or other's Yugioh card base on your stat in the server",
    usage: ["yugiohrank `[@member]`"],
    example: ["yugiohrank `@bell`"]
};

exports.conf = {
    aliases: ["yrank"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES", "EMBED_LINKS"]
};