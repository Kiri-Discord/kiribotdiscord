const {
    Colors,
    findFuzzy,
    sendMessage,
    simplePaginator,
} = require("../../features/genshin/utils");

const { MessageEmbed } = require("discord.js")

exports.run = async (client, message, args, prefix) => {
    const targetNames = [...client.genshinData.guides.map(g => g.name), ...client.genshinData.guides.flatMap(g => g.pages.map(p => p.name))].filter((v, i, arr) => arr.indexOf(v) == i)
    if (args.length == 0) return runList(message);

    return runSearch(message, args.join(" "));


    async function runSearch(source, query) {
        const { guides } = client.genshinData;

        const result = findFuzzy(targetNames, query)
        const guide = guides.find(g => g.name == result) ?? guides.find(g => g.pages.some(p => p.name == result))

        if (!guide) {
            const sed = client.customEmojis.get("sed");
            return sendMessage(source, `i was unable to find a guide with that query ${sed} can you try again?`);
        };

        const startPage = guide.name == result ? 0 : guide.pages.findIndex(p => p.name == result)

        await simplePaginator(source, (relativePage, currentPage, maxPages) => getGuidePage(guide, relativePage, currentPage, maxPages), guide.pages.length, startPage)
        return undefined
    };
    async function runList(source) {
        const pages = getGuides()

        if (pages.length == 0) {
            const sed = client.customEmojis.get("sed");
            return sendMessage(source, `no guides was loaded ${sed} if this problem persists please visit my support server at ${prefix}support!`);
        }

        await simplePaginator(source, (relativePage, currentPage, maxPages) => getGuidesPage(pages, relativePage, currentPage, maxPages), pages.length)
        return undefined
    }
    function getGuides() {
        const guides = client.genshinData.guides
            .map((guide) => `**${guide.name}**:
${guide.pages.map(p => `- ${p.name}`).join("\n")}`)

        const pages = []
        let paging = "", c = 0
        for (const guide of guides) {
            if (paging.length + guide.length > 1800 || c > 15) {
                pages.push(paging.trim())
                paging = guide
                c = paging.split("\n").length
            } else {
                paging += "\n" + guide
                c += paging.split("\n").length
            }
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    }
    function getGuidesPage(pages, relativePage, currentPage, maxPages) {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Avaliable guides")
            .setDescription(pages[relativePage])
            .setFooter(`page ${currentPage} / ${maxPages} - you can use '${prefix}guide <name>' to view a guide!`)
            .setColor(Colors.GREEN)

        return embed
    }
    function getGuidePage(guide, relativePage, currentPage, maxPages) {
        if (relativePage >= guide.pages.length)
            return undefined
    
        const data = client.genshinData
        const page = guide.pages[relativePage]
    
        const embed = new MessageEmbed()
            .setTitle(page.name)
            .setColor('#4A91E2')
    
        if (maxPages > 1)
            embed.setFooter(`page ${currentPage} / ${maxPages} - ${guide.name}`)
        else if (guide.name !== page.name)
            embed.setFooter(guide.name)
    
        if (page.desc)
            embed.setDescription(page.desc.replace(/\${(.*?)}/g, (_, name) => data.emoji(name)))
    
        if (page.img)
            embed.setImage(page.img)
    
        if (page.url)
            embed.setURL(page.url)
    
        return embed
    }
    
};

exports.help = {
    name: "guide",
    description: "display a Genshin Impact guide. work in progress!",
    usage: ["guide `[name]`"],
    example: ["guide `[name]`"],
};

exports.conf = {
    aliases: ["guides"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
