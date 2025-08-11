require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const db = require('./utils/sqlite_shit.js');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config');

config.load_config();
db.prepare_db();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
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

            console.log("test");

            await guild.members.fetch();

            guild.members.cache.forEach(member => {
                if (!member.user.bot) {
                    try {
                        if (db.get_user(member.id) === undefined) {
                            db.add_user(member.id);
                        }
                    } catch (error) {
                        console.error(`Failed to add user ${member.id} to the database:`, error);
                    }
                }
            });
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

client.on('guildMemberAdd', async member => {
    console.log(`new member joined: ${member.id}`);
    try {
        if (db.get_user(member.id) === undefined) {
            await db.add_user(member.id);
        } else {
            await db.update_user(member.id, config.get_config().starting_rep);
            console.log(`updated user ${member.id} with starting rep`);
        }
    } catch (error) {
        console.error(`finger fucker`);
    }

});

client.login(process.env.BOT_TOKEN);
