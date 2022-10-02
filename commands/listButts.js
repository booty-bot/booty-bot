const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listbutts')
    .setDescription('Lists URLs in the Best Buns list.'),
  async execute(interaction) {
    return interaction.reply('🍑 Sorry this feature is still a WIP - try again later and stay up to date on news via the support Discord found at https://bootybot.me/');
  },
};