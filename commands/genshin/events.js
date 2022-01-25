const {
    Colors,
    getDate,
    getEndTime, 
    getEventEmbed, 
    getStartTime, 
    paginator,
} = require("../../features/genshin/utils");
const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {
    const now = Date.now();
    const { events } = client.genshinData;

    const startTimezone = "+08:00"
    const endTimezone = "-05:00"

    const ongoing = events
    .filter(e => {
        const start = getStartTime(e, startTimezone)
        const end = getEndTime(e, endTimezone)

        return start && start.getTime() <= now &&
  (
      (end && end.getTime() >= now) ||
    (!end && e.reminder == "daily")
  )
    }).sort((a, b) => {
        const endA = getEndTime(a, endTimezone)
        const endB = getEndTime(b, endTimezone)

        if (!endA) return 1
        if (!endB) return -1

        return endA.getTime() - endB.getTime()
    })
    const upcoming = events
    .filter(e => {
        const start = getStartTime(e, startTimezone)
        return start == false || start.getTime() > now
    })
    .sort((a, b) => {
        const startA = getStartTime(a, startTimezone)
        const startB = getStartTime(b, startTimezone)
        if (!startA) return 1
        if (!startB) return -1
        return startA.getTime() - startB.getTime()
    })
    const summaryPages = getSummaryPages(ongoing, upcoming);
    const pages = [
        {
            bookmarkEmoji: "",
            bookmarkName: "Ongoing",
            invisible: true,
            maxPages: ongoing.length,
            pages: (rp, cp, mp) => getOngoingEvent(ongoing, rp, cp, mp),
        },
        {
            bookmarkEmoji: "",
            bookmarkName: "Summary",
            invisible: true,
            maxPages: summaryPages.length,
            pages: (rp, cp, mp) => getSummary(summaryPages, rp, cp, mp),
        },
        {
            bookmarkEmoji: "",
            bookmarkName: "Upcoming",
            invisible: true,
            maxPages: upcoming.length,
            pages: (rp, cp, mp) => getUpcomingEvent(upcoming, rp, cp, mp),
        },
    ];

    await paginator(message, pages, "Summary");
    return undefined;
    function getOngoingEvent(ongoing, relativePage, currentPage, maxPages) {
        const event = ongoing[ongoing.length - relativePage - 1];
        if (event == undefined) return undefined;

        const embed = getEventEmbed(event)
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setColor("#7DBBEB");

        if (event.end) embed.setTimestamp(getDate(event.end, event.timezone));

        return embed;
    }
    function getUpcomingEvent(upcoming, relativePage, currentPage, maxPages) {
        const event = upcoming[relativePage];
        if (event == undefined) return undefined;

        const embed = getEventEmbed(event)
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setColor("#F4231F");

        if (event.start)
            embed.setTimestamp(getDate(event.start, event.timezone));

        return embed;
    }
    function getSummary(pages, relativePage, currentPage, maxPages) {
        return pages[relativePage]
            .setTitle("Events")
            .setFooter({text: `page ${currentPage} / ${maxPages}`})
            .setColor("#7DBBEB")
            .setThumbnail('https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Icon_Events.png');
    }
    function getSummaryPages(ongoing, upcoming) {
        const pages = [];
        const curr = ongoing.map(
            (e) =>
                `${
                    e.end
                        ? `Ending on **${e.end}**${
                              e.timezone ? ` (GMT${e.timezone})` : ""
                          }`
                        : "Ongoing"
                }: ${e.link ? `[${e.name}](${e.link}) ` : e.name}`
        );
        const next = upcoming.map(
            (e) =>
                `${e.type == "Unlock" ? "Unlocks at" : "Starting on"} ${
                    e.prediction ? "__(prediction)__ " : ""
                }${e.start ? e.start : "????"}${
                    e.timezone ? ` (GMT${e.timezone})` : ""
                }: **${e.link ? `[${e.name}](${e.link})` : e.name}**`
        );

        let currentEmbed = new MessageEmbed(),
            currLine = "",
            nextLine = "";
        while (curr.length > 0) {
            const newCurr = curr.shift();
            if (newCurr == undefined) break;
            if (currLine.length + newCurr.length > 950 && currLine.length > 0) {
                currentEmbed.addField(
                    "Current events",
                    currLine + "***See next page for more***"
                );
                pages.push(currentEmbed);
                currentEmbed = new MessageEmbed();
                currLine = "";
            }
            currLine += newCurr + "\n";
        }
        if (currLine.length > 0)
            currentEmbed.addField("Current events", currLine.trim());
        if (ongoing.length == 0)
            currentEmbed.addField("Current events", "None");

        while (next.length > 0) {
            const newNext = next.shift();
            if (newNext == undefined) break;
            if (nextLine.length + newNext.length > 950 && nextLine.length > 0) {
                currentEmbed.addField(
                    "Upcoming Events",
                    nextLine + "***See next page for more***"
                );
                pages.push(currentEmbed);
                currentEmbed = new MessageEmbed();
                nextLine = "";
            }
            nextLine += newNext + "\n";
        }
        if (nextLine.length > 0) {
            currentEmbed.addField("Upcoming events", nextLine.trim());
            pages.push(currentEmbed);
        }
        if (upcoming.length == 0) {
            currentEmbed.addField("Upcoming events", "None");
            pages.push(currentEmbed);
        }

        return pages;
    }
};

exports.help = {
    name: "events",
    description: "list upcoming and ongoing events in Genshin Impact",
    usage: ["events"],
    example: ["events"],
};

exports.conf = {
    aliases: ["event"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
