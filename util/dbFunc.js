const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');

module.exports = class dbFunc {
    constructor(passthrough) {
		Object.defineProperty(this, 'passthrough', { value: passthrough });
	};
    async fetchEmbeds(guildId) {
        let embeds = await this.passthrough.db.embeds.findOne({
            guildID: guildId,
        });
        if (!embeds) embeds = new this.passthrough.db.embeds({
            guildID: guildId,
        })
        return embeds.toObject();
    }
    async saveEmbed(guildId, embed, id, creatorId) {
        let storage = await this.passthrough.db.embeds.findOne({
            guildID: guildId,
        });
        if (!storage) storage = new this.passthrough.db.embeds({
            guildID: guildId,
        });

        storage.embeds.push({
            embed: embed,
            _id: id,
            creator: creatorId,
        });
        await storage.save();
        return true;
    }
    async deleteEmbed(guildId, id) {
        if (!guildId) throw new Error('Guild ID is required to delete embed.', __dirname);
        let storage = await this.passthrough.db.embeds.findOne({
            guildID: guildId,
        });
        if (!storage) storage = new this.passthrough.db.embeds({
            guildID: guildId,
        });

        const embed = storage.embeds.find((x) => x._id === id);
        if (!embed) return false;

        storage.embeds.pull(embed);
        storage.markModified("embeds");
        await storage.save();
        return true;
    }
    async changeLevelingDestination(guildId, destination) {
        if (!guildId) throw new Error('Guild ID is required to change leveling destination.', __dirname);
        const setting = await this.passthrough.db.guilds.findOne({
            guildID: guildId
        });
        if (!destination) setting.levelings.destination = null;
        else setting.levelings.destination = destination;
        await setting.save();
        return true;
    }
    async changeByeDestination(guildId, destination) {
        if (!guildId) throw new Error('Guild ID is required to change leveling destination.', __dirname);
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            byeChannelID: destination || null,
        });
        return true;
    }
    async changeHiDestination(guildId, destination) {
        if (!guildId) throw new Error('Guild ID is required to change hi destination.', __dirname);
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            greetChannelID: destination || null,
        });
        return true;
    }
    async changeModLog(guildId, channelId) {
        if (!guildId) throw new Error('Guild ID is required to modify mod log channel.', __dirname);
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            logChannelID: channelId || null
        });
        return true;
    }
    async changePrefix(guildId, prefix) {
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            prefix
        });
        return true;
    }
    async changeHiContent(guildId, content) {
        if (!guildId) throw new Error('Guild ID is required to change hi content.', __dirname);
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            greetContent: content
        });
        // const setting = await this.passthrough.db.guilds.findOne({
        //     guildID: guildId
        // });
        // setting.greetContent = content;
        // await setting.save();
        return true;
    }
    async changeLevelingContent(guildId, content) {
        if (!guildId) throw new Error('Guild ID is required to change leveling content.', __dirname);
        const setting = await this.passthrough.db.guilds.findOne({
            guildID: guildId
        });
        setting.levelings.content = content
        setting.markModified('levelings');
        await setting.save();
        return true;
    }
    async changeByeContent(guildId, content) {
        if (!guildId) throw new Error('Guild ID is required to change bye content.', __dirname);
        await this.passthrough.db.guilds.findOneAndUpdate({
            guildID: guildId,
        }, {
            byeContent: content
        });
        // const setting = await this.passthrough.db.guilds.findOne({
        //     guildID: guildId
        // });
        // setting.byeContent = content;
        // await setting.save();
        return true;
    }
    async existingGuild(id) {
        if (!id) throw new Error('Guild ID is required to check existing data.', __dirname);
        const guild = await this.passthrough.db.guilds.findOne({
            guildID: id
        });
        return guild;
    }
    async createGuild(id, save) {
        if (!id) throw new Error('Guild ID is required create new data', __dirname);
        const newGuild = new this.passthrough.db.guilds({
            guildID: id
        });
        if (save) await newGuild.save();
        return newGuild;
    };
    async purgeMember(guildId, userId) {
        try {
            await this.passthrough.db.leveling.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
        
            await this.passthrough.db.cooldowns.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
            await this.passthrough.db.garden.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
            await this.passthrough.db.gameStorage.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
            await this.passthrough.db.money.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
            await this.passthrough.db.inventory.findOneAndDelete({
                guildId: guildId,
                userId: userId,
            });
    
            await this.passthrough.db.love.findOneAndDelete({
                guildID: guildId,
                userID: userId,
            });
            await hugSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            await punchSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            await slapSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            await cuddleSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            await kissSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            await patSchema.findOneAndDelete({
                userId: userId,
                guildId: guildId,
            });
            return true;
        } catch (err) {
            throw new Error(`An error occurred when trying to purge guild with id ${id}: `+ err, __dirname);
        }
    }
    async purgeGuild(id) {
        try {
            await this.passthrough.db.guilds.findOneAndDelete({
                guildID: id
            });
            await this.passthrough.db.embeds.deleteMany({
                guildID: id,
            });
            
            await this.passthrough.db.leveling.deleteMany({
                guildId: id,
            });
            await this.passthrough.db.cooldowns.deleteMany({
                guildId: id
            });
        
            await this.passthrough.db.garden.deleteMany({
                guildId: id
            });
            await this.passthrough.db.levelingRewards.deleteMany({
                guildId: id,
            });
    
            await this.passthrough.db.inventory.deleteMany({
                guildId: id
            });
    
            await this.passthrough.db.money.deleteMany({
                guildId: id
            });
        
            await this.passthrough.db.love.deleteMany({
                guildID: id
            });
        
            await this.passthrough.db.gameStorage.deleteMany({
                guildId: id
            });
        
            await hugSchema.deleteMany({
                guildId: id,
            });
        
            await punchSchema.deleteMany({
                guildId: id,
            });
        
            await musicSchema.deleteMany({
                guildId: id,
            });
        
            await slapSchema.deleteMany({
                guildId: id,
            });
        
            await cuddleSchema.deleteMany({
                guildId: id,
            });
        
            await kissSchema.deleteMany({
                guildId: id,
            });
        
            await patSchema.deleteMany({
                guildId: id,
            });
            return true;
        } catch (err) {
            throw new Error(`An error occurred when trying to purge guild with id ${id}: `+ err, __dirname);
        }
    }
    async purgeNonExistingGuilds(idsArray) {
        if (!idsArray) throw new Error('An full array of guild ids is required.', __dirname);
        try {
            const { deletedCount } = await this.passthrough.db.guilds.deleteMany({
                guildID: { $nin: idsArray }
            });
            await this.passthrough.db.embeds.deleteMany({
                guildID: { $nin: idsArray }
            });
            
            await this.passthrough.db.leveling.deleteMany({
                guildId: { $nin: idsArray }
            });
            await this.passthrough.db.cooldowns.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.garden.deleteMany({
                guildId: { $nin: idsArray }
            });
            await this.passthrough.db.levelingRewards.deleteMany({
                guildId: { $nin: idsArray }
            });
    
            await this.passthrough.db.inventory.deleteMany({
                guildId: { $nin: idsArray }
            });
    
            await this.passthrough.db.money.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.love.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.gameStorage.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await hugSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await punchSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await musicSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await slapSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await cuddleSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await kissSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await patSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
            return deletedCount;
        } catch (err) {
            throw new Error('An error occurred when trying to purge left guilds from the database: '+ err, __dirname);
        }
    };
};