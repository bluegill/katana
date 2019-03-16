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

const electron = require('electron')
const { app, shell, BrowserWindow, Menu } = electron

const ipc = electron.ipcMain

const fs = require('fs')
const config = require('../config')

module.exports = class {
  constructor (parent) {
    this.parent = parent

    const path = config.paths.application

    try {
      this.options = require(`${path}/config.json`)
    } catch (e) {
      this.options = {}
    }

    app.on('active', () => {
      if (this.window === null) {
        this.showWindow()
      }
    })

    app.on('window-all-closed', (e) => {
      e.preventDefault()
    })

    app.on('ready', () => {
      // this.showWindow();
    })

    ipc.on('getOptions', (event, arg) => {
      const options = this.options

      if (!options.shortcuts) {
        options.shortcuts = config.defaults.shortcuts
      }

      if (!options.hosts) {
        options.hosts = []

        for (let service in config.services.pomf) {
          options.hosts.push(service)
        }
      }

      if (!options.history) {
        options.history = this.parent.historyModule.getHistory()
      }

      event.sender.send('getOptions', options)
    })

    ipc.on('saveOptions', (event, options) => {
      if (!this.parent.appPath.includes('electron')) {
        if (options.startAtLogin === true) {
          this.parent.appLauncher.enable()
        } else {
          this.parent.appLauncher.disable()
        }
      }

      if (options.shortcuts) {
        if (options.shortcuts !== this.options.shortcuts) {
          for (const shortcut of Object.keys(options.shortcuts)) {
            let combo = options.shortcuts[shortcut]

            if (shortcut !== this.options.shortcut) {
              this.parent.shortcutManager.updateShortcut(shortcut, this.options.shortcuts[shortcut], combo)
            }
          }
        }
      }

      if (this.options.customService) {
        options.customService = this.options.customService
      }

      if (options.history) delete options.history
      if (options.hosts) delete options.hosts

      options.showIcon ? app.dock.show() : app.dock.hide()

      this.window.close()

      this.saveOptions(options)
    })

    ipc.on('updateService', (event, service) => {
      this.options.customService = service
    })

    ipc.on('log', (event, message) => {
      console.log(message)
    })
  }

  getOption (key) {
    return this.options[key]
  }

  setOption (key, val) {
    this.options[key] = val

    return this.options[key]
  }

  saveOptions (options) {
    if (options !== undefined) this.options = options

    const json = JSON.stringify(this.options)
    const path = `${config.paths.application}/config.json`

    fs.writeFileSync(path, json)
  }

  showWindow () {
    if (this.window) return

    this.window = new BrowserWindow({
      width: 480,
      height: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      backgroundColor: '#2e2e2e',
      frame: false,
      show: false,
      hasShadow: false,
      autoHideMenuBar: true
    })

    this.window.loadURL(`file://${__dirname}/../../app/view/preferences.html`)

    this.window.on('closed', () => {
      this.window = null
    })

    this.window.webContents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    var template = [{
      label: 'Application',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: function () { app.quit() } }
      ] }, {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ] }
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    this.window.once('ready-to-show', () => {
      this.window.show()
    })
  }
}
