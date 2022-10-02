const { SlashCommandBuilder } = require('discord.js');
const { getButt } = require('../services/db');

// Error message
const errorMessage = `🍑 Sorry an issue occurred please try again or message the issues thread on the support Discord which can be found here: https://bootybot.me/`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bestbuns')
    .setDescription('NSFW: Sends a random booty gif/image from the curated list of best buns.'),
  async execute(interaction) {
    let message = '';

    try {
      const butt = await getButt();
      message = butt;
    } catch (err) {
      console.log('Error', err)
      message = errorMessage;
    }

    return interaction.reply(message);
  },
};