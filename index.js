const { Client, Intents } = require('discord.js');
const Reddit = require('reddit')
const axios = require('axios');
const Database = require('@replit/database')
const keepAlive = require('./server')

const username = process.env['UNAME']
const password = process.env['PWORD']
const appId = process.env['CLIENTID']
const appSecret = process.env['SECRET']

const reddit = new Reddit({
  username,
  password,
  appId,
  appSecret,
  userAgent: 'Booty Bot'
})

const db = new Database()

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS ,
] })

const BotMessages = {
  gimmeDaButt: '!gimmedabutt',
  newButt: '!newbutt',
  delButt: '!delbutt',
  listButt: '!listbutt',
  listCommands: '!bootybotcmd',
}

const BotFlags = {
  curated: { verbose: 'curated', short: 'c' },
}

const subreddits = [
  'bigasses',
  'bigass',
  'twerking',
  'pawg',
  'bigblackasses',
  'rice_cakes',
  'asstastic',
  'ass',
]

const times = [
  't=year',
  't=month',
]

const alwaysTypes = [
  'hot'
]

const randomTypes = [
  'top'
]

const daButts = [
  'https://i.imgur.com/Kqm7HWw.gifv',
  'https://www.redgifs.com/watch/queasythreadbarewhooper',
]

console.log('Checking DB')
db.get('butts').then(butts => {
  console.log('butts', butts)
  if (!butts || butts.length < 1) {
    db.set('butts', daButts)
  }
})

function getUrl(subreddit, rType, timeString=null, afterId=null) {
  let query
  if (timeString) {
    query = `?${timeString}${afterId ? '&after=' : ''}${afterId ? afterId : ''}`
  } else {
    query = `${afterId ? '?after=' : ''}${afterId ? afterId : ''}`
  }
  return `/r/${subreddit}/${rType}${query}`
}

function getRandomIndex(inArray) {
  return inArray[Math.floor(Math.random() * inArray.length)]
}

async function collectButts() {
  let redditButtUrls = [];
  for (const subreddit of subreddits) {
    redditButtUrls = redditButtUrls.concat(getUrl(subreddit, alwaysTypes[0], times[0]))
  }

  console.log(redditButtUrls)
  let allDemRedditButts = await Promise.all(
    redditButtUrls.map(async url => {
        console.log('url', url)
        let res = await reddit.get(url)
        const after = res.data.after
        const data = res?.data?.children
          .map(e => e?.data?.url_overridden_by_dest)
          .filter(e => typeof e ==='string')
          .filter(e => e.includes('redgifs') || e.includes('imgur'))
        
        return {data, after}
    })
  )

  // Map and flatten the array
  allDemRedditButts = allDemRedditButts.map(e => e.data).flat()
  console.log(allDemRedditButts)

  // Get a random one
  const theMainButt = getRandomIndex(allDemRedditButts)
  return theMainButt
}

function updatebutts(buttUrl) {
  db.get('butts').then(butts => {
    // TODO - Verify the URL first
    butts.push(buttUrl)
    db.set('butts', butts)
  })
}

function deleteButt(index) {
  // TODO - Accept an index or a string and maybe check with flags - also could report back more info of what was deleted
  db.get('butts').then(butts => {
    if (butts.length > index) {
      butts.splice(index, 1)
      db.set('butts', butts)
    }
  })  
}

function getButt() {
  // TODO - Check if DB is empty first and pop with init state
  return db.get('butts').then(butts => {
    if (butts.length > 0) {
      return butts[Math.floor(Math.random() * butts.length)]
    } else {
      return daButts[Math.floor(Math.random() * daButts.length)]
    }
  })
}

// Main Routine
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  console.log(client.user.status);
  client.user.setActivity(`${client.users.cache.size} users`)
  client.user.setStatus('available')

  setInterval(function() {
    console.log('Setting activity');
    client.user.setActivity(`${client.users.cache.size} users`)
    client.user.setStatus('available')
  }, 300000)
})

client.on('debug', console.log)

client.on('rateLimit', console.log)

client.on('messageCreate', async (msg) => {
  // Disregard messages from the bot or anyhting that doesn't start with !
  if (msg.author.bot || !msg.content.startsWith('!')) return

  // Unpack
  let inMsg = msg.content.toLowerCase()

  // Send a butt
  if (inMsg.startsWith(BotMessages.gimmeDaButt)) {
    let buttMsg = await msg.channel.send(':peach: Loading the Booty :peach:')

    if (
      inMsg.includes(`--${BotFlags.curated.verbose}`) || 
      inMsg.includes(`-${BotFlags.curated.short}`)
    ) {
      getButt()
        .then(thisButt => {
          buttMsg.edit(!msg.channel.nsfw ? 
            `NSFW :eye::lips::eye: || ${thisButt} ||` :
            thisButt)
      })
    } else {
      const collectedButt = await collectButts()
      buttMsg.edit(!msg.channel.nsfw ? 
            `NSFW :eye::lips::eye: || ${collectedButt} ||` :
            collectedButt)
    }
    
  }

  // Add a butt to the list
  if (inMsg.startsWith(BotMessages.newButt)) {
    let newButtUrl = msg.content.split(`${BotMessages.newButt} `)[1]
    updatebutts(newButtUrl)
    msg.channel.send(':peach: New Butt Added :peach:')
  }

  // Delete a butt from the list
  if (inMsg.startsWith(BotMessages.delButt)) {
    let index = parseInt(msg.content.split(`${BotMessages.delButt} `)[1])
    deleteButt(index)
    msg.channel.send(':x: Butt Deleted :x:')
  }

  // List all butts
  if (inMsg.startsWith(BotMessages.listButt)) {
    // TODO - better formatting
    db.get('butts').then(butts => {
      console.log(butts);
      let formattedButts = Object.assign({}, butts)
      msg.channel.send('`' + JSON.stringify(formattedButts, null, 4) + '`')
    })
  }

  // List commands
  if (inMsg.startsWith(BotMessages.listCommands)) {
    // TODO - Format and use embed https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
    msg.channel.send(`:book: Here are the available commands :book:
    :one: ${BotMessages.gimmeDaButt}
      Posts a random butt image/gif from the interwebz.  Will mark as a spoiler in a non-NSFW channel.  Use the optional -c or --curated flag to pull randomly from a curated list of butts.  Add a reaction to a response to auto add it to the curated list.

    :two: ${BotMessages.newButt} [url]
      Adds a new image/gif/webm to the database (repalce [url] with a valid URL - be sure to add a space after the command).  URLs from Imgur/Red Gifs work best.
    
    :three: ${BotMessages.delButt} [index]
      Deletes a butt from the database where [index] is the index in the DB.

    :four: ${BotMessages.listButt}
      Lists all current butt URLs in the database.`)
  }

})

client.on('messageReactionAdd', (reactionOrig, user) => {
  console.log(reactionOrig, user)
  if (reactionOrig.message.author.id === client.user.id) {
    let reactedContent =  reactionOrig.message.content
    console.log(reactedContent)
    // Parse
    if (reactedContent.includes('imgur') || reactedContent.includes('redgifs')) {
      let extractedUrl;
      if (reactedContent.includes('||'))
        extractedUrl = reactedContent.split('||')[1].trim()
      else
        extractedUrl = reactedContent
      
      updatebutts(extractedUrl)
      reactionOrig.message.channel.send(':peach: Added this butt to the curated list :peach:')
    }
  }
});

// Run
keepAlive()
client.login(process.env['TOKEN'])

// TODO - Hydrate from api call(s), add flags for image vs gif and for level of nsfw, add error handling and try/catch so the server doesn't crash, message is deprecated, curated flag vs random from reddit