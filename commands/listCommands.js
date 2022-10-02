const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bootybotcmd')
    .setDescription('Shows available Booty Bot Slash Commands'),
  async execute(interaction) {
    return interaction.reply(`:book: Here are the available commands (note that Booty Bot has recently been updated to use Discord Slash Commands instead of the "!{command}" syntax) :book:
      :one: ${'/gimmedabutt'}
        Posts a random butt image/gif from the interwebz.  Add a reaction to a response to auto add it to the curated list.

      :two: ${'/bestbuns'}
        Posts a butt image/gif from the curated list.  Buns that other people have vetted!

      :three: ${'/newbutt'} [url]
        Adds a new image/gif/webm to the database (repalce [url] with a valid URL - be sure to add a space after the command).  URLs from Imgur/Red Gifs work best.

      :four: ${'/listbutt'}
        Lists all current butt URLs in the database.`);
  },
};