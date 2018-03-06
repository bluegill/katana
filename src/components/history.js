/*
 *  Katana - a powerful, open-source screenshot utility
 *
 *  Copyright (C) 2018, Gage Alexander <gage@washedout.co>
 *
 *  Katana is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  Katana  is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Katana. If not, see <http://www.gnu.org/licenses/>.
 */

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
      .orderBy('timestamp', 'asc')
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