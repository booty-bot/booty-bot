const { Client, Intents, MessageAttachment } = require('discord.js');
const Reddit = require('reddit')
const axios = require('axios');
const Database = require('@replit/database')
const keepAlive = require('./server')
const { Octokit, App } = require("octokit");
const fs = require('fs');

const username = process.env['UNAME']
const password = process.env['PWORD']
const appId = process.env['CLIENTID']
const appSecret = process.env['SECRET']

const octokit = new Octokit({
  auth: process.env['GIST_PERSONAL_ACCESS_TOKEN']
})

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
  hardcore: { verbose: 'hardcore', short: 'h' },
  filters: { imgur: 'imgur', redgifs: 'redgifs' },
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

const hcSubreddits = [
  'anal',
  'AnalGW',
  'MasterOfAnal',
  'anal_gifs',
  'AnalOrgasms',
  'lesbianasslick',
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

function logInfo(info) {
  try {
    nowDate = new Date()
    info = `${nowDate.toISOString()} - ${info}`

    octokit.request(`GET /gists/${process.env['GIST_ID']}`, {
      gist_id: 'GIST_ID'
    }).then(res => {
      fileContents = res.data.files['booty_bot.log'].content
      newlines = fileContents.split(/\r\n|\r|\n/).length

      let newContents = ''
      if (newlines <= 1000) {
        newContents = fileContents
      }

      fileContents += '\n'
      fileContents += info

      octokit.request(`PATCH /gists/${process.env['GIST_ID']}`, {
        gist_id: process.env['GIST_ID'],
        description: 'An update to a gist',
        files: {
          'booty_bot.log': {
            content: fileContents
          }
        }
      })
    })
  } catch(err) {
    console.log('Error:', err.message)
    logInfo(err.message)
  }
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

function getUrl(subreddit, rType, timeString=null, afterId=null, filterImgur=false) {
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

async function collectButts(hcMode, imgurMode) {
  if (!hcMode)
    hcMode = false;
  if (!imgurMode)
    imgurMode = false;

  let redditButtUrls = [];
  if (hcMode) {
    console.log('hc mode')
    for (const subreddit of hcSubreddits) {
      redditButtUrls = redditButtUrls.concat(getUrl(subreddit, alwaysTypes[0], times[0]))
    }
  } else if (imgurMode) {
    console.log('imgur mode')
    for (const subreddit of subreddits) {
      redditButtUrls = redditButtUrls.concat(getUrl(subreddit, alwaysTypes[0], times[0], false, imgurMode))
    }
  } else {
    for (const subreddit of subreddits) {
      redditButtUrls = redditButtUrls.concat(getUrl(subreddit, alwaysTypes[0], times[0]))
    }
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

  if (imgurMode) {
    console.log('Imgur mode')
    allDemRedditButts = allDemRedditButts.filter(e => e.includes('imgur'))
  }
  console.log(allDemRedditButts)

  // Get a random one
  const theMainButt = getRandomIndex(allDemRedditButts)
  return theMainButt
}

function updatebutts(buttUrl) {
  // TODO arbitray cap for now
  return db.get('butts').then(butts => {
    if (butts.length <= 1000 && !butts.includes(buttUrl) && validURL(buttUrl)) {
      butts.push(buttUrl)
      db.set('butts', butts)
      return true
    } else {
      return false
    }
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

  try {
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
      } else if (inMsg.includes(`--${BotFlags.filters.imgur}`)) {
        // TODO Need to refactor
        console.log('refactor block');
        const collectedButtImgur = await collectButts(false, true)
        buttMsg.edit(!msg.channel.nsfw ? 
              `NSFW --Imgur Mode Super Spicy :eye::lips::eye: ||             ${collectedButtImgur} ||` :
              `${collectedButtImgur} --Imgur Mode Super Spicy`)
        // TODO Need to refactor
      } else if (
        (
          inMsg.includes(`--${BotFlags.hardcore.verbose}`) || 
          inMsg.includes(`-${BotFlags.hardcore.short}`)
        ) &&
       !(
          inMsg.includes(`--${BotFlags.curated.verbose}`) ||
          inMsg.includes(`-${BotFlags.curated.short}`)
       )
      ) {
        const collectedButtHc = await collectButts(true)
        buttMsg.edit(!msg.channel.nsfw ? 
              `NSFW --Hardcore Mode Super Spicy :eye::lips::eye: || ${collectedButtHc} ||` :
              `${collectedButtHc} --Hardcore Mode Super Spicy`)
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
        .then(buttStatus => {
          if (buttStatus)
            msg.channel.send(':peach: New Butt Added :peach: `' + newButtUrl + '`')
          else
            msg.channel.send(':peach: Skipping, that butt has already been added or this is an invalid URL :peach:')
        })
    }

    // Delete a butt from the list
    if (inMsg.startsWith(BotMessages.delButt)) {
      if (msg.author.id === process.env['SUPERUSER']) {
        let index = parseInt(msg.content.split(`${BotMessages.delButt} `)[1])
        deleteButt(index)
        msg.channel.send(':x: Butt Deleted :x:')
      } else {
        msg.channel.send(':x: Sorry, you do not have permission to delete :x:')
      }
      
    }

    // List all butts
    if (inMsg.startsWith(BotMessages.listButt)) {
      db.get('butts').then(butts => {
        console.log(butts);
        let formattedButts = Object.assign({}, butts)
        let bufferButts = Buffer.from(JSON.stringify(formattedButts, null, 4))
        let buttAttach = new MessageAttachment(bufferButts, 'butt_list.txt')
        msg.channel.send({files: [buttAttach]})
      })
    }

    // List commands
    if (inMsg.startsWith(BotMessages.listCommands)) {
      msg.channel.send(`:book: Here are the available commands :book:
      :one: ${BotMessages.gimmeDaButt}
        Posts a random butt image/gif from the interwebz.  Will mark as a spoiler in a non-NSFW channel.  Use the optional -c or --curated flag to pull randomly from a curated list of butts.  Add a reaction to a response to auto add it to the curated list.  Use the --hardcore or -h flag for hardcore butt stuff.

      :two: ${BotMessages.newButt} [url]
        Adds a new image/gif/webm to the database (repalce [url] with a valid URL - be sure to add a space after the command).  URLs from Imgur/Red Gifs work best.
      
      :three: ${BotMessages.delButt} [index]
        Deletes a butt from the database where [index] is the index in the DB. (Super Admin Only).

      :four: ${BotMessages.listButt}
        Lists all current butt URLs in the database.`)
    }

  } catch(err) {
    console.log('Error:', err.message)
    logInfo(err.message)
  }

})

client.on('messageReactionAdd', (reactionOrig, user) => {
  console.log(reactionOrig, user)
  try {
    if (reactionOrig.message.author.id === client.user.id) {
      let reactedContent =  reactionOrig.message.content
      console.log(reactedContent)
      // Parse
      if ((reactedContent.includes('imgur') || reactedContent.includes('redgifs')) && !reactedContent.includes('--Hardcore')) {
        let extractedUrl;
        if (reactedContent.includes('||'))
          extractedUrl = reactedContent.split('||')[1].trim()
        else
          extractedUrl = reactedContent
        
        updatebutts(extractedUrl).then(buttStatus => {
          if (buttStatus)
            reactionOrig.message.channel.send(':peach: Added this butt to the curated list :peach: `' + extractedUrl + '`')
        })
      }
    }
  } catch(err) {
    console.log('Error:', err.message)
    logInfo(err.message)
  }
});

// Run
keepAlive()
client.login(process.env['TOKEN'])

// TODO - Hydrate from api call(s), add flags for image vs gif and for level of nsfw, add error handling and try/catch so the server doesn't crash, message is deprecated, curated flag vs random from reddit