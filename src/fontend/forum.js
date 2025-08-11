require('dotenv').config();
const { Act, RuleChangeAct, RuleChangeCategory } = require('../act.js');
const client = require('../index.js')
const config = require('../config');
const db = require('../utils/sqlite_shit.js');
const { PollLayoutType } = require('discord.js');

module.exports = {
    VOTE_FORUM_CHANNEL_ID: process.env.VOTE_FORUM_CHANNEL_ID,

    create_thread: async function (act) {
        if (act instanceof RuleChangeAct) {
            const channel = client.channels.cache.get(config.get_config().modules.votes.votes_channel);
            try {
                let title;
                const user = await client.users.fetch(act.getUserID());
                switch (act.getCategory()) {
                    case RuleChangeCategory.ADD:
                        title = `@${user.username} wants to add the rule "${act.getTitle()}"`;
                        break;
                    case RuleChangeCategory.REMOVE:
                        title = `@${user.username} wants to remove the rule "${act.getTitle()}"`;
                        break;
                    case RuleChangeCategory.UPDATE:
                        title = `@${user.username} wants to update the rule "${act.getTitle()}"`;
                }

                const message = `**Description:** ${act.getDescription()}\n**Initiator:** ${act.userIDToDiscordMention()}\n**Timestamp:** ${act.timestampToDiscordFormat()}`;

                const thread = await channel.threads.create({
                    name: title,
                    message: {
                        content: message,
                    },

                });

                // create poll
                const thread_channel = await client.channels.fetch(thread.id);

                const poll = await thread_channel.send({
                    poll: {
                        question: { text: `pepis` },
                        answers: [
                            { text: 'Yes', emoji: '🔴' },
                            { text: 'No', emoji: '🟢' }
                        ],
                        allowMultiselect: false,
                        duration: 24, // hours
                        layoutType: PollLayoutType.Default,
                    }
                })


                await db.create_vote(
                    poll.id, thread.id,
                    act.getUserID(),
                    ((((Math.floor(Date.now() / 1000)) * 60) * 60) * 24),
                    act.getCategory(),
                    title,
                    act.getTitle(),
                    act.getDescription(),
                    "",
                    "",
                    ""
                )

            } catch (error) {
                console.error(`Failed to create thread for act: ${act.getTitle()}`, error);
                throw error;
            }
        } else {
            throw new Error("Invalid act type for rule thread creation");
        }
    },
}