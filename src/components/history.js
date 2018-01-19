const config = require('../config')
const utils = require('./utils')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(`${config.paths.application}/db.json`)
const db = low(adapter)

db.defaults({ screenshots: [] })
  .write()

module.exports = class {
  constructor(parent) {
    this.parent = parent
    this.options = parent.preferencesModule

    this.screenshots = []
  }

  addScreenshot(url) {
    let screenshot = {
      url: url,
      timestamp: utils.getTimestamp(true)
    }

    this.screenshots.push(screenshot)
    //this.addToRecents(screenshot);

    db.get('screenshots')
      .push({ url: screenshot })
      .write()
  }

  getHistory() {
    let screenshots = db.get('screenshots')
      .map('url')
      .sortBy('timestamp')
      .take(15)
      .value()

    return screenshots
  }

  addToRecents(screenshot) {
    if (!screenshot) return

    if (!this.parent.menu.items[2].submenu) {
      this.parent.menu.items[2].submenu = []
    }

    this.parent.menu.items[2].submenu.push({
      label: screenshot.url,
      click: () => { shell.openExternal(screenshot.url) }
    })

    console.log('aaaa')
    //this.parent.menu.items[2].submenu
  }


  populateMenu() {

  }

  addToMenu() {

  }

  clearMenu() {

  }
}