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

const request = require('request')
const fs = require('fs')
const path = require('path')
const sudo = require('sudo-prompt')
const electron = require('electron')

const pkg = require('../../package')

const childProcess = require('child_process')
const decompress = require('decompress')

const ipc = electron.ipcMain

const { dialog } = electron

const config = require('../config')

module.exports = class {
  constructor (parent) {
    this.parent = parent
    this.options = parent.preferencesModule

    this.updatePath = 'https://raw.githubusercontent.com/bluegill/katana/master/package.json'
    this.downloadPath = 'https://github.com/bluegill/katana/releases/download/'

    this.checkOnLaunch = true
    this.checkInterval = 6 // 6 hours

    const options = this.options.getOption('updater')

    if (options) {
      if (options.checkOnLaunch === false) this.checkOnLaunch = options.checkOnLaunch
      if (options.checkInterval) this.checkInterval = options.checkInterval
    }

    if (this.checkOnLaunch) this.checkForUpdate()

    // check for update every X hours
    const time = ((1000 * 60 * 60) * this.checkInterval)

    setInterval(() => {
      this.checkForUpdate()
    }, time)

    ipc.on('checkForUpdate', (event, arg) => {
      this.checkForUpdate()
    })
  }

  checkForUpdate () {
    console.log('Checking for update...')

    request(this.updatePath, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const json = JSON.parse(body)

        if (json.version !== pkg.version) {
          console.log('Update available!')

          const binary = `katana-${json.version}-mac.zip`

          this.downloadPath += `v${json.version}/${binary}`

          this.options.showWindow()

          setTimeout(() => {
            dialog.showMessageBox(this.options.window, {
              title: 'Update Available',
              message: 'There is an update available, would you like to download it?',
              detail: 'Katana will restart automatically upon completion.',
              buttons: ['Yes', 'No']
            }, (response) => {
              if (response === 0) {
                console.log('Downloading update...')

                this.options.window.webContents.send('showLoader')

                this.downloadUpdate(() => {
                  console.log('Update complete, restarting app...')

                  const cmd = `kill -9 ${process.pid} && open -a ${this.app}`

                  childProcess.exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                      // handle error
                    }
                  })

                  electron.app.quit()
                })
              }
            })
          }, 1000)
        }
      } else {
        console.log('checkForUpdate() request error: ', error)

        dialog.showMessageBox({
          message: 'Unable to connect to update server'
        })
      }
    })
  }

  downloadUpdate (callback) {
    const target = path.join(config.paths.application, 'app.zip')
    const url = this.downloadPath
    const parent = this.parent

    if (fs.existsSync(target)) fs.unlinkSync(target)

    request(url).on('response', (response) => {
      response.pipe(fs.createWriteStream(target)).on('finish', () => {
        let app = (path.join(electron.app.getAppPath(), '../../../')).slice(0, -1)

        this.app = app

        if (parent.appPath.includes('electron')) {
          return (
            dialog.showMessageBox({
              title: 'Debug',
              message: 'Updating is disabled while running in development.'
            })
          )
        }

        const file = path.join(config.paths.application, 'app.zip')

        process.noAsar = true

        decompress(file, config.paths.application).then(() => {
          process.noAsar = false

          const icon = path.join(__dirname, '../../app/static/images/icon.icns')

          sudo.exec(`rm -rf ${app} && mv -f ~/.katana/Katana.app ${app}`, { name: 'Katana', icns: icon }, (error, stdout, stderr) => {
            if (error || stderr) {
              return (
                dialog.showMessageBox({
                  title: 'Error',
                  message: error.toString()
                })
              )
            }

            callback()
          })
        })
      })
    })
  }
}
