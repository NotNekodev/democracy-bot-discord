const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const handle_poll_end = require('../handling/poll_handling.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end')
        .setDescription('Ends a poll')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The message ID of poll (NOT OF THE FIRST MESSAGE IN THE THREAD)')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');

        const pollMessage = await interaction.channel.messages.fetch(messageId);
        if (!pollMessage) {
            return await interaction.reply(`Poll with message ID ${messageId} not found`);
        }

        if (!pollMessage.poll) {
            return await interaction.reply(`Poll with message ID ${messageId} is not a valid poll`);
        }

        await handle_poll_end(pollMessage);

        await interaction.reply(`Poll with message ID ${messageId} ended`);
    }
};
