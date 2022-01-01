const { addArg } = require('../../util/util');
const { Colors, createTable, PAD_END, PAD_START, paginator, sendMessage, simplePaginator } = require('../../features/genshin/utils');

const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args, prefix) => {
    const data = client.genshinData;

    const elementTypes = client.genshinData.getCharacters()
    .map(c => c.meta.element)
    .filter((v, i, arr) => arr.indexOf(v) == i && v !== "None")
    .sort()
    const weaponTypes = client.genshinData.getReleasedCharacters()
    .map(c => c.weaponType)
    .filter((v, i, arr) => arr.indexOf(v) == i)
    .sort()

const possibleStars = client.genshinData.getReleasedCharacters()
    .map(c => c.star)
    .filter((v, i, arr) => arr.indexOf(v) == i)
    .sort((a, b) => a-b)

    const elementFilter = [];
    for (const element of elementTypes)
        addArg(message.flags, [`${element}`], () => elementFilter.push(element))

    const weaponTypeFilter = []
    for (const weaponType of weaponTypes)
        addArg(message.flags, [`${weaponType}`], () => weaponTypeFilter.push(weaponType))

    const starFilter = []
    for (const star of possibleStars)
        addArg(message.flags, [`${star}`, `-${star}*`], () => starFilter.push(star))

    let talentMode = "LITTLE"
    let defaultPage = 0

    addArg(message.flags, ["low", "l"], () => {
        talentMode = "LOW"
        defaultPage = 4
    })
    addArg(message.flags, ["high", "h"], () => {
        talentMode = "HIGH"
        defaultPage = 4
    })
    addArg(message.flags, ["info", "i"], () => defaultPage = 1)
    addArg(message.flags, ["art", "a"], () => defaultPage = "Art")
    addArg(message.flags, ["stats", "asc", "ascensions", "ascend"], () => defaultPage = 2)
    addArg(message.flags, ["books", "talentupgrade"], () => defaultPage = 3)
    addArg(message.flags, ["skill", "skills", "talents", "s", "t"], () => defaultPage = "Talents")
    addArg(message.flags, ["passive", "passives", "p"], () => defaultPage = "Passives")
    addArg(message.flags, ["const", "constellation", "constellations", "c"], () => defaultPage = "Constellations")

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
        if (pages.length == 0) return sendMessage(message, `no character data was loaded! you should join my support server via \`${prefix}invite\` if this problem persist ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getCharacterPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }
    const char = data.getCharacterByName(name)
    if (char == undefined) return sendMessage(message, `i couldn't find that character, sorry ${sed}`)

    const charpages = getCharPages(char, talentMode)

    await paginator(message, charpages, defaultPage)
    return undefined

    function getCharactersPages(elementFilter, weaponTypeFilter, starFilter) {
        const chars = data.getCharacters()
            .filter((char) => starFilter.length == 0 || (char.star && starFilter.includes(char.star)))
            .filter((char) => elementFilter.length == 0 || elementFilter.find(elem => getElementIcons(char).includes(elem)))
            .filter((char) => weaponTypeFilter.length == 0 || (char.weaponType && weaponTypeFilter.includes(char.weaponType)))
            .sort((a, b) => {
                if (data.isFullCharacter(a) && data.isFullCharacter(b))
                    return b.releasedOn.localeCompare(a.releasedOn) || b.star - a.star || a.name.localeCompare(b.name)
                else if (!data.isFullCharacter(b))
                    return 1
                else if (!data.isFullCharacter(a))
                    return -1
                else return a.name.localeCompare(b.name)
            })
            .map((char) => `**${char.name}**: ${getBasicInfo(char)}`)

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
    }
    function getCharacterPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Character list")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} / ${maxPages} - see '${prefix}help char' for more info about a character!`)
            .setColor(Colors.GREEN)

        return embed
    }
    function getElementIcons(char) {            
        const emoji = char.skills?.map(skill => skill.ult && data.emoji(skill.ult.type)).filter(x => x)
        if (emoji && emoji?.length > 0)
            return emoji.join(", ")
        else
            return data.emoji(char.meta.element)
    }
    function getMainPage(char, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setFooter(`page ${currentPage} / ${maxPages}`)

        if (char.icon)
            embed.setThumbnail(char.icon)

        if (relativePage == 0) {
            embed.setTitle(`${char.name}: Description`)
                .setDescription(char.desc)
                .addField("Basics", getBasicInfo(char))

            if (data.isFullCharacter(char)) {
                const maxAscension = char.ascensions[char.ascensions.length - 1]
                embed.addField("Base stats", `${
                    Object.entries(data.getCharStatsAt(char, 1, 0))
                        .map(([name, value]) => `**${name}**: ${data.stat(name, value)}`)
                        .join("\n")
                }`, true)
                    .addField(`Lv. ${maxAscension.maxLevel} A${maxAscension.level} stats`, `${
                        Object.entries(data.getCharStatsAt(char, maxAscension.maxLevel, maxAscension.level))
                            .map(([name, value]) => `**${name}**: ${data.stat(name, value)}`)
                            .join("\n")
                    }`, true)

                const upgradeLines = []
                if (char.ascensionCosts ) {
                    const ascensionCosts = [
                        char.ascensionCosts.mapping.Gem4,
                        char.ascensionCosts.mapping.BossMat,
                        char.ascensionCosts.mapping.Specialty,
                        char.ascensionCosts.mapping.EnemyDropTier3,
                    ].filter(x => x)
                    upgradeLines.push(`Ascensions: ${ascensionCosts.map(i => data.emoji(i)).join("")}`)
                }
                if (char.skills) {
                    const talents = char.skills
                        .flatMap(s => [...(s.talents ?? []), s.ult ])
                        .filter(x => x)
                    const books = talents
                        .flatMap(s => [
                            s?.costs?.mapping.Book,
                            s?.costs?.mapping.Book1,
                            s?.costs?.mapping.Book2,
                            s?.costs?.mapping.Book3,
                        ])
                        .filter((x, i, a) => x && a.indexOf(x) == i)
                        .map(x => `Guide to ${x}`)
                    const mats = talents
                        .map(s => s?.costs?.mapping.BossMat)
                        .filter((x, i, a) => x && a.indexOf(x) == i)
                    const drops = talents
                        .map(s => s?.costs?.mapping.EnemyDropTier3)
                        .filter((x, i, a) => x && a.indexOf(x) == i)
                    const all = [...books, ...mats, ...drops]
                    if (all.length > 0)
                        upgradeLines.push(`Talents: ${all.map(i => data.emoji(i)).join("")}`)
                }
                if (upgradeLines.length > 0) embed.addField("Upgrade material", upgradeLines.join("\n"))
            }


            return embed
        } else if (relativePage == 1) {
            let metadata = ""
            if (char.meta.birthDay != undefined && char.meta.birthMonth!= undefined)
                metadata += `**Birthday**: ${
                    new Date(Date.UTC(2020, char.meta.birthMonth - 1, char.meta.birthDay))
                        .toLocaleString("en-UK", {
                            timeZone: "UTC",
                            month: "long",
                            day: "numeric",
                        })}
`
            if (char.meta.detail)
                metadata += `**Detail**: ${char.meta.detail}\n`
            if (char.meta.title)
                metadata += `**Title**: ${char.meta.title}\n`

            if (metadata.length > 0)
                metadata += "\n"
            if (char.meta.association)
                metadata += `**Association**: ${char.meta.association}\n`
            if (char.meta.affiliation)
                metadata += `**Affiliation**: ${char.meta.affiliation}\n`
            if (char.meta.constellation)
                metadata += `**Constellation**: ${char.meta.constellation}\n`
            if (char.meta.element)
                metadata += `**Element**: ${char.meta.element}\n`

            embed.setTitle(`${char.name}: Information`)
                .setDescription(metadata.trim())
            const va = []
            if (char.meta.cvChinese)
                va.push(`**Chinese**: ${char.meta.cvChinese}`)
            if (char.meta.cvJapanese)
                va.push(`**Japanese**: ${char.meta.cvJapanese}`)
            if (char.meta.cvEnglish)
                va.push(`**English**: ${char.meta.cvEnglish}`)
            if (char.meta.cvKorean)
                va.push(`**Korean**: ${char.meta.cvKorean}`)
            if (va.length>0)
                embed.addField("Voice actors", va.join("\n"))
            return embed
        }

        return undefined
    }
    function getBasicInfo(char) {
        let basic = getElementIcons(char)
        if (char.star)
            basic += ` ${char.star}★`

        if (char.weaponType)
            basic += ` ${data.emoji(char.weaponType, true)} user`
        else
            basic += " Character (unreleased)"

        return basic
    }
    function getStatsPage(char, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setThumbnail(char.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)

        if (relativePage == 0) {
            const columns = []
            const rows = []

            const addRow = (char, level, ascension) => {
                const stats = data.getCharStatsAt(char, level, ascension)
                for (const key of Object.keys(stats))
                    if (!columns.includes(key))
                        columns.push(key)

                rows.push([level.toString(), ascension.toString(), ...columns.map(c => data.stat(c, stats[c]))])
            }

            let previousMax = 1
            const costs = data.getCostsFromTemplate(char.ascensionCosts)
            for (const asc of char.ascensions) {
                addRow(char, previousMax, asc.level)
                previousMax = asc.maxLevel
                addRow(char, previousMax, asc.level)

                const cost = costs[asc.level]
                if (cost.mora || cost.items.length > 0)
                    embed.addField(`Ascension ${asc.level} costs`, data.getCosts(cost), true)

            }

            embed.setTitle(`${char.name}: Ascensions + stats`)
                .setDescription("Character stats:\n```\n" + createTable(
                    ["Lvl", "Asc", ...columns.map(c => data.statName(c))],
                    rows,
                    [PAD_START]
                ) + "\n```")
                .setFooter(`${embed.footer?.text} - you can use '${prefix}charstats ${char.name} [level] [A<ascension>]' for a specific level!`)

            return embed
        } else if (relativePage >= 1) {
            const skills = char.skills[relativePage - 1]
            const template = skills.ult?.costs
            if (!template) return embed

            let i = 1
            for (const cost of data.getCostsFromTemplate(template)) {
                if (cost.mora || cost.items.length > 0)
                    embed.addField(`Talent lv ${++i} costs`, data.getCosts(cost), true)
            }

            embed.setTitle(`${char.name}: Talent upgrade costs`).setColor(Colors[skills.ult?.type ?? "None"])
            return embed
        }

        return undefined
    }
    function getArtPage(char, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setFooter(`Page ${currentPage} / ${maxPages}`)
        if (char.icon)
            embed.setThumbnail(char.icon)

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
    function getCharTalentPage(char, relativePage, currentPage, maxPages, talentMode) {
        const embed = new MessageEmbed()
            .setColor(Colors[char.meta.element] ?? "")
            .setFooter(`page ${currentPage} / ${maxPages}`)

        if (char.icon) embed.setThumbnail(char.icon)

        function isValueTable(talent) {
            return talent.values != undefined
        }

        function showTalent(skill) {
            embed.setTitle(`${char.name}: ${skill.name}`)
                .setDescription(skill.desc)

            if (skill.charges)
                embed.addField("Charges", skill.charges.toString())

            let hasLevels = false
            for (const talent of skill.talentTable ?? []) {
                const { name } = talent

                if (isValueTable(talent)) {
                    const values = talent.values
                    hasLevels = true

                    const talents = skill.video ? [9] : [6, 9, values.length - 1]
                    embed.addField(name, "```\n"+ createTable(
                        undefined,
                        Object.entries(values)
                            .map(([lv, val]) => [+lv + 1, val])
                            .filter(([lv]) => {
                                switch (talentMode) {
                                    case "HIGH":
                                        return lv >= 6
                                    case "LOW":
                                        return lv <= 6
                                    case "LITTLE":
                                    default:
                                        return talents.includes(+lv)
                                }
                            }),
                        [PAD_START, PAD_END]
                    ) + "\n```", true)
                } else
                    embed.addField(name, talent.value, true)
            }
            if (hasLevels && talentMode == "HIGH")
                embed.setFooter(`${embed.footer?.text} - you can use '${prefix}c ${char.name} -low' to display lower levels`)
            else if (hasLevels && talentMode == "LOW")
                embed.setFooter(`${embed.footer?.text} - you can use '${prefix}c ${char.name} -high' to display higher levels`)
            else if (hasLevels && talentMode == "LITTLE")
                embed.setFooter(`${embed.footer?.text} - you can use '${prefix}c ${char.name} -high' (or -low) to display higher (or lower) levels`)
            if (skill.video) {
                embed.setImage(skill.video)
                    .setThumbnail("")
            }
        }

        let page = 0
        for (const skills of char.skills ?? []) {
            embed.setColor(Colors[skills.ult?.type ?? "None"])

            for (const talent of skills.talents ?? []) {
                if (page++ == relativePage) {
                    showTalent(talent)
                    return embed
                }
            }

            if (skills.ult && page++ == relativePage) {
                showTalent(skills.ult)
                return embed
            }

            if (skills.passive && page++ == relativePage) {
                embed.setTitle(`${char.name}: Passives`)
                for (const passive of skills.passive) {
                    if (passive.minAscension) {
                        embed.addField(passive.name, `${passive.desc}
    
*${passive.minAscension > 0 ? `Unlocks at ascension **${passive.minAscension}**` : "Unlocked by **default**"}*`)
                    } else {
                        embed.addField(passive.name, passive.desc)
                    }
                }
                return embed
            }

            if (skills.constellations && page++ == relativePage) {
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

        const pages = [
            {
                bookmarkEmoji: "📝",
                bookmarkName: "General",
                maxPages: 2,
                pages: (rp, cp, mp) => getMainPage(char, rp, cp, mp)
            }
        ]

        if (data.isFullCharacter(char))
            pages.push(
                {
                    bookmarkEmoji: "🚀",
                    bookmarkName: "Stats",
                    maxPages: 1 + char.skills.length,
                    pages: (rp, cp, mp) => getStatsPage(char, rp, cp, mp)
                })

        if (char.skills?.length == 1) {
            const skills = char.skills[0]
            let offset = 0
            if (skills.talents) {
                const off = offset
                const ult = skills.ult ? 1 : 0
                pages.push({
                    bookmarkEmoji: data.emojis[char.weaponType] ?? "⚔️",
                    bookmarkName: "Talents",
                    maxPages: skills.talents.length + ult,
                    pages: (rp, cp, mp) => getCharTalentPage(char, rp + off, cp, mp, talentMode)
                })
                offset += skills.talents.length + ult
            }

            if (skills.talents) {
                const off = offset
                pages.push({
                    bookmarkEmoji: "💤",
                    bookmarkName: "Passives",
                    maxPages: 1,
                    pages: (rp, cp, mp) => getCharTalentPage(char, rp + off, cp, mp, talentMode)
                })
                offset++
            }

            if (skills.constellations) {
                const off = offset
                pages.push({
                    bookmarkEmoji: "🇨",
                    bookmarkName: "Constellations",
                    maxPages: 1,
                    pages: (rp, cp, mp) => getCharTalentPage(char, rp + off, cp, mp, talentMode)
                })
                offset++
            }
        } else {
            let currentPage = 0
            for (const skills of char.skills ?? []) {
                const offset = currentPage

                if (skills.talents) {
                    pages.push({
                        bookmarkEmoji: data.emojis[skills.ult?.type] ?? "❔",
                        bookmarkName: skills.ult?.type ?? "Unknown",
                        maxPages: skills.talents.length + 3,
                        pages: (rp, cp, mp) => getCharTalentPage(char, rp + offset, cp, mp, talentMode)
                    })

                    currentPage += skills.talents.length + 3
                }
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
    longDescription: "displays a Genshin Impact character information. if no name is provided, a list of all characters will be displayed.\nto directly skip to a certain section, you can use \`characters <name> -[info|art|stats|books|skill|passive|const]\` to directly skip to that page!\nfor the Traveler (or any other future character with multiple elements) you can only use \`characters <name> -[info|art|stats|anemo|geo|...]\`",
    usage: ["character \`[name]\`"],
    example: ["character `Ganyu`"],
    description: "displays Genshin Impact characters information"
};

exports.conf = {
    aliases: ['characters'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}