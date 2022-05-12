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