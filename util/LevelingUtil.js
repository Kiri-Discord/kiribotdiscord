this.getLevel = (xp) => {
    return Math.floor(0.177 * Math.sqrt(xp)) + 1;
};

this.getLevelBounds = (level) => {
    const lowerBound = Math.ceil(((level - 1) / 0.177) ** 2);
    const upperBound = Math.ceil((level / 0.177) ** 2);
    return { lowerBound, upperBound };
};

this.gainedXp = () => {
    return Math.ceil(Math.random() * 9) + 3;
};


