const { MessageEmbed } = require("discord.js");
const {
    Colors,
    createTable,
    getLinkToGuide,
    PAD_END,
    PAD_START,
    paginator,
    sendMessage,
    simplePaginator,
} = require("../../features/genshin/utils");

exports.run = async (client, message, args, prefix) => {
    const data = client.genshinData;

    const name = args.join(" ");
    const sed = client.customEmojis.get("sed");
    if (name.length == 0) {
        const pages = getEnemiesPages();
        if (pages.length == 0) return sendMessage(message, `no enemy data was loaded. you should join my support server via \`${prefix}invite\` if this problem persist ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getEnemiesPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }

    const enemy = data.getEnemyByName(name)
    if (enemy == undefined)
        return sendMessage(message, `i couldn't find that enemy, sorry ${sed}`)

    const pages = [{
        bookmarkEmoji: "📝",
        bookmarkName: "General",
        maxPages: 1,
        pages: (rp, cp, mp) => getMainEnemyPage(enemy, rp, cp, mp)
    }]
    if (enemy.desc)
        pages.push({
            bookmarkEmoji: "-",
            bookmarkName: "Lore",
            maxPages: 1,
            pages: (rp, cp, mp) => getLoreEnemyPage(enemy, rp, cp, mp),
            invisible: true
        })

    await paginator(message, pages)
    return undefined;

    function getEnemiesPages() {
        const enemies = Object.entries(data.enemies)
            .map(([name, info]) => `${data.emoji(name, true)}${info.placeholder ? " [not yet available]" : ""}`)

        const pages = []
        let paging = "", c = 0
        for (const enemy of enemies) {
            if (paging.length + enemy.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = enemy
                c = 1
            } else
                paging += "\n" + enemy
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    }

    function getEnemiesPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Enemies list")
            .setDescription(pages[relativePage])
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setColor('#4A91E2')

        return embed
    }

    function getMainEnemyPage(enemy, relativePage, currentPage, maxPages) {
        const guides = data.getGuides("enemy", enemy.name).map(({ guide, page }) => getLinkToGuide(guide, page)).join("\n")
        const embed = new MessageEmbed()
            .setTitle(`${enemy.name}'s basic info`)
            .setColor(Colors.AQUA)
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setDescription(`**Type**: ${enemy.type ?? "Unknown"}${enemy.kind ? ` (${enemy.kind})` : ""}${enemy.notes ? `\n\n${enemy.notes}` : ""}`)

        if (guides)
            embed.addField("Guides", guides)

        if (enemy.icon)
            embed.setThumbnail(`https://hutaobot.moe/${enemy.icon}`)

        if (enemy.resistance)
            embed.addField("Resistances", `\`\`\`\n${createTable(["Pyro", "Elec", "Cryo", "Hydro", "Anemo", "Geo", "Phys", "Notes"], enemy.resistance, [PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_END])}\n\`\`\``)

        return embed
    }

    function getLoreEnemyPage(enemy, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setTitle(`${enemy.name}'s description`)
            .setDescription(enemy.desc ?? "Unavailable")

        if (enemy.icon)
            embed.setThumbnail(`https://hutaobot.moe/${enemy.icon}`)

        return embed
    }
};

exports.help = {
    name: "enemy",
    description:
        "displays Genshin Impact enemy information. if no name is provided, a list of all enemy will be displayed.",
    usage: ["enemy `[name]`"],
    example: ["character `Ganyu`"],
};

exports.conf = {
    aliases: ["enemies"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
