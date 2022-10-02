const Database = require('@replit/database');

const daButts = [
  'https://i.imgur.com/Kqm7HWw.gifv',
  'https://www.redgifs.com/watch/queasythreadbarewhooper',
]

const isValidURL = (str) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
};

const getDB = async () => {
  console.log('Checking DB')
  const db = new Database()
  db.get('butts').then(butts => {
    console.log('butts', butts)
    if (!butts || butts.length < 1) {
      db.set('butts', daButts)
    }
  })

  return db;
}

module.exports.getButt = async () => {
  const db = await getDB();
  return db.get('butts').then(butts => {
    if (butts.length > 0) {
      return butts[Math.floor(Math.random() * butts.length)]
    } else {
      return daButts[Math.floor(Math.random() * daButts.length)]
    }
  })
}

module.exports.addButt = async (buttUrl) => {
  const db = await getDB();
  return db.get('butts').then(butts => {
    if (buttUrl && butts.length <= 1000 && !butts.includes(buttUrl) && isValidURL(buttUrl)) {
      butts.push(buttUrl)
      db.set('butts', butts)
      return true
    } else {
      return false
    }
  })
}

module.exports.listButts = async () => {
  const db = await getDB();
  return db.get('butts').then(butts => {
    console.log(butts);
    let formattedButts = Object.assign({}, butts)
    return formattedButts;
  })
}