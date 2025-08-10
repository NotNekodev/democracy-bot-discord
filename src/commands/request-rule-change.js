const { ModalBuilder, SlashCommandBuilder, Events, StringSelectMenuBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js')
const client = require('../index.js');

module.exports = {
    data: new SlashCommandBuilder().setName('request-rule-change').setDescription('Request a rule change to the server'),
    async execute(interaction) {
        const whatChangeDropdown = new StringSelectMenuBuilder()
            .setCustomId('rule-change-type')
            .setPlaceholder('Select the type of change you want')
            .setOptions([
                {
                    label: 'Add a new rule',
                    value: 'add-rule',
                    description: 'Request the addition of a new rule'
                },
                {
                    label: 'Remove a rule',
                    value: 'remove-rule',
                    description: 'Request the removal of a rule'
                },
                {
                    label: 'Change an existing rule',
                    value: 'change-rule',
                    description: 'Request a change to an existing rule'
                },
                {
                    label: '[[ BIG SHOT ]]',
                    value: 'big-shot',
                    description: 'Request a big shot'
                },
            ]);

        const selectRow = new ActionRowBuilder().addComponents(whatChangeDropdown);

        await interaction.reply({
            content: 'What type of rule change would you like to request?',
            components: [selectRow],
            ephemeral: true
        });
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'rule-change-type') {
        const changeType = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`request-rule-change-modal-${changeType}`)
            .setTitle('Request a Rule Change');

        const ruleTitle = new TextInputBuilder()
            .setCustomId('rule-change-title')
            .setLabel('What is the title of the rule change?')
            .setStyle('Short')
            .setRequired(true);

        const changeDescription = new TextInputBuilder()
            .setCustomId('rule-change-description')
            .setLabel('Describe the change you want to make')
            .setStyle('Paragraph')
            .setRequired(true);

        const titleRow = new ActionRowBuilder().addComponents(ruleTitle);
        const descriptionRow = new ActionRowBuilder().addComponents(changeDescription);

        modal.addComponents(titleRow, descriptionRow);

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('request-rule-change-modal-')) {
        const changeType = interaction.customId.replace('request-rule-change-modal-', '');
        const title = interaction.fields.getTextInputValue('rule-change-title');
        const description = interaction.fields.getTextInputValue('rule-change-description');

        await interaction.reply({
            content: `Rule change request received!\n**Type:** ${changeType}\n**Title:** ${title}\n**Description:** ${description}`,
            ephemeral: true
        });


        const ruleChangeInfo = {
            type: changeType,
            title: title,
            description: description,
            initiator: interaction.user.id,
            timestamp: Math.floor(Date.now() / 1000), // unix timestamp
        };

        console.log('Rule change request info:', ruleChangeInfo);

        // send message with the info in the channel the command was run from
        const channel = interaction.channel;
        await channel.send({
            content: `New rule change request:\n**Type:** ${ruleChangeInfo.type}\n**Title:** ${ruleChangeInfo.title}\n**Description:** ${ruleChangeInfo.description}\n**Initiator:** <@${ruleChangeInfo.initiator}>\n**Timestamp:** <t:${ruleChangeInfo.timestamp}:F>`
        });

    }

});