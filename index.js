// Imports
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const token = process.env['TOKEN'];
const { addButt } = require('./services/db');

// Config
const username = process.env['UNAME']
const password = process.env['PWORD']
const appId = process.env['CLIENTID']
const appSecret = process.env['SECRET']

// Client Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log('Ready!');
});

// Slash command handlers
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Button handlers
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isButton()) return;
	console.log(interaction);

  if (interaction.customId === 'addToBestBuns') {
    console.log('Trying to add this URL: ', interaction?.message?.content)
    const resp = await addButt(interaction?.message?.content)

    if (resp) 
      interaction.reply('🍑 Added this one to the list of Best Buns!');
    else
      interaction.reply('⚠️ Either that booty is already in the Best Buns list or this was a bad URL');
  }
});

try {
  console.log('Logging In')
  client.login(token);
  console.log('Logged In')
} catch (err) {
  console.log('Error logging in', err)
}
