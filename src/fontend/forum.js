require('dotenv').config();
const { Act, RuleChangeAct, RuleChangeCategory } = require('./act');

module.exports = {
    VOTE_FORUM_CHANNEL_ID: process.env.VOTE_FORUM_CHANNEL_ID,

    async create_rule_thread(act) {
        if (act instanceof RuleChangeAct) {

        } else {
            throw new Error("Invalid act type for rule thread creation");
        }
    },
}