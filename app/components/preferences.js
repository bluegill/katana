const electron = require('electron')
const {app, shell} = electron
const {BrowserWindow} = electron

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
      if (this.win === null) {
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
              this.parent.shortcutManager
                         .updateShortcut(shortcut, this.options.shortcuts[shortcut], combo)
            }
          }
        }
      }

      if (options.showIcon === true) {
        app.dock.show()
      } else {
        app.dock.hide()
      }

      this.win.close()
      this.saveOptions(options)
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

  showWindow (update) {
    if (this.win) return

    this.win = new BrowserWindow({
      width: 480,
      height: 280,
      resizable: false,
      minimizable: false,
      frame: false,
      fullscreenable: false,
      alwaysOnTop: true,
      vibrancy: 'dark',
      show: false
    })

    this.win.loadURL(`file://${__dirname}/../view/preferences.html`)

    this.win.on('ready-to-show', this.win.show)

    this.win.on('closed', () => {
      this.win = null
    })

    this.win.webContents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    this.win.webContents.on('did-finish-load', () => {
      if (update) this.win.webContents.send('showUpdate')
    })
  }
}
