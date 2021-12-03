const {
    Colors,
    createTable,
    PAD_START,
    paginator,
    sendMessage,
    simplePaginator,
} = require("../../features/genshin/utils");
const { addArg } = require("../../util/util");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args, prefix) => {
    const { genshinData } = client;
    const weaponTypes = Object.values(genshinData.weapons)
        .map((c) => c.weaponType)
        .filter((v, i, arr) => arr.indexOf(v) == i)
        .sort();

    const possibleStars = Object.values(genshinData.weapons)
        .map((c) => c.stars)
        .filter((v, i, arr) => arr.indexOf(v) == i)
        .sort((a, b) => a - b);
    const weaponFilter = []
    for (const weaponType of weaponTypes)
        addArg(message.flags, [`-${weaponType}`, `-${weaponType}s`], () => weaponFilter.push(weaponType))

    const starFilter = []
    for (const star of possibleStars)
        addArg(message.flags, [`${star}`, `${star}*`], () => starFilter.push(star));
    let defaultPage = 0
    addArg(message.flags, ["basic", "-b"], () => defaultPage = "General")
    addArg(message.flags, ["stats", "ascension", "a", "s", "stat", "asc", "ascend"], () => defaultPage = "Stats")
    addArg(message.flags, ["refinements", "r", "refine"], () => defaultPage = "Refinements")
    addArg(message.flags, ["lore", "l"], () => defaultPage = "Lore")
    addArg(message.flags, ["base", "art"], () => defaultPage = "Art")
    addArg(message.flags, ["2nd", "2"], () => defaultPage = "Art 2")
    const name = args.join(" ");
    const sed = client.customEmojis.get("sed");
    
    if (name.length == 0) {
        const pages = getWeaponsPages(weaponFilter, starFilter);
        if (pages.length == 0) return sendMessage(message, `no weapon data was loaded! you should join my support server via \`${prefix}invite\` ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getWeaponsPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    };
    const weapon = genshinData.getWeaponByName(name)
    if (weapon == undefined) return sendMessage(message, `i couldn't find that weapon, sorry ${sed}`);
    const hasRefinements = weapon.refinement.length > 0 && weapon.refinement[0].length > 0

    const pages = [{
        bookmarkEmoji: "📝",
        bookmarkName: "General",
        maxPages: 1,
        pages: (rp, cp, mp) => getMainWeaponPage(weapon, rp, cp, mp)
    }, {
        bookmarkEmoji: "-",
        bookmarkName: "Stats",
        maxPages: 1,
        pages: (rp, cp, mp) => getStatsWeaponPage(weapon, rp, cp, mp),
        invisible: true
    }]
    if (hasRefinements)
        pages.push({
            bookmarkEmoji: "🇷",
            bookmarkName: "Refinements",
            maxPages: 1,
            pages: (rp, cp, mp) => getRefinementWeaponPage(weapon, rp, cp, mp)
        })
    pages.push({
        bookmarkEmoji: "-",
        bookmarkName: "Lore",
        maxPages: 1,
        pages: (rp, cp, mp) => getLoreWeaponPage(weapon, rp, cp, mp),
        invisible: true
    }, {
        bookmarkEmoji: "🎨",
        bookmarkName: "Art",
        maxPages: 1,
        pages: (rp, cp, mp) => getArtWeaponPage(weapon, rp, cp, mp)
    }, {
        bookmarkEmoji: "-",
        bookmarkName: "Art 2",
        maxPages: 1,
        pages: (rp, cp, mp) => getSecondArtWeaponPage(weapon, rp, cp, mp),
        invisible: true
    })

    await paginator(message, pages, defaultPage)
    return undefined

    function getWeaponsPages(weaponFilter, starFilter) {
        const weapons = Object.entries(genshinData.weapons)
            .filter(([_, info]) => weaponFilter.length == 0 || weaponFilter.includes(info.weaponType))
            .filter(([_, info]) => starFilter.length == 0 || starFilter.includes(info.stars))
            .sort(([an, a],  [bn, b]) => b.stars - a.stars || a.weaponType.localeCompare(b.weaponType) || an.localeCompare(bn))
            .map(([name, info]) => `${info.stars}★ ${genshinData.emoji(info.weaponType, true)}: **${name}**`)

        const pages = []
        let paging = "", c = 0
        for (const weapon of weapons) {
            if (paging.length + weapon.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = weapon
                c = 1
            } else
                paging += "\n" + weapon
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    }
    function getWeaponsPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Weapons")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} / ${maxPages} - you can use '${prefix}weapon <name>' to get info about a weapon!`)
            .setColor(Colors.GREEN)

        return embed
    }
    function getMainWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const hasRefinements = weapon.refinement.length > 0 && weapon.refinement[0].length > 0
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)

        const maxAscension = weapon.ascensions[weapon.ascensions.length - 1]
        embed.setTitle(`${weapon.name}: Basic info`)
            .setDescription(weapon.desc)
            .addField("Basics", `${weapon.stars} :star: ${genshinData.emoji(weapon.weaponType)}`)
            .addField("Base stats", `${
                Object.entries(genshinData.getWeaponStatsAt(weapon, 1, 0))
                    .map(([name, value]) => `**${name}**: ${genshinData.stat(name, value)}`)
                    .join("\n")
            }`, true)
            .addField(`Lv. ${maxAscension.maxLevel} A${maxAscension.level} stats`, `${
                Object.entries(genshinData.getWeaponStatsAt(weapon, maxAscension.maxLevel, maxAscension.level))
                    .map(([name, value]) => `**${name}**: ${genshinData.stat(name, value)}`)
                    .join("\n")
            }`, true)

        if (hasRefinements)
            embed.addField(`${weapon.refinement[0][0].name} (at R1)`, weapon.refinement[0][0].desc)
        embed.addField("Upgrade material", `Ascensions: ${weapon.ascensions[2]?.cost.items.map(i => genshinData.emoji(i.name)).join("")}`)
        return embed
    }
    function getStatsWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)

        const columns = []
        const rows = []

        const addRow = (char, level, ascension) => {
            const stats = genshinData.getWeaponStatsAt(char, level, ascension)
            for (const key of Object.keys(stats))
                if (!columns.includes(key))
                    columns.push(key)

            rows.push([level.toString(), ascension.toString(), ...columns.map(c => genshinData.stat(c, stats[c]))])
        }

        let previousMax = 1
        for (const asc of weapon.ascensions) {
            addRow(weapon, previousMax, asc.level)
            previousMax = asc.maxLevel
            addRow(weapon, previousMax, asc.level)

            if (asc.cost.mora || asc.cost.items.length > 0)
                embed.addField(`Ascension ${asc.level} costs`, genshinData.getCosts(asc.cost), true)
        }

        embed.setTitle(`${weapon.name}: Ascensions + stats`)
            .setDescription("Weapon stats:\n```\n" + createTable(
                ["Lvl", "Asc", ...columns.map(c => genshinData.statName(c))],
                rows,
                [PAD_START]
            ) + "\n```")
            .setFooter(`${embed.footer?.text} - you can use '${prefix}weaponstats ${weapon.name} [level] [A<ascension>]' for more info about a specific level!`)
        return embed
    };
    function getRefinementWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)

        embed.setTitle(`${weapon.name}: Refinements`)
        for (const ref of weapon.refinement)
            for (const [refinement, info] of Object.entries(ref))
                embed.addField(`${info.name} ${+refinement+1}`, info.desc)

        return embed
    }

    function getLoreWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)
            .setTitle(`${weapon.name}: Lore`)
            .setDescription(weapon.lore)
        return embed
    }

    function getArtWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)
            .setTitle(`${weapon.name}: Base`)
            .setDescription(`[Image URL](${weapon.icon})`)
            .setImage(weapon.icon)
        embed.thumbnail = null
        return embed
    }

    function getSecondArtWeaponPage(weapon, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setThumbnail(weapon.icon)
            .setFooter(`page ${currentPage} / ${maxPages}`)
            .setTitle(`${weapon.name}: 2nd Ascension`)
            .setDescription(`[Image URL](${weapon.awakenIcon})`)
            .setImage(weapon.awakenIcon)
        embed.thumbnail = null
        return embed
    }

};

exports.help = {
    name: "weapon",
    longDescription:
        "displays a Genshin Impact weapon information. if no name is provided, a list of all weapons will be displayed.\nto directly skip to a certain section, you can use `weapon <name> -[basic|stats|refinements|lore|base|2nd]` to directly skip to that page!",
    usage: ["weapon"],
    example: ["weapon"],
    description: "displays a Genshin Impact weapon information.",
};

exports.conf = {
    aliases: ["weapons"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
