const RuleChangeCategory = Object.freeze({
    ADD: 'cat-rule-add',
    REMOVE: 'cat-rule-remove',
    UPDATE: 'cat-rule-update'
})

class Act {
    constructor(title, description, timestamp, userID) {
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.userID = userID;
    }

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getUserID() {
        return this.userID;
    }

    timestampToDiscordFormat() {
        const str = "<t:" + this.timestamp + ":F>";
        return str;
    }

    userIDToDiscordMention() {
        const str = "<@" + this.userID + ">";
        return str;
    }
}

class RuleChangeAct extends Act {
    constructor(title, description, timestamp, userID, category) {
        super(title, description, timestamp, userID);
        this.category = category;
    }

    getCategory() {
        return this.category;
    }
}

module.exports = {
    RuleChangeCategory,
    RuleChangeAct,
    Act
}