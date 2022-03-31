module.exports = class CachedEmoji {
    constructor(data) {
        this.id = data.id;
        this.animated = data.animated;
        this.name = data.name;
    }
    toString() {
        return this.id ? `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>` : this.name;
    }
};