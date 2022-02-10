const { ColorResolvable, Message, MessageActionRow, MessageAttachment, MessageButton, MessageComponentInteraction, MessageEmbed, Snowflake } = require('discord.js')
const client = require('../../main.js');
const EventType = {
    Web: "Web",
    InGame: "In-game",
    Maintenance: "Maintenance",
    Stream: "Stream",
    Unlock: "Unlock",
    Banner: "Banner"
}
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
        "Cryo": "#79E8EB",
        "Electro": "#CA7FFF",
        "Geo": "#FEE263",
        "Hydro": "#06E5FE",
        "Pyro": "#FFAA6E",
        "Dendro": "#B2EB28",
        "None": "#545353",
    };
    static getLinkToGuide(guide, page) {
        return `[${page.name}](https://hutaobot.moe/guides/${util.urlify(guide.name, false)}/${util.urlify(page.name, true)})`
    };
    static urlify(input, shouldRemoveBrackets) {
        if (shouldRemoveBrackets)
            input = util.removeBrackets(input)
            return input.toLowerCase().replace(/[():"'-]/g, "").trim().replace(/ +/g, "-")
    }
    static joinMulti(input) {
        if (input.length <= 1) return input[0]
        const last = input[input.length - 1]
        return `${input.slice(0, -1).join(", ")} and ${last}`
    }
    static getLink(url) {
        if (url.match(/^https?:\/\//))
            return url
        return `https://hutaobot.moe/${url}`
    }
    static isServerTimeStart(event) {
        return event.start_server ?? (event.type == EventType.Banner || event.type == EventType.InGame || event.type == EventType.Unlock)
    }
    static getStartTime(event, serverTimezone) {
        return event.start != undefined && util.getDate(event.start, event.timezone ?? (util.isServerTimeStart(event) ? serverTimezone : undefined))
    }
    static isServerTimeEnd(event) {
        return event.end_server ?? (event.type == EventType.Banner || event.type == EventType.InGame || event.type == EventType.Quiz)
    }
    static getEndTime(event, serverTimezone) {
        return event.end != undefined && util.getDate(event.end, event.timezone ?? (util.isServerTimeEnd(event) ? serverTimezone : undefined))
    }
    static startTimes(e) {
        if (!e.start) return ""
        if (!util.isServerTimeStart(e))
            return `Global: ${util.relativeTimestampFromString(e.start, e.timezone)}`
        return util.getServerTimeInfo().map(st => `${st.server}: ${util.relativeTimestampFromString(e.start, `${st.offset.split("").join("0")}:00`)}`).join("\n")
    }
    static endTimes(e) {
        if (!e.end) return ""
        if (!util.isServerTimeEnd(e))
            return util.relativeTimestampFromString(e.end, e.timezone)
        return util.getServerTimeInfo().map(st => `${st.server}: ${util.relativeTimestampFromString(e.end, `${st.offset.split("").join("0")}:00`)}`).join("\n")
    }
    static getServerTimeInfo() {
        const offsets = {
            Asia:    +8,
            Europe:  +1,
            America: -5,
        };
        const servers = Object.keys(offsets);
        return servers.map(server => {
            const now = new Date()
            const offset = offsets[server]
            now.setUTCHours(now.getUTCHours() + offset)
    
            const nextDailyReset = new Date(now.getTime())
            nextDailyReset.setUTCHours(4, 0, 0, 0)
            while (nextDailyReset.getTime() < now.getTime())
                nextDailyReset.setUTCDate(nextDailyReset.getUTCDate() + 1)
    
            const nextWeeklyReset = new Date(nextDailyReset.getTime())
            while (nextWeeklyReset.getDay() !== 1)
                nextWeeklyReset.setUTCDate(nextWeeklyReset.getUTCDate() + 1)
    
            return {
                server,
                offset: offset < 0 ? offset.toString() : `+${offset}`,
                time: now,
                nextDailyReset,
                nextWeeklyReset
            }
        })
    };
    static removeBrackets(input) {
        return input.replace(/\(.*\)/g, "").replace(/ +:/, ":")
    }
    
    static findFuzzyBestCandidates(target, search, amount) {
        const cleaned = util.searchClean(search)
        const found = target.find(t => util.searchClean(t) == search)
        if (found)
            return [found]
    
        const dists = target.map(e => util.fuzzySearchScore(util.searchClean(e), cleaned) + util.fuzzySearchScore(caps(e), util.caps(search)) - e.length / 100 + 1)
        const max = Math.max(...dists)
    
        return target
            .map((t, i) => {
                return {
                    t,
                    d: dists[i]
                }
            })
            .sort((a, b) => b.d - a.d)
            .filter((e, i) => i < amount && e.d > max * 0.65)
            .map(({ t, d }) => {
                if (util.searchClean(t).startsWith(cleaned.substring(0, 3)) || util.searchClean(t).endsWith(cleaned.substring(cleaned.length - 3)))
                    d += 1
                if (caps(t).includes(search[0]?.toUpperCase()))
                    d += 1.5
                if (caps(t) == caps(search))
                    d += 0.5
    
                return { t, d }
            })
            .sort((a, b) => b.d - a.d)
            .map(e => e.t)
    }
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
        return util.getUser(source).id;
    };
    static getUser(source) {
        if (util.isMessage(source))
            return source.author
        else
            return source.user
    };
    static getCategory(source) {
        if (!source.inGuild()) return null
        const channel = source.channel
        if (!channel) return null
        if (channel.isThread()) {
            const parent = channel.parent
            if (parent)
                return parent.parent
            return null
        }
        return channel.parent
    }
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
            filter: (interaction) => (interaction.user.id == id),
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
                if (user == undefined || !reply.editable) return
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
    };
    static relativeTimestampFromString(timestamp, timezone = "+08:00") {
        return util.displayTimestamp(util.getDate(timestamp, timezone), "R")
    };
    static displayTimestamp(time, display = "R") {
        return `<t:${Math.floor(time.getTime() / 1000)}:${display}>`
    }
    static getEventEmbed(event) {
        const embed = new MessageEmbed()
    
        embed.setTitle(event.name)
        if (event.img) embed.setImage(event.img)
        if (event.link) embed.setURL(event.link)
        embed.addField(event.type == EventType.Unlock ? "Unlock Time" : "Start Time", event.start ? `${event.prediction ? "(prediction) " : ""}${event.start}${event.timezone?` (GMT${event.timezone})`:""}\n${util.startTimes(event)}` : "Unknown", true)
        if (event.end) embed.addField("End Time", `${event.end}${event.timezone?` (GMT${event.timezone})`:""}\n${util.endTimes(event)}`, true)
        embed.addField(event.type == 'Unlock' ? "Unlock Time" : "Start Time", event.start ? `${event.prediction ? "(prediction) " : ""}${event.start}${event.timezone?` (GMT${event.timezone})`:""}\n${util.relativeTimestampFromString(event.start, event.timezone)}` : "Unknown", true)
        if (event.end) embed.addField("End Time", `${event.end}${event.timezone?` (GMT${event.timezone})`:""}\n${util.relativeTimestampFromString(event.end, event.timezone)}`, true)
        if (event.type && event.type !== 'Unlock') embed.addField("Type", event.type, true)
    
        return embed
    }
    static parseNewsContent(content, maxLength = 1000) {
        const target = []
        let currentLine = ""
    
        const matches = content.match(/<(p|div|h\d).*?>(.*?)<\/(p|div|h\d)>/g)
        if (!matches) return target
    
        for (const paragraph of matches) {
            let middle = paragraph.match(/<(p|div|h\d).*?>(.*?)<\/(p|div|h\d)>/)?.[2]
            if (!middle) continue
            middle = middle
                .replace(/<\/?br.*?>/g, "\n")
                .replace(/&gt;/g, ">")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
                .replace(/<\/?span.*?>/g, "")
                .replace(/<\/?strong.*?>/g, "**")
                // .replace(/<\/?b.*?>/g, "**")
                // .replace(/<\/?i.*?>/g, "*")
                // .replace(/<\/?em.*?>/g, "*")
                .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, (_, link, title) => `[${title}](${link})`)
                .replace(/<iframe.*?src="(.*?)".*?><\/iframe>/g, (_, link) => `[Link](${link})`)
    
            const imgFinder = middle.match(/<img.*?src="(.*?)".*?>/)
    
            if (imgFinder && currentLine.trim().length > 0) {
                target.push({ text: util.clean(currentLine) })
                currentLine = ""
            } else if (currentLine.length >= maxLength) {
                let splitted = [];
                ({ splitted, currentLine } = util.split(splitted, currentLine, /\n\s*\n/g))
    
                if (splitted.length > 0)
                    target.push({ text: util.clean(splitted.join("\n\n")) })
                else {
                    ({ splitted, currentLine } = util.split(splitted, currentLine, "\n"))
    
                    if (splitted.length > 0)
                        target.push({ text: util.clean(splitted.join("\n")) })
                }
            }
    
            if (imgFinder) {
                target.push({ img: imgFinder[1] })
            } else {
                currentLine += middle
            }
            currentLine += "\n"
        }
    
        if (currentLine.trim().length > 0)
            target.push({ text: util.clean(currentLine) })
    
        return target
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
    };
    static split(splitted, currentLine, toSplit) {
        splitted = currentLine.split(toSplit)
        currentLine = splitted.pop() ?? ""
    
        while (currentLine.trim().length == 0 || splitted.join("\n\n").length >= 1000)
            currentLine = (splitted.pop() ?? "") + currentLine
    
        return { splitted, currentLine }
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
