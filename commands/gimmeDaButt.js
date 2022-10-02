const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RedditGrabber } = require('media-grab');

// Subreddits
const subreddits = [
  'bigassmatters',
  'bigass',
  'twerking',
  'pawg',
  'bigblackasses',
  'rice_cakes',
  'asstastic',
  'ass',
]

// Error message
const errorMessage = `🍑 Sorry an issue occurred please try again or message the issues thread on the support Discord which can be found here: https://bootybot.me/`;

// Config
const username = process.env['UNAME']
const password = process.env['PWORD']
const appId = process.env['CLIENTID']
const appSecret = process.env['SECRET']

// Handle the message
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gimmedabutt')
    .setDescription('NSFW: Sends a random booty gif/image from the interwebz.'),
  async execute(interaction) {
    // Setup grabber
    const reddit = new RedditGrabber({
      username: username,
      password: password,
      appId: appId,
      appSecret: appSecret,
      userAgent: 'Booty Bot',
    })
    reddit.setSubreddits(subreddits)

    // Message
    let message = '';
    try {
      const resp = await reddit.grabbit()
      console.log('Got da booty')
      console.log(resp)

      message = interaction?.channel?.nsfw ?
        (resp?.url || errorMessage) :
        `NSFW :eye::lips::eye: || ${resp?.url || errorMessage} ||`
        ;
    } catch (err) {
      message = errorMessage;
      console.log('Error in GimmeDaButt');
      console.log(err);
    }

    // Button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('addToBestBuns')
          .setLabel('🍑 Add to Best Buns!')
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({ content: message, components: [row] });
  },
};