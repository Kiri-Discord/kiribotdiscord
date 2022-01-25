const { Colors, findFuzzyBestCandidates, getLinkToGuide, paginator, sendMessage, simplePaginator } = require('../../features/genshin/utils');
const { MessageEmbed } = require('discord.js');
exports.run = async(client, message, args, prefix) => {
    const data = client.genshinData;
    const sed = client.customEmojis.get("sed");

    const name = args.join(" ")
    if (name.length == 0) {
        const pages = getMaterialsPages();
        if (pages.length == 0) return sendMessage(message, `no material data was loaded! you should join my support server via \`${prefix}invite\` if this problem persist ${sed}`)

        await simplePaginator(message, (relativePage, currentPage, maxPages) => getMaterialsPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }

    const material = data.getMaterialByName(name)
    if (material == undefined)
        return sendMessage(message, `i couldn't find that character, sorry ${sed}`)

    const pages = [{
        bookmarkEmoji: "📝",
        bookmarkName: "General",
        maxPages: 1,
        pages: (rp, cp, mp) => getMainMaterialPage(material, rp, cp, mp)
    }]
    if (material.longDesc)
        pages.push({
            bookmarkEmoji: "-",
            bookmarkName: "Lore",
            maxPages: 1,
            pages: (rp, cp, mp) => getLoreMaterialPage(material, rp, cp, mp),
            invisible: true
        })

    await paginator(message, pages)
    return undefined;

    function getMaterialsPages() {
        const materials = Object.entries(data.materials)
            .map(([name, material]) => `**${material.category}**: ${material.stars?`${material.stars}★ `:""}${data.emoji(name, true)}`)

        const pages = []
        let paging = "", c = 0
        for (const material of materials) {
            if (paging.length + material.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = material
                c = 1
            } else
                paging += "\n" + material
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    }
    function getMaterialsPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Materials")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} / ${maxPages}`)
            .setColor(Colors.GREEN)

        return embed
    }
    function getMainMaterialPage(material, relativePage, currentPage, maxPages) {
        const guides = data.getGuides("material", material.name).map(({ guide, page }) => getLinkToGuide(guide, page)).join("\n")
        const embed = new MessageEmbed()
            .setTitle(`${material.name}'s basic info`)
            .setColor(Colors.AQUA)
            .setFooter(`page ${currentPage} / ${maxPages}`)
            .setDescription(material.desc)

        if (material.category || material.type)
            embed.addField("Category", `**${material.category}**: ${material.type}`, true)

        if (material.stars)
            embed.addField("Rarity", `${material.stars}★`, true)

        if (guides)
            embed.addField("Guides", guides)

        if (material.sources)
            embed.addField("Sources", material.sources.join("\n"))

        if (material.icon)
            embed.setThumbnail(`https://hutaobot.moe/${material.icon}`)

        return embed
    }
    function getLoreMaterialPage(material, relativePage, currentPage, maxPages) {
        const embed = new MessageEmbed()
            .setColor('#d3f3f7')
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setTitle(`${material.name}: Description`)
            .setDescription(material.longDesc ?? "Unavailable")

        if (material.icon)
            embed.setThumbnail(`https://hutaobot.moe/${material.icon}`)

        return embed
    }
}


exports.help = {
    name: "material",
    description: "displays a Genshin Impact material information. if no name is provided, a list of all material will be displayed.",
    usage: ["material `<name>`"],
    example: ["material `this is an example name`"]
};

exports.conf = {
    aliases: ['materials'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}