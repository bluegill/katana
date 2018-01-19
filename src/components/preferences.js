const electron = require('electron')
const { app, shell } = electron
const { BrowserWindow } = electron

const ipc = electron.ipcMain

const fs = require('fs')
const config = require('../config')

module.exports = class {
  constructor(parent) {
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
      //this.showWindow();
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

      if (options.history) delete options.history
      if (options.hosts) delete options.hosts

      options.showIcon ? app.dock.show() : app.dock.hide()

      this.window.close()

      this.saveOptions(options)
    })

    ipc.on('log', (event, message) => {
      console.log(message)
    })
  }

  getOption(key) {
    return this.options[key]
  }

  setOption(key, val) {
    this.options[key] = val

    return this.options[key]
  }

  saveOptions(options) {
    if (options !== undefined) this.options = options

    const json = JSON.stringify(this.options)
    const path = `${config.paths.application}/config.json`

    fs.writeFileSync(path, json)
  }

  showWindow(update) {
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
      autoHideMenuBar: true,
    })

    this.window.loadURL(`file://${__dirname}/../../app/view/preferences.html`)

    this.window.once('ready-to-show', () => {
      this.window.show()
    })

    this.window.on('closed', () => {
      this.window = null
    })

    this.window.webContents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    this.window.webContents.on('did-finish-load', () => {
      if (update) this.window.webContents.send('showUpdate')
    })
  }
}