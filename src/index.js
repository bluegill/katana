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

const fs = require('fs-extra')
const os = require('os')

const electron = require('electron')
const AutoLaunch = require('auto-launch')

const ShortcutManager = require('./components/shortcutManager')
const config = require('./config')

const { Tray, Menu, Notification, shell } = electron

const ipc = electron.ipcMain

const app = new (class { // eslint-disable-line no-unused-vars
  constructor () {
    // create application home dir if it doesn't exist
    fs.ensureDirSync(config.paths.uploads)

    this.appPath = electron.app.getPath('exe').split('.app/Content')[0] + '.app'

    if (!this.appPath.includes('electron')) {
      this.appLauncher = new AutoLaunch({
        name: 'Katana',
        path: this.appPath
      })
    }

    this.preferencesModule = new (require('./components/preferences'))(this)
    this.updaterModule = new (require('./components/updater'))(this)
    this.screenshotModule = new (require('./components/screenshot'))(this)
    this.shortenerModule = new (require('./components/urlShortener'))(this)
    this.historyModule = new (require('./components/history'))(this)

    const startAtLogin = this.preferencesModule.getOption('startAtLogin')

    if (startAtLogin && this.appLauncher) {
      this.appLauncher.enable()
    }

    ipc.on('getVersion', (event, arg) => {
      const version = require('../package').version

      event.sender.send('getVersion', version)
    })

    // initialize menu bar
    this.createTray()
  }

  createTray () {
    this.app = electron.app

    if (os.platform() === 'darwin') {
      this.app.dock.hide()

      if (this.preferencesModule.getOption('showIcon')) {
        this.app.dock.show()
      }
    }

    this.app.commandLine.appendSwitch('disable-renderer-backgrounding')

    this.app.on('ready', () => {
      this.shortcutManager = new ShortcutManager(this)
      this.tray = new Tray(config.icons.tray.default)

      this.menu = Menu.buildFromTemplate([{
        label: 'Take Screenshot',
        type: 'normal',
        click: () => {
          this.screenshotModule.captureSelection()
        }
      },

      {
        label: 'Preferences...',
        type: 'normal',
        accelerator: 'CommandOrControl+,',
        click: () => {
          this.preferencesModule.showWindow()
        }
      },

      { type: 'separator' },

      {
        label: 'Quit',
        type: 'normal',
        accelerator: 'CommandOrControl+Q',
        click: () => {
          this.app.quit()
        }
      }
      ])

      this.tray.on('drop-files', (event, files) => {
        const file = files[0]
        const ext = file.split('.').pop()

        const allowed = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff']

        if (allowed.includes(ext)) {
          console.log('Uploading image...')

          this.screenshotModule.upload(file, (result, error) => {
            if (!error) {
              this.showNotification('Image has been uploaded and copied to your clipboard.', 'Image Uploaded', result.link)
            } else {
              this.showNotification('Image failed to upload.', 'Upload Error')
            }
          }, true)
        }
      })

      Menu.setApplicationMenu(this.menu)

      this.tray.setToolTip('Katana')
      this.tray.setContextMenu(this.menu)
    })
  }

  showNotification (message, title, url) {
    let notification = new Notification({
      title: title,
      body: message,
      sound: 'default'
    })

    notification.on('click', () => {
      if (url) shell.openExternal(url)
    })

    notification.show()
  }

  setIcon (type) {
    this.tray.setImage(config.icons.tray[type])
  }
})()
