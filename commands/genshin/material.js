const { Colors, findFuzzyBestCandidates, getLinkToGuide, paginator, joinMulti, sendMessage, simplePaginator, urlify } = require('../../features/genshin/utils');
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
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setColor(Colors.GREEN)

        return embed
    }
    function getMainMaterialPage(material, relativePage, currentPage, maxPages) {
        const guides = data.getGuides("material", material.name).map(({ guide, page }) => getLinkToGuide(guide, page)).join("\n")
        const embed = new MessageEmbed()
            .setTitle(`${material.name}'s basic info`)
            .setColor(Colors.AQUA)
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setDescription(material.desc)

        if (material.category || material.type)
            embed.addField("Category", `**${material.category}**: ${material.type}`, true)

        if (material.stars)
            embed.addField("Rarity", `${material.stars}★`, true)

        if (guides)
            embed.addField("Guides", guides)

        if (material.sources)
            embed.addField("Sources", material.sources.join("\n"))

        if (material.specialty)
            embed.addField("Food specialty", `Can be obtained by using [**${data.emoji(material.specialty.char, true)}**](https://hutaobot.moe/characters/${urlify(material.specialty.char, false)}) while making [**${material.specialty.recipe}**](https://hutaobot.moe/materials/${urlify(material.specialty.recipe, false)})`)
        const otherMaterial = Object.values(data.materials).filter(x => x.specialty && x.specialty.recipe == material.name)
        if (otherMaterial.length > 0)
            embed.addField("Specialty", otherMaterial.map(x => `[**${x.name}**](https://hutaobot.moe/materials/${urlify(x.name, false)}) be obtained by using [**${data.emoji(x.specialty?.char, true)}**](https://hutaobot.moe/characters/${urlify(x.specialty?.char ?? "", false)})`).join("\n"))
        const recipe = material.recipe ?? (material.specialty ? data.materials[material.specialty.recipe]?.recipe : undefined)

        if (recipe)
            embed.addField("Recipe", data.getItemCosts(recipe))
        const effect = material.effect
        if (effect && typeof effect == "string")
            embed.addField("Effect", effect)
        else if (effect && typeof effect == "object") {
            const effects = [
                ...Object.entries(effect),
                ...otherMaterial.filter(x => x.effect && typeof x.effect == "string").map(x => [`[${x.name}](https://hutaobot.moe/materials/${urlify(x.name, false)})`, x.effect])
            ]
            embed.addField("Effects", effects.map(([name, e]) => `**${name}**\n- ${e}`).join("\n"))
        }
        const charAscension = []
        const charTalents = []

        for (const c of data.getCharacters()) {
            if (c.ascensionCosts && data.isInCosts(c.ascensionCosts, material.name))
                charAscension.push(c)

            if (c.skills) {
                const talents = c.skills.flatMap(s => [...(s.talents ?? []), s.ult])

                if (talents.some(x => x?.costs && data.isInCosts(x.costs, material.name)))
                    charTalents.push(c)
            }
        }
        const weaponAscension = []
        for (const w of Object.values(data.weapons)) {
            if (w.ascensionCosts && data.isInCosts(w.ascensionCosts, material.name))
                weaponAscension.push(w)
        }

        const usedByDesc = []

        const overlap = charTalents.filter(x => charAscension.some(y => x.name == y.name))
        const uniqueTalents = charTalents.filter(x => !charAscension.some(y => x.name == y.name))
        const uniqueAscension = charAscension.filter(x => !charTalents.some(y => x.name == y.name))

        if (overlap.length > 0)
            usedByDesc.push(`Used by ${joinMulti(overlap.map(x => data.emoji(x.name)).filter((v, i, a) => a.indexOf(v) == i))} character talents and ascensions.`)

        if (uniqueTalents.length > 0)
            usedByDesc.push(`Used by ${joinMulti(uniqueTalents.map(x => data.emoji(x.name)))} character talents.`)

        if (uniqueAscension.length > 0)
            usedByDesc.push(`Used by ${joinMulti(uniqueAscension.map(x => data.emoji(x.name)))} character ascensions.`)

        const sortedWeapon = weaponAscension
            .sort((a, b) => (a.stars && b.stars && b.stars - a.stars) || (a.weaponType && b.weaponType && a.weaponType.localeCompare(b.weaponType)) || a.name.localeCompare(b.name))
        if (sortedWeapon.length > 0 && sortedWeapon.length < 7)
            usedByDesc.push(`Used by ${joinMulti(sortedWeapon.map(x => data.emoji(x.name)))} weapon ascensions.`)
        else if (sortedWeapon.length > 0 && sortedWeapon.filter(x => x.stars >= 4).length < 7)
            usedByDesc.push(`Used by ${joinMulti([...sortedWeapon.filter(x => x.stars >= 4).map(x => data.emoji(x.name)), "more low star"])} weapon ascensions.`)
        else if (sortedWeapon.length > 0)
            usedByDesc.push(`Used by ${joinMulti([...sortedWeapon.slice(0, 7).map(x => data.emoji(x.name)), "more"])} weapon ascensions.`)


        if (usedByDesc.length > 0)
            embed.addField("Used by", usedByDesc.join("\n"))

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
    aliases: ['materials', "mat", "recipe"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}