const config = require('../config')
const utils = require('./utils')

module.exports = class {
  constructor (parent) {
    this.parent = parent
    this.options = parent.preferencesModule

    this.screenshots = []
  }

  addScreenshot (screenshot) {
    this.screenshots.push(screenshot)
  }

  addToRecent (screenshot) {

  }

  getHistory () {

  }
}
