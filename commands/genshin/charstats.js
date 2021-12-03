const {
    createTable,
    PAD_START,
    Colors
} = require("../../features/genshin/utils");

const { MessageEmbed } = require('discord.js')

exports.run = (client, message, args, prefix) => {
    if (args.length < 1)
        return message.channel.send({
            embeds: [
                {
                    description: `
                    searching for character stats can be done using those examples below:

                    searching for a specific level: \`${prefix}charstats Hu Tao 84\`
                    searching for a specific ascension: \`${prefix}cs Hu Tao A6\`
                    searching for a specific level and ascension: \`${prefix}cs Hu Tao 80 A6\`
                    if no level or ascension is provided, the levels around all the ascensions will be shown.

                    *fuzzy search is enabled!*
                `,
                    title: 'you provided no character name :(',
                    color: '#cbd4c2'
                },
            ],
        });

    let level = -1,
        ascension = -1;

    while (args.length > 1)
        if (args[args.length - 1].match(/^\d+$/))
            level = parseInt(args.pop() ?? "-1");
        else if (args[args.length - 1].match(/^A\d+$/i))
            ascension = parseInt(args.pop()?.replace(/a/i, "") ?? "-1");
        else break;

    const name = args.join(" ");
    const { genshinData } = client;

    const char = genshinData.getCharacterByName(name);
    if (char == undefined) return message.channel.send({
        embeds: [
            {
                description: `
                searching for character stats can be done using those examples below:

                searching for a specific level: \`${prefix}charstats Hu Tao 84\`
                searching for a specific ascension: \`${prefix}cs Hu Tao A6\`
                searching for a specific level and ascension: \`${prefix}cs Hu Tao 80 A6\`
                if no level or ascension is provided, the levels around all the ascensions will be shown.

                *fuzzy search is enabled!*
            `,
                title: "that character doesn't exist :(",
                color: '#cbd4c2'
            },
        ],
    });
    function getCharStats(char, searchLevel, searchAscension) {
        const columns = []
        const rows = []

        const addRow = (char, level, ascension) => {
            const stats = genshinData.getCharStatsAt(char, level, ascension)
            for (const key of Object.keys(stats))
                if (!columns.includes(key))
                    columns.push(key)

            const row = [level.toString(), ascension.toString(), ...columns.map(c => genshinData.stat(c, stats[c]))]
            if ((level == searchLevel || searchLevel == -1) &&
                 (ascension == searchAscension || searchAscension == -1))
                rows.push(row)
        }


        let previousMax = 1
        for (const asc of char.ascensions) {
            if (searchLevel == -1 && searchAscension == -1) {
                addRow(char, previousMax, asc.level)
                previousMax = asc.maxLevel
                addRow(char, previousMax, asc.level)
            } else {
                for (let i = previousMax; i <= asc.maxLevel; i++)
                    addRow(char, i, asc.level)
                previousMax = asc.maxLevel
            }
        }
        if (rows.length == 0)
            return `No stats found for filters ${searchLevel == -1 ? "" : `level = ${searchLevel} `}${searchAscension == -1 ? "" : `ascension = ${searchAscension} `}`

        return `
\`\`\`
${createTable(
        ["Lvl", "Asc", ...columns.map(c => genshinData.statName(c))],
        rows,
        [PAD_START]
    ) }
\`\`\``
    };

    const embed = new MessageEmbed()
        .setFooter(`you can display stats for a specific level or ascension using ${prefix}charstats <name> [level] A[ascension]!`)
        .setTitle(`${char.name}'s stats`)
        .setColor(Colors[char.meta.element] ?? "")
        .setDescription(getCharStats(char, level, ascension))
        .setThumbnail(char.icon)
    return message.channel.send({embeds: [embed]})
};

exports.help = {
    name: "charstats",
    description:
        "display stats for a specific character! when no level or ascension is provided, the levels around all the ascensions will be shown.",
    longDescription: "display stats for a specific Genshin Impact character!\n\nexample for searching for a specific level: \`charstats Hu Tao 84\`\nexample for searching for specific ascension: \`charstats Hu Tao A6\`\nexample for searching for a specific level and ascension: \`charstats Hu Tao 80 A6\`\n\n*if no level or ascension is provided, the levels around all the ascensions will be shown instead!*",
    usage: ["charstats `<name> [level] A[ascension]`"],
    example: ["cs `Ganyu 50`", "cs `Hu Tao 80 A6`"],
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
