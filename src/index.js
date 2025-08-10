require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config');

config.load_config();
console.log(config.get_config());

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

module.exports = client;

client.commands = new Collection();

// Load command files
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.once('ready', async () => {
    console.log(`logged in as ${client.user.tag}`);

    // Auto-register slash commands for every guild the bot is in
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {
        for (const guild of client.guilds.cache.values()) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild.id),
                { body: commands }
            );
            console.log(`registered slash commands for guild: ${guild.name}`);
        }
        console.log('all slash commands registered.');
    } catch (error) {
        console.error('error registering commands:', error);
    }
});

client.on('guildCreate', async guild => {
    // Register commands when bot joins a new guild
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, guild.id),
            { body: commands }
        );
        console.log(`registered slash commands for new guild: ${guild.name}`);
    } catch (error) {
        console.error(`failed to register for ${guild.name}:`, error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN);
