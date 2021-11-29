const { addArg } = require('../../util/util');
const { Colors, createTable, PAD_END, PAD_START, paginator, sendMessage, simplePaginator } = require('../../features/genshin/utils');

const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args, prefix) => {
    const elementTypes = client.genshinData.getCharacters()
    .map(c => c.meta.element)
    .filter((v, i, arr) => arr.indexOf(v) == i && v !== "None")
    .sort()

    const weaponTypes = client.genshinData.getCharacters()
        .map(c => c.weaponType)
        .filter((v, i, arr) => arr.indexOf(v) == i)
        .sort()

    const possibleStars = client.genshinData.getCharacters()
        .map(c => c.star)
        .filter((v, i, arr) => arr.indexOf(v) == i)
        .sort((a, b) => a-b);
    const elementMap = {
        Wind: "Anemo",
        Rock: "Geo",
        Electric: "Electro",
        Fire: "Pyro",
        Grass: "Dendro",
        Ice: "Cryo",
        Water: "Hydro",
    };
    const { genshinData } = client;

    const elementFilter = []
    for (const element of elementTypes)
        addArg(message.flags, [`-${element}`], () => elementFilter.push(element))

    const weaponTypeFilter = []
    for (const weaponType of weaponTypes)
        addArg(message.flags, [`-${weaponType}`], () => weaponTypeFilter.push(weaponType))

    const starFilter = [];
    for (const star of possibleStars)
        addArg(message.flags, [`-${star}`, `-${star}*`], () => starFilter.push(star))

    let talentMode = "LITTLE"
    let defaultPage = 0

    addArg(message.flags, ["-low", "-l"], () => {
        talentMode = "LOW"
        defaultPage = 4
    })
    addArg(message.flags, ["-high", "-h"], () => {
        talentMode = "HIGH"
        defaultPage = 4
    });
    addArg(message.flags, ["-info", "-i"], () => defaultPage = 1)
    addArg(message.flags, ["-art", "-a"], () => defaultPage = "Art")
    addArg(message.flags, ["-stats", "-asc", "-ascensions", "-ascend"], () => defaultPage = 2)
    addArg(message.flags, ["-books", "-talentupgrade"], () => defaultPage = 3)
    addArg(message.flags, ["-skill", "-skills", "-talents", "-s", "-t"], () => defaultPage = 4)
    addArg(message.flags, ["-passive", "-passives", "-p"], () => defaultPage = "Passives")
    addArg(message.flags, ["-const", "-constellation", "-constellations", "-c"], () => defaultPage = "Constellations")
    if (elementFilter.includes("Anemo")) defaultPage = "Anemo"
    if (elementFilter.includes("Geo")) defaultPage = "Geo"
    if (elementFilter.includes("Electro")) defaultPage = "Electro"
    if (elementFilter.includes("Pyro")) defaultPage = "Pyro"
    if (elementFilter.includes("Dendro")) defaultPage = "Dendro"
    if (elementFilter.includes("Cryo")) defaultPage = "Cryo"
    if (elementFilter.includes("Hydro")) defaultPage = "Hydro"

    const name = args.join(" ");
    const sed = client.customEmojis.get("sed");
    if (name.length == 0) {
        const pages = getCharactersPages(elementFilter, weaponTypeFilter, starFilter)
        if (pages.length == 0) return sendMessage(message, `no character data was loaded ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getCharacterPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }

    const char = genshinData.getCharacterByName(name)
    if (char == undefined) {

        return sendMessage(message, `i couldn't find that character, sorry ${sed}`)
    };

    const charpages = getCharPages(char, talentMode)

    await paginator(message, charpages, defaultPage)
    return undefined;

    function getCharactersPages(elementFilter, weaponTypeFilter, starFilter) {
        const data = genshinData;
        const chars = data.getCharacters()
            .filter((char) => starFilter.length == 0 || starFilter.includes(char.star))
            .filter((char) => elementFilter.length == 0 || elementFilter.find(elem => getElementIcons(char).includes(elem)))
            .filter((char) => weaponTypeFilter.length == 0 || weaponTypeFilter.includes(char.weaponType))
            .sort((a, b) => b.releasedOn.localeCompare(a.releasedOn) || b.star - a.star || a.name.localeCompare(b.name))
            .map((char) => `${getElementIcons(char)} ${char.star} **${char.name}**: ${data.emoji(char.weaponType, true)} user`)
    
        const pages = []
        let paging = "", c = 0
        for (const char of chars) {
            if (paging.length + char.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = char
                c = 1
            } else
                paging += "\n" + char
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    };
    
    function getCharacterPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined
    
        const embed = new MessageEmbed()
            .setTitle("Character list")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} / ${maxPages} - use '${prefix}character <name>' to get info about a character!`)
            .setColor(Colors.GREEN)
    
        return embed
    };
    function getElementIcons(info) {
        const data = genshinData;
        return info.skills.map(skill => data.emoji(skill.ult.type)).join(", ")
    };
    function getMainPage(char, relativePage, currentPage, maxPages) {
        const data = genshinData;
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setThumbnail(char.icon)
            .setFooter(`Page ${currentPage} / ${maxPages}`)

        if (relativePage == 0) {
            const maxAscension = char.ascensions[char.ascensions.length - 1]
            embed.setTitle(`${char.name}: Description`)
                .addField("Basics", `${getElementIcons(char)} ${char.star} :star: ${data.emoji(char.weaponType, true)} user`)
                .setDescription(char.desc)
                .addField("Base stats", `${
                    Object.entries(data.getCharStatsAt(char, 1, 0))
                        .map(([name, value]) => `**${name}**: ${data.stat(name, value)}`)
                        .join("\n")
                }`, true)
                .addField(`Lv. ${maxAscension.maxLevel} A${maxAscension.level} stats`, `${
                    Object.entries(data.getCharStatsAt(char, maxAscension.maxLevel, maxAscension.level))
                        .map(([name, value]) => `**${name}**: ${data.stat(name, value)}`)
                        .join("\n")
                }`, true)

            const talentCostLv2 = char.skills[0]?.ult.costs[2]?.items,
                  talentCostLv3 = char.skills[0]?.ult.costs[3]?.items,
                  talentCostLv4 = char.skills[0]?.ult.costs[4]?.items,
                  talentCostLv5 = char.skills[0]?.ult.costs[5]?.items

            let talentMat = [
                talentCostLv4[0],
                talentCostLv4[1],
                ...talentCostLv5.slice(2),
            ]

            if (talentCostLv3[0].name !== talentCostLv4[0].name) {
                talentMat = [
                    talentCostLv3[0],
                    talentCostLv4[0],
                    talentCostLv2[0],
                    talentCostLv4[1],
                    ...talentCostLv5.slice(2),
                ]
            }

            embed.addField("Upgrade material", `Ascensions: ${char.ascensions[4]?.cost.items.map(i => data.emoji(i.name)).join("")}
Talents: ${talentMat.map(i => data.emoji(i.name)).join("")}`)
            return embed
        } else if (relativePage == 1) {
            embed.setTitle(`${char.name}: Information`)
                .setDescription(`${char.meta.birthDay != undefined && char.meta.birthMonth!= undefined ? `**Birthday**: ${
                    new Date(Date.UTC(2020, char.meta.birthMonth - 1, char.meta.birthDay))
                        .toLocaleString("en-UK", {
                            timeZone: "UTC",
                            month: "long",
                            day: "numeric",
                        })}
` : ""}**Title**: ${char.meta.title || "-"}
**Detail**: ${char.meta.detail}

**Association**: ${char.meta.association}
**Affiliation**: ${char.meta.affiliation}
**Constellation**: ${char.meta.constellation}
**Element**: ${char.meta.element}`)
                .addField("Voice Actors", `**Chinese**: ${char.meta.cvChinese}
**Japanese**: ${char.meta.cvJapanese}
**English**: ${char.meta.cvEnglish}
**Korean**: ${char.meta.cvKorean}
`)
            return embed
        }

        return undefined
    }
    function getStatsPage(char, relativePage, currentPage, maxPages) {
        const data = genshinData;
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setThumbnail(char.icon)
            .setFooter(`Page ${currentPage} / ${maxPages}`)

        if (relativePage == 0) {
            const columns= []
            const rows = []

            const addRow = (char, level, ascension) => {
                const stats = data.getCharStatsAt(char, level, ascension)
                for (const key of Object.keys(stats))
                    if (!columns.includes(key))
                        columns.push(key)

                rows.push([level.toString(), ascension.toString(), ...columns.map(c => data.stat(c, stats[c]))])
            }

            let previousMax = 1
            for (const asc of char.ascensions) {
                addRow(char, previousMax, asc.level)
                previousMax = asc.maxLevel
                addRow(char, previousMax, asc.level)

                if (asc.cost.mora || asc.cost.items.length > 0)
                    embed.addField(`Ascension ${asc.level} costs`, data.getCosts(asc.cost), true)
            }

            embed.setTitle(`${char.name}: Ascensions + stats`)
                .setDescription("Character stats:\n```\n" + createTable(
                    ["Lvl", "Asc", ...columns.map(c => data.statName(c))],
                    rows,
                    [PAD_START]
                ) + "\n```")
                .setFooter(`${embed.footer?.text} - Use '${prefix}charstats ${char.name} [level] [A<ascension>]' for a specific level`)

            return embed
        } else if (relativePage == 1) {
            let i = 1
            for (const cost of char.skills[0].ult.costs) {
                if (cost.mora || cost.items.length > 0)
                    embed.addField(`Talent lv ${++i} costs`, data.getCosts(cost), true)
            }

            embed.setTitle(`${char.name}: Talent upgrade costs`)
            return embed
        }

        return undefined
    }
    function getArtPage(char, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setThumbnail(char.icon)
            .setFooter(`Page ${currentPage} / ${maxPages}`)

        if (relativePage >= 0 && relativePage < char.imgs.length) {
            const img = char.imgs[relativePage]
            embed.setTitle(`${char.name}`)
                .setDescription(`[Image URL](${img})`)
                .setImage(img)
            embed.thumbnail = null
            return embed
        }

        return undefined
    }

    function getCharacter(char, relativePage, currentPage, maxPages, talentMode) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setThumbnail(char.icon)
            .setFooter(`Page ${currentPage} / ${maxPages}`)

        function showTalent(skill) {
            embed.setTitle(`${char.name}: ${skill.name}`)
                .setDescription(skill.desc)

            if (skill.charges > 1)
                embed.addField("Charges", skill.charges.toString())

            let hasLevels = false
            for (const { name, values } of skill.talentTable) {
                if (values.filter(k => k != values[0]).length > 0) {
                    hasLevels= true
                    embed.addField(name, "```\n"+ createTable(
                        undefined,
                        Object.entries(values)
                            .map(([lv, val]) => [+lv + 1, val])
                            .filter(([lv]) => {
                                switch (talentMode) {
                                    case "HIGH":
                                        return lv >= 6 && lv <= 13
                                    case "LOW":
                                        return lv <= 6
                                    case "LITTLE":
                                    default:
                                        return [6, 9, 12].includes(+lv)
                                }
                            }),
                        [PAD_START, PAD_END]
                    ) + "\n```", true)
                } else
                    embed.addField(name, values[0], true)
            }
            if (skill.type)
                embed.addField("Element type", skill.type, true)
            if (hasLevels && talentMode == "HIGH")
                embed.setFooter(`${embed.footer?.text} - use '${prefix}character ${char.name} -low' to display lower levels`)
            else if (hasLevels && talentMode == "LOW")
                embed.setFooter(`${embed.footer?.text} - use '${prefix}character ${char.name} -high' to display higher levels`)
            else if (hasLevels && talentMode == "LITTLE")
                embed.setFooter(`${embed.footer?.text} - Use '${prefix}character ${char.name} -high' (or -low) to display higher (or lower) levels`)
        }

        let page = 0
        for (const skills of char.skills) {
            embed.setColor(Colors[skills.ult.type ?? "None"])

            for (const talent of skills.talents) {
                if (page++ == relativePage) {
                    showTalent(talent)
                    return embed
                }
            }

            if (page++ == relativePage) {
                showTalent(skills.ult)
                return embed
            }

            if (page++ == relativePage) {
                embed.setTitle(`${char.name}: Passives`)
                for (const passive of skills.passive.sort((a, b) => a.minAscension - b.minAscension)) {
                    embed.addField(passive.name, `${passive.desc}
    
*${passive.minAscension > 0 ? `Unlocks at ascension **${passive.minAscension}**` : "Unlocked by **default**"}*`)
                }
                return embed
            }

            if (page++ == relativePage) {
                embed.setTitle(`${char.name}: Constellations`)
                    .setThumbnail(skills.constellations[0]?.icon)
                let c = 0
                for (const constellation of skills.constellations)
                    embed.addField(`C${++c}: ${constellation.name}`, constellation.desc)

                return embed
            }
        }

        return undefined
    }

    function getCharPages(char, talentMode) {
        const data = genshinData;

        const pages = [
            {
                bookmarkEmoji: "📝",
                bookmarkName: "General",
                maxPages: 2,
                pages: (rp, cp, mp) => getMainPage(char, rp, cp, mp)
            },
            {
                bookmarkEmoji: "🚀",
                bookmarkName: "Stats",
                maxPages: 2,
                pages: (rp, cp, mp) => getStatsPage(char, rp, cp, mp)
            }
        ]

        if (char.skills.length == 1) {
            const skills = char.skills[0]
            pages.push({
                bookmarkEmoji: data.emojis[char.weaponType] ?? "⚔️",
                bookmarkName: "Talents",
                maxPages: skills.talents.length + 1,
                pages: (rp, cp, mp) => getCharacter(char, rp, cp, mp, talentMode)
            }, {
                bookmarkEmoji: "💤",
                bookmarkName: "Passives",
                maxPages: 1,
                pages: (rp, cp, mp) => getCharacter(char, rp + skills.talents.length + 1, cp, mp, talentMode)
            }, {
                bookmarkEmoji: "🇨",
                bookmarkName: "Constellations",
                maxPages: 1,
                pages: (rp, cp, mp) => getCharacter(char, rp + skills.talents.length + 2, cp, mp, talentMode)
            })

        } else {
            let currentPage = 0
            for (const skills of char.skills) {
                const offset = currentPage

                pages.push({
                    bookmarkEmoji: data.emojis[skills.ult.type] ?? "❔",
                    bookmarkName: elementMap[skills.ult.type ?? "?"] ?? "Unknown",
                    maxPages: skills.talents.length + 3,
                    pages: (rp, cp, mp) => getCharacter(char, rp + offset, cp, mp, talentMode)
                })

                currentPage += skills.talents.length + 3
            }
        }
        pages.push({
            bookmarkEmoji: "🎨",
            bookmarkName: "Art",
            maxPages: char.imgs.length,
            pages: (rp, cp, mp) => getArtPage(char, rp, cp, mp)
        })

        return pages
    }
}


exports.help = {
    name: "character",
    description: "displays a Genshin Impact character information. if no name is provided, a list of all characters will be displayed.",
    usage: ["character \`[name]\`"],
    example: ["character `Ganyu`"]
};

exports.conf = {
    aliases: ['characters'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}