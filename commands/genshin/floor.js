const {
    sendMessage,
    simplePaginator,
} = require("../../features/genshin/utils");
const { MessageEmbed } = require("discord.js");
const names = {
    "1/1": "Enemies",
    "1/2": "First Half",
    "2/2": "Second Half",
};

exports.run = async (client, message, args, prefix) => {
    let floor = -1;
    let abyssSchedule;

    for (const arg of args) {
        const matchedDate = arg.match(/^(\d\d\d\d)-(\d\d?)-(\d)$/);
        if (arg.match(/^\d+$/)) {
            floor = +arg;
        } else if (matchedDate) {
            abyssSchedule = arg;
        } else return sendMessage(message, `you provided an unknown usage :pensive: showing abyss information can be done using ${prefix}abyss \`[cycle: yyyy-mm-1/yyyy-mm-2] [floor]\`!`)
    };
    const { genshinData } = client;
    const schedule = genshinData.getAbyssSchedules();
    let abyss = schedule[schedule.length - 1];
    if (abyssSchedule) {
        const matchedDate = abyssSchedule.match(/^(\d\d\d\d)-(\d\d?)-(\d)$/)
        if (!matchedDate)
            return sendMessage(message, `you provided an unknown abyss schedule \`${matchedDate}\` :pensive:`)

        const [line, year, month, cycle] = matchedDate
        abyss = schedule.filter(s => s.start.startsWith(`${year}-${month.padStart(2, "0")}-`))?.[+cycle - 1]
        if (!abyss)
            return sendMessage(message, `i couldn't find abyss \`${line}\`. can you recheck?`)
    }
    if (floor > 0 && floor <= abyss.regularFloors.length) {
        return sendMessage(message, getSpiralFloor(abyss.regularFloors[floor - 1], floor))
    };
    const defaultPage = floor > 0 ? floor - abyss.regularFloors.length : 0

    await simplePaginator(message, (relativePage, currentPage, maxPages) => getSpiralAbyss(abyss, relativePage, currentPage, maxPages), 1 + abyss.spiralAbyssFloors.length, defaultPage)
    return undefined;

    function getSpiralAbyss(abyss, relativePage, currentPage, maxPages) {
        const footer = `page ${currentPage} / ${maxPages}`
        const embed = new MessageEmbed()
            .setColor('#4A91E2')
            .setFooter(footer)

        if (relativePage == 0) {
            embed.setTitle(`Spiral Abyss: ${abyss.buff}`)
                .setDescription(abyss.buffDesc)
                .addField("Starts", abyss.start, true)
                .addField("Ends", abyss.end, true)
            return embed
        }

        const floor = abyss.spiralAbyssFloors[relativePage - 1]
        if (floor)
            return getSpiralFloor(floor, abyss.regularFloors.length + relativePage)
                .setFooter(footer)
        return undefined
    };
    function getSpiralFloor(floorId, num) {
        const floor = client.genshinData.abyssFloors[floorId]

        const embed = new MessageEmbed()
            .setColor('#4A91E2')
            .setTitle(`Floor ${num}`)
            .setDescription(floor.leyline)

        const lastChamber = floor.chambers[floor.chambers.length - 1]
        for (const chamber of floor.chambers) {
            embed.addField(`Chamber ${chamber.chamber}: Conditions`, chamber.conds)

            for (const [ind, monsters] of Object.entries(chamber.monsters)) {
                const status = `${+ind+1}/${chamber.monsters.length}`
                embed.addField(`${names[status] ?? status}: (Lv. ${chamber.level})`, `${monsters.join("\n")}${chamber == lastChamber ? "" : "\n\u200B"}`, true)
            }
        };
        return embed
    }
};

exports.help = {
    name: "floor",
    description:
        "show floor (abyss) information. current floors will be listed if no arguments are provided",
    usage: ["floor `[cycle: yyyy-mm-1/yyyy-mm-2] [floor]`"],
    example: ["floor `2020-12-2 1`"],
};

exports.conf = {
    aliases: ["abyss"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
