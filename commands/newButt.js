const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newbutt')
    .setDescription('Adds a new image/gif/webm to the database (repalce [url] with a valid URL.'),
  async execute(interaction) {
    return interaction.reply('🍑 Sorry this feature is still a WIP - try again later and stay up to date on news via the support Discord found at https://bootybot.me/');
  },
};