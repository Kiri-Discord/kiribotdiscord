const { Client, Collection, MessageEmbed } = require("discord.js");
const { embedURL } = require('../util/util');
const PokemonStore = require('../features/pokemon/pokemonstore');
const VerifyTimer = require('../features/redis/verify');
const ownGiveaway = require('../features/giveaway');

module.exports = class kiri extends Client {
        constructor(options) {
            super(options);
            this.nodes = require('../lavalinkNodes.json');
            this.vote = require('../model/vote');
            this.isPlaying = new Collection();
            // this.confession = require('../model/confession');
            this.dcTimeout = new Map();
            this.globalStorage = require('../model/global');
            this.gameStorage = require('../model/game');
            this.giveaways = null;
            this.slashHelps = new Collection();
            this.queue = new Map();
            this.dbembeds = require('../model/embeds');
            this.commands = new Collection();
            this.slash = new Collection();
            this.cooldowns = require('../model/cooldown');
            this.inventory = require('../model/inventory');
            this.garden = require('../model/garden');
            this.helps = new Collection();
            this.customEmojis = new Collection();
            this.allNameCmds = [];
            this.allSlashCmds = [];
            this.guildsStorage = new Collection();
            this.aliases = new Collection();
            this.config = require('../config.json');
            this.recent = new Set();
            this.money = require('../model/currency');
            this.love = require('../model/love');
            this.dbguilds = require('../model/guild');
            this.leveling = require("../util/LevelingUtil.js");
            this.dbleveling = require("../model/leveling");
            this.dbverify = require("../model/verify");
            this.games = new Collection();
            this.pokemon = new PokemonStore();
            this.verifytimers = new VerifyTimer(this);
        };

        initGiveaway() {
                const tada = this.customEmojis.get('giveaway');
                this.giveaways = new ownGiveaway(this, {
                            hasGuildMembersIntent: true,
                            endedGiveawaysLifetime: 1209600000,
                            default: {
                                botsCanWin: false,
                                embedColor: '#bee7f7',
                                embedColorEnd: '#EDE7D3',
                                reaction: tada.id,
                                winnerCount: 1,
                                messages: {
                                    winMessage: {
                                        content: `{winners}, you have won a giveaway by {this.hostedBy}! :tada:`,
                                        embed: new MessageEmbed().setDescription(`there was **{this.winnerIds.length}** winner(s) for your giveaway **{this.prize}** (${embedURL(`jump to message`, '{this.messageURL}')})`).setFooter('if you want to reroll please do so now since all giveaway will be deleted in 14 days after they are finished') 
                        },
                        giveaway: `${tada} **GIVEAWAY** ${tada}`,
                        inviteToParticipate: `Enter the giveaway by reacting to ${tada}!`,
                        drawing: `remaining: {timestamp}`,
                        embedFooter: `started in:`,
                        giveawayEnded: `${tada} **GIVEAWAY ENDED** ${tada}`,
                        noWinner: `the giveaway above was ended because there was no enough participant :pensive:`,
                        units: {
                            pluralS: true
                        },
                },
                lastChance: {
                    enabled: true,
                    content: ':warning: LAST CHANCE TO ENTER :warning:'
                }
            }
        });
    };
}