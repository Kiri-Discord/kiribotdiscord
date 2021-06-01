const express = require('express');
const { Client, Collection } = require("discord.js");
const PokemonStore = require('../features/pokemon/pokemonstore');
const RedisClient = require('../util/redis');
const VerifyTimer = require('../features/redis/verify');
const { GiveawaysManager } = require('discord-giveaways');
const giveawayModel = require('../model/giveaways');
const app = express();

const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
  async getAllGiveaways() {
    return await giveawayModel.find({});
  };

  async saveGiveaway(messageID, giveawayData) {
    await giveawayModel.create(giveawayData);
    return true;
  };

  async editGiveaway(messageID, giveawayData) {
    await giveawayModel.findOneAndUpdate({ messageID: messageID }, giveawayData).exec();
    return true;
  };
  async deleteGiveaway(messageID) {
    await giveawayModel.findOneAndDelete({ messageID: messageID }).exec();
    return true;
  }
};

module.exports = class sefy extends Client {
    constructor(options) {
    super(options)
    this.vote = require('../model/vote');
    this.globalStorage = require('../model/global');
    this.gameStorage = require('../model/game');
    this.webapp = app;
    this.queue = new Map();
    this.commands = new Collection();
    this.redis = RedisClient ? RedisClient.db : null;
    this.cooldowns = new Collection();
    this.helps = new Collection();
    this.customEmojis = new Collection();
    this.allNameCmds = [];
    this.allNameFeatures = [];
    this.allNameFeaturesSlash = [];
    this.aliases = new Collection();
    this.config = require('../config.json');
    this.recent = new Set();
    this.money = require('../model/currency');
    this.love = require('../model/love');
    this.dbguilds = require('../model/guild');
    this.leveling = require("../util/LevelingUtil.js");
    this.dbleveling = require("../model/leveling")
    this.dbverify = require("../model/verify")
    this.games = new Collection();
    this.voicequeue = new Collection();
    this.pokemon = new PokemonStore();
    this.verifytimers = new VerifyTimer(this);
    this.giveaways = null;
  }
  initGiveaways() {
    const tada = this.customEmojis.get('giveaway');
    const manager = new GiveawayManagerWithOwnDatabase(this, {
      updateCountdownEvery: 10000,
      hasGuildMembersIntent: true,
      default: {
        botsCanWin: false,
        embedColor: '#ba6363',
        embedColorEnd: '#67cc60',
        reaction: tada.id,
        winnerCount: 1,
        messages: {
          giveaway: `${tada} **GIVEAWAY** ${tada}`,
          inviteToParticipate: `Enter the giveaway by reacting to ${tada}!`,
          timeRemaining: `Remaining time: **{duration}**`,
          embedFooter: `started in:`,
          noWinner: `the giveaway above was ended because there was no winner :pensive:`,
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
    this.giveaways = manager;
  }
}
