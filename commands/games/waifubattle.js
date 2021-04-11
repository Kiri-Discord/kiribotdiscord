const commandAdventure = require("./waifu/adventure")
const commandBuy = require("./waifu/buy")
const commandCreate = require("./waifu/create")
const commandEquip = require("./waifu/equip")
const commandFight = require("./waifu/fight")
const commandHelp = require("./waifu/help")
const commandIsekai = require("./waifu/isekai")
const commandSell = require("./waifu/sell")
const commandStorage = require("./waifu/storage")
const commandStore = require("./waifu/store")
const commandTimer = require("./waifu/timer")
const commandTrain = require("./waifu/train")
const commandWaifu = require("./waifu/waifu");
const commandAvatar = require("./waifu/pfp")
const { User } = require("../../model/user");
const { MessageCollector } = require('discord.js');

exports.help = {
	name: "waifubattle",
	description: "embark on an new adventures with your waifu: kill titans, slay demons and many other adventures! train your waifu, obtain money, and buy items from the store.",
	usage: "waifubattle `help`",
	example: "waifubattle `help`"
};
  
exports.conf = {
	aliases: ["wb"],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};


exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    const prefix = setting.prefix;
    const query = message.content.split(" ");
    if (!query[1]) return message.channel.send(
        "that's not a valid command, use `" +
            `${prefix}` +
            "wb help` to see all waifu battle command :)"
    )
    const command = query[1].toLowerCase();
    const author = message.author;
    let waifuname;
    const user = {
        discordId: author.id,
        username: author.username,
        discriminator: author.discriminator,
        at: author.toString(),
        trainCooldown: new Date(),
        fightCooldown: new Date(),
        adventureCooldown: new Date(),
        isekaiCooldown: new Date(),
        waifu: undefined,
        combatsWon: 0,
    }

    let response = undefined

    switch (command) {
        case "create":
            const discordId = user.discordId;
            const userExist = await User.findOneAndUpdate({ discordId }, { username: user.username, discriminator: user.discriminator })
            if (userExist) {
                return message.channel.send(`${user.at}, you already have a waifu!`)
            } else {
                await message.inlineReply('name your waifu :D you have 15 second...');
                const collector = new MessageCollector(message.channel, msg => {
                    if (!msg.author.bot && msg.author == message.author) return true;
                }, { time: 15000 });
                collector.on('collect', msg => {
                    waifuname = msg.content.trim();
                    collector.stop();
                });
                collector.on('end', async () => {
                    if (waifuname) {
                        const responseCreate = await commandCreate(user, waifuname, prefix)
                        message.channel.send(responseCreate.query)
                    }
                    else {
                        message.channel.send(`${user.at}, you didn't say anything :(`)
                    }
                });
            }
            break

        case "waifu":
            const responseWaifu = await commandWaifu(user, query, prefix, client)
            message.channel.send(responseWaifu.query)
            break

        case "train":
            const responseTrain = await commandTrain(user, prefix)
            message.channel.send(responseTrain.query)
            break

        case "fight":
            const responseFight = await commandFight(user, query, prefix, message)
            message.channel.send(responseFight.query)
            break

        case "isekai":
            const responseIsekai = await commandIsekai(user, prefix)
            message.channel.send(responseIsekai.query)
            break

        case "adventure":
            const responseAdventure = await commandAdventure(user, prefix)
            message.channel.send(responseAdventure.query)
            break

        case "store":
            const responseStore = await commandStore(user, prefix, client, message)
            message.channel.send(responseStore.query)
            break

        case "storage":
            const responseStorage = await commandStorage(user, prefix, message)
            message.channel.send(responseStorage.query)
            break

        case "buy":
            const responseBuy = await commandBuy(user, query, prefix)
            message.channel.send(responseBuy.query)
            break

        case "pfp":
            const responseAvatar = await commandAvatar(user, query, prefix)
            message.channel.send(responseAvatar.query)
            break
    
        case "timer":
            const responseTimer = await commandTimer(user, prefix)
            message.channel.send(responseTimer.query)
            break

        case "equip":
            const responseEquip = await commandEquip(user, query, prefix, message)
            message.channel.send(responseEquip.query)
            break

        case "sell":
            const responseSell = await commandSell(user, query, prefix, message)
            message.channel.send(responseSell.query)
            break

        case "help":
            response = await commandHelp(client, prefix, message)
            message.channel.send(response)
            break

        default:
            message.channel.send(
                "that's not a valid command, use `" +
                    `${prefix}` +
                    "wb help` to see all waifu battle command :)"
            )
            break
    }
    
}
