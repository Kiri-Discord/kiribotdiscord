exports.run = async(client, message, args, prefix) => {
    if (!args.length) return message.channel.send({ embeds: [{ color: "#abb7b2", description: `you should follow the correct usage! use \`${prefix}help leveling-roles\` to learn more :wink:` }] });
    if (args[0].toLowerCase() === "set") {
        if (!args[1]) return message.channel.send({ embeds: [{ color: "RED", description: `you didn't specify the requirement level! use \`${prefix}help leveling-roles\` to learn more :wink:` }] });
        if (isNaN(args[1]) || args[1] < 1) return message.channel.send({ embeds: [{ color: "RED", description: `❌ the requirement level should be equal or larger than 1!` }] });
        const level = parseInt(args[1]);
        const roleName = args.slice(2).join(' ');
        if (!roleName) return message.channel.send({ embeds: [{ color: "RED", description: `❌ you didn't specify the role reward! use \`${prefix}help leveling-roles\` to learn more :wink:` }] });
        const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

        if (!role) return message.channel.send({ embeds: [{ color: "RED", description: `no valid role was provided! i can only accept role mention, role name and role ID :pensive:` }] });

        if (role.name === "@everyone") return message.channel.send({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }] });
        if (role.name === "@here") return message.channel.send({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }] });
    
        if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= role.position) return message.channel.send({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }] });
    
        if (!role.editable) return message.channel.send({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }] });

        const existingLevelReward = await client.db.levelingRewards.findOne({ guildId: message.guild.id, level: level });
        if (existingLevelReward) return message.channel.send({ embeds: [{ color: "RED", description: `a reward for level **${level}** already exists! to set a new role for the reward, run \`${prefix}leveling-roles remove ${level}\` :slight_smile:` }] });

        await client.db.levelingRewards.findOneAndUpdate({
            guildId: message.guild.id,
            roleId: role.id
        }, {
            guildId: message.guild.id,
            roleId: role.id,
            level
        }, {
            upsert: true,
            new: true,
        });

        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `the reward when reaching level **${level}** has been set to ${role.toString()} 🎉` }] });
    } else if (args[0].toLowerCase() === "remove") {
        const level = args[1];
        if (!level) return message.channel.send({ embeds: [{ color: "RED", description: `you didn't specify level requirement of the reward which you want to remove! use \`${prefix}help leveling-roles\` to learn more :wink:` }] });
        const roleReward = await client.db.levelingRewards.findOne({
            guildId: message.guild.id,
            level
        });
        if (!roleReward) return message.channel.send({ embeds: [{ color: "RED", description: `no existing reward with that level requirement was found!` }] });

        await client.db.levelingRewards.findOneAndDelete({
            guildId: message.guild.id,
            level
        });
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `the role reward when reaching level **${level}** has been removed 🗑` }] });
    }
}


exports.help = {
    name: "leveling-roles",
    description: "setup reward as roles to add when a user reaches a certain level, or remove an existing role reward",
    usage: ["leveling-roles \`set <level> <@Role>\`", "leveling-roles \`set <level> <role ID>\`", "leveling-roles \`remove <level>\`"],
    example: ["leveling-roles \`set 10 @Level 10\`", "leveling-roles \`set 20 7872465341\`", "leveling-roles \`remove 25\`"]
};

exports.conf = {
    aliases: ["levelingroles", "levelroles", "leveling-role"],
    cooldown: 4,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};