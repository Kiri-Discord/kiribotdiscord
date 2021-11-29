const { ColorResolvable, Message, MessageActionRow, MessageAttachment, MessageButton, MessageComponentInteraction, MessageEmbed, Snowflake } = require('discord.js')
const client = require('../../main.js');
module.exports = class util {
    static PAD_START = 0;
    static PAD_END = 1;
    static Colors = {
        GREEN: "#00EA69",
        DARK_GREEN: "#2EF41F",
    
        ORANGE: "#F49C1F",
    
        RED: "#F7322E",
        DARK_RED: "#F4231F",
    
        AQUA: "#07EADB",
        PURPLE: "#6B68B1",
    
        "Anemo": "#32D39F",
        "Wind": "#32D39F",
    
        "Cryo": "#79E8EB",
        "Ice": "#79E8EB",
    
        "Electro": "#CA7FFF",
        "Electric": "#CA7FFF",
    
        "Geo": "#FEE263",
        "Rock": "#FEE263",
    
        "Hydro": "#06E5FE",
        "Water": "#06E5FE",
    
        "Pyro": "#FFAA6E",
        "Fire": "#FFAA6E",
    
        "Dendro": "#B2EB28",
        "Grass": "#B2EB28",
    
        "None": "#545353",
    };
    static createTable(names, rows, pads = [util.PAD_END]) {
        const maxColumns = Math.max(...rows.map(row => row.length))
        let title = "", currentInd = 0
    
        for (let i = 0; i < maxColumns; i++) {
            if (names && names[i])
                title = title.padEnd(currentInd) + names[i]
    
            const maxLength = Math.max(...rows.map(row => row.length > i ? (row[i]?.toString() ?? "").length : 0), (names && names[i + 1]) ? (title.length - currentInd) : 0)
            currentInd += 1 + maxLength
    
            rows.forEach(row => {
                if (row.length <= i) return
    
                const padEnd = pads.length > i ? pads[i] : pads[pads.length - 1]
                row[i] = padEnd ? row[i].toString().padEnd(maxLength) : row[i].toString().padStart(maxLength)
            })
        }
    
        const table = rows.map(row => row.join(" ").replace(/\s+$/, ""))
        if (names)
            return [title, ...table].join("\n")
        else
            return table.join("\n")
    };
    static async paginator(source, pageInfo, startPage = 0) {
        const maxPages = pageInfo.reduce((p, c) => p + c.maxPages, 0);
    
        let currentPage = 0
        if (typeof startPage == "string") {
            let newPage = 0
            for (const pi of pageInfo) {
                if (pi.bookmarkName == startPage) {
                    currentPage = newPage
                    break
                }
                newPage += pi.maxPages
            }
        } else {
            currentPage = startPage
        }
    
        const embed = util.getPageEmbed(currentPage, maxPages, pageInfo)
    
        if (!embed) return
    
        const reply = await util.sendMessage(source, embed, util.getButtons(pageInfo, currentPage, maxPages))
        if (!util.isMessage(reply)) {
            return
        }
    
        util.paginatorLoop(util.getUserID(source), reply, pageInfo, currentPage)
    };
    static isMessage(msg) {
        return msg instanceof Message
    };
    static getUserID(source) {
        if (util.isMessage(source))
            return source.author.id
        else
            return source.user.id
    };
    static searchClean(str) {
        return str.toLowerCase().replace(/'/g, "")
    }
    static async sendMessage(source, response, components, ephemeral) {
        let embeds
        let content
    
        if (typeof response == "string")
            content = response
        else
            embeds = [response]
    
        if (!components && !(ephemeral && !(source instanceof Message)) && source.channel?.type != "DM")
            components = [util.getDeleteButton()]
    
        try {
            if (source instanceof Message)
                return await source.channel.send({ content, embeds, components })
            else
                return await source.reply({ content, embeds, components, fetchReply: true, ephemeral })
        } catch (error) {
            logger.error("sendMessage", error)
        }
    };
    static getPageEmbed(newPage, maxPages, pageInfo) {
        let bookmark = pageInfo[0], currentPage = 0;
        for (const bm of pageInfo) {
            bookmark = bm
            if (currentPage + bm.maxPages > newPage) break
            currentPage += bm.maxPages
        }
        return bookmark.pages(newPage - currentPage, newPage + 1, maxPages)
    };
    static getDeleteButton() {
        const row = new MessageActionRow()
    
        row.addComponents(
            new MessageButton()
                .setCustomId("delete")
                .setLabel("Delete")
                .setStyle("DANGER")
                .setEmoji("888056887222882304"),
        )
        return row
    }
    static paginatorLoop(id, reply, pageInfo, currentPage = 0) {
        reply.awaitMessageComponent( {
            filter: (interaction) => (interaction.user.id == id || config.admins.includes(interaction.user.id)),
            time: 60000
        }).then(async (r) => {
            const name = r.customId
    
            if (name == "delete") {
                await reply.delete()
                return
            }
    
            if (name == "prev") {
                currentPage = await util.updatePage(r, reply, currentPage, currentPage - 1, pageInfo)
            } else if (name == "next") {
                currentPage = await util.updatePage(r, reply, currentPage, currentPage + 1, pageInfo)
            } else if (name) {
                let newPage = 0
                for (const pi of pageInfo) {
                    if (pi.bookmarkName == name) {
                        currentPage = await util.updatePage(r, reply, currentPage, newPage, pageInfo)
                        break
                    }
                    newPage += pi.maxPages
                }
            }
    
            util.paginatorLoop(id, reply, pageInfo, currentPage)
        }).catch(async (error) => {
            if (error.name == "Error [INTERACTION_COLLECTOR_ERROR]") {
                const user = client.user;
                if (user == undefined || reply.deleted) return
                await reply.edit({ components: [] })
            } else {
                logger.error("Error during pagination: ", error);
                util.paginatorLoop(id, reply, pageInfo, currentPage);
            }
        }).catch(error => {
            logger.error("Error during pagination error handling: ", error)
        })
    };
    static async updatePage(interaction, reply, oldPage, newPage, pageInfo) {
        const maxPages = pageInfo.reduce((p, c) => p + c.maxPages, 0)
    
        const embed = util.getPageEmbed(newPage, maxPages, pageInfo)
        if (!embed) return oldPage
    
        const content = { embeds: [embed], components: util.getButtons(pageInfo, newPage, maxPages) }
        try {
            await interaction.update(content)
        } catch (error) {
            await reply.edit(content)
        }
        return newPage
    };
    static async simplePaginator(message, pager, maxPages, startPage = 0) {
        return util.paginator(message, [{
            bookmarkEmoji: "⏮️",
            bookmarkName: "Default",
            pages: pager,
            maxPages,
            invisible: true
        }], startPage)
    };
    static fuzzySearchScore(a, b) {
        if (a.length == 0) return 0
        if (b.length == 0) return 0
    
        // swap to save some memory O(min(a,b)) instead of O(a)
        if (a.length > b.length) [a, b] = [b, a]
    
        const row = []
        // init the row
        for (let i = 0; i <= a.length; i++)
            row[i] = i
    
    
        // fill in the rest
        for (let i = 1; i <= b.length; i++) {
            let prev = i
            for (let j = 1; j <= a.length; j++) {
                const val = (b.charAt(i - 1) == a.charAt(j - 1)) ? row[j - 1] : Math.min(row[j - 1] + 1, prev + 1, row[j] + 1)
                row[j - 1] = prev
                prev = val
            }
            row[a.length] = prev
        }
    
        return b.length - row[a.length]
    };
    static caps(str) {
        return str.split("").filter(k => k != k.toLowerCase()).join("")
    }
    static findFuzzy(target, search) {
        const cleaned = util.searchClean(search)
        const found = target.find(t => util.searchClean(t) == search)
        if (found)
            return found
    
        const dists = target.map(e => util.fuzzySearchScore(util.searchClean(e), cleaned) + util.fuzzySearchScore(util.caps(e), util.caps(search)))
        const max = Math.max(...dists)
    
        let candidates = target.filter((_, index) => dists[index] == max)
    
        let filteredCandidates = candidates.filter(t => util.searchClean(t).startsWith(cleaned.substring(0, 3)) || util.searchClean(t).endsWith(cleaned.substring(cleaned.length - 3)))
        if (filteredCandidates.length != 0) candidates = filteredCandidates
    
        filteredCandidates = candidates.filter(t => util.caps(t).includes(search[0].toUpperCase()))
        if (filteredCandidates.length != 0) candidates = filteredCandidates
    
        filteredCandidates = candidates.filter(t => util.caps(t) == util.caps(search))
        if (filteredCandidates.length != 0) candidates = filteredCandidates
    
        const lengths = candidates.map(t => t.length)
        const min = Math.min(...lengths)
        return candidates[lengths.indexOf(min)]
    };

    static getDate(timestamp, timezone = "+08:00") {
        timestamp = timestamp.replace(" ", "T")
        if (!timestamp.includes("T")) timestamp += "T23:59:59"
        return new Date(`${timestamp}${timezone}`)
    }
    
    static getButtons(pageInfo, currentPage, maxPages) {
        let i = 0
        let currentRow = new MessageActionRow()
        const rows = [currentRow]
    
        let newPage = 0
        for (const pi of pageInfo) {
            if (!pi.invisible) {
                if (i++ % 5 == 0 && i !== 1) {
                    currentRow = new MessageActionRow()
                    rows.push(currentRow)
                }
    
                currentRow.addComponents(
                    new MessageButton()
                        .setCustomId(pi.bookmarkName)
                        .setLabel(pi.bookmarkName)
                        .setStyle("SECONDARY")
                        .setDisabled(newPage == currentPage)
                        .setEmoji(pi.bookmarkEmoji),
                )
            }
    
            newPage += pi.maxPages
        }
    
        if (i !== 0 && i % 5 !== 1 && i % 5 !== 2) {
            currentRow = new MessageActionRow()
            rows.push(currentRow)
        }
    
        currentRow.addComponents(
            new MessageButton()
                .setCustomId("prev")
                .setLabel("Previous")
                .setStyle("SECONDARY")
                .setDisabled(currentPage == 0)
                .setEmoji('888053581532520488'),
    
            new MessageButton()
                .setCustomId("next")
                .setLabel("Next")
                .setStyle("SECONDARY")
                .setDisabled(currentPage >= maxPages - 1)
                .setEmoji('888053581758988319'),
    
            new MessageButton()
                .setCustomId("delete")
                .setLabel("Delete")
                .setStyle("DANGER")
                .setEmoji('888056887222882304'),
        )
        return rows
    }
    
}