const welcomeNatural = require('../assets/messages/normal/welcome.json');
const welcomeCute = require('../assets/messages/anime-ish/welcome.json');
const leaveNatural = require('../assets/messages/normal/leave.json');
const leaveCute = require('../assets/messages/anime-ish/leave.json');
const ordinal = require('ordinal/indicator');
const lodashClonedeep = require('lodash.clonedeep');

this.replaceEmbed = (embed, member, guild, responseType, leveling) => {
    const replacedEmbed = lodashClonedeep(embed);
    if (replacedEmbed.author) {
        const { name, icon_url } = replacedEmbed.author;
        if (name) replacedEmbed.author.name = this.replaceText(name, member, guild, responseType, leveling);
        if (icon_url) replacedEmbed.author.icon_url = this.replaceImage(icon_url, member, guild);
    };
    if (replacedEmbed.title) replacedEmbed.title = this.replaceText(replacedEmbed.title, member, guild, responseType, leveling);
    if (replacedEmbed.description) replacedEmbed.description = this.replaceText(replacedEmbed.description, member, guild, responseType, leveling);
    if (replacedEmbed.thumbnail) replacedEmbed.thumbnail.url = this.replaceImage(replacedEmbed.thumbnail.url, member, guild);
    if (replacedEmbed.image) replacedEmbed.image.url = this.replaceImage(replacedEmbed.image.url, member, guild);
    if (replacedEmbed.fields) replacedEmbed.fields.forEach(x => {
        x.name = this.replaceText(x.name, member, guild, responseType, leveling);
        x.value = this.replaceText(x.value, member, guild, responseType, leveling);
    });
    if (replacedEmbed.footer) {
        const { text } = replacedEmbed.footer;
        const { icon_url } = replacedEmbed.footer;
        if (text) replacedEmbed.footer.text = this.replaceText(text, member, guild, responseType, leveling);
        if (icon_url) replacedEmbed.footer.icon_url = this.replaceImage(icon_url, member, guild);
    };
    if (replacedEmbed.timestamp) replacedEmbed.timestamp = Date.now();
    return replacedEmbed;
};
this.replaceText = (content, member, guild, responseType, leveling) => {
    const input = `${content}`
    let resRandom = '||(default response)||';
    if (responseType) {
        if (responseType.event === 'join') {
            if (responseType.type === 'natural') resRandom = welcomeNatural[Math.floor(Math.random() * welcomeNatural.length)];
            else if (responseType.type === 'cute') resRandom = welcomeCute[Math.floor(Math.random() * welcomeCute.length)];
        } else if (responseType.event === 'leave') {
            if (responseType.type === 'natural') resRandom = leaveNatural[Math.floor(Math.random() * leaveNatural.length)];
            else if (responseType.type === 'cute') resRandom = leaveCute[Math.floor(Math.random() * leaveCute.length)];
        } else if (responseType.event === 'level') {
            resRandom = '**{user_name}**, you have reached level **{user_level}**! i will disappear from this convo in a sec..'
        }
    };
    const replaced = input
        .split('{auto}').join(resRandom)
        .split('{server_name}').join(guild.name)
        .split('{server_id}').join(guild.id)
        .split('{server_membercount}').join(guild.memberCount)
        .split('{server_membercount_ordinal}').join(ordinal(guild.memberCount))
        .split('{user}').join(member.user.toString())
        .split('{user_tag}').join(member.user.tag)
        .split('{user_name}').join(member.user.username)
        .split('{user_discriminator}').join(member.user.discriminator)
        .split('{user_id}').join(member.user.id)
        .split('{user_nick}').join(member.displayName)
        .split('{user_joindate}').join(`<t:${member.user.createdAt}:D> (<t:${member.user.createdAt}:R>)`)
        .split('{user_createdate}').join(`<t:${member.joinedAt}:D> (<t:${member.joinedAt}:R>)`)
        .split('{user_xp}').join(leveling ? leveling.xp : `||(xp)||`)
        .split('{user_level}').join(leveling ? leveling.level : `||(level)||`);
    return replaced;
};
this.replaceImage = (url, member, guild) => {
    const input = `${url}`
    const replaced = input
        .split("{user_avatar}").join(member.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }))
        .split('{server_icon}').join(guild.iconURL({ size: 4096, dynamic: true }) ? guild.iconURL({ size: 4096, dynamic: true }) : null);
    return replaced;
};