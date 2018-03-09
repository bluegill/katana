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
      this.checkForUpdate(true)
    })

    ipc.on('downloadUpdate', (event, arg) => {
      console.log('Downloading update...')

      this.downloadUpdate(() => {
        console.log('Update complete, restarting app...')

        const icon = path.join(__dirname, '../../app/static/images/icon.icns')

        dialog.showMessageBox({
          title: 'Update Complete',
          message: 'Update complete, Katana will now restart.',
          icon: icon
        })

        const cmd = 'kill -9 ' + process.pid + ' && open -a ' + this.appPath

        childProcess.exec(cmd, (error, stdout, stderr) => {
          if (error) {
            // handle error
          }
        })

        electron.app.quit()
      })
    })
  }

  checkForUpdate (prompt) {
    console.log('Checking for update...')

    request(this.updatePath, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const json = JSON.parse(body)

        if (json.version !== pkg.version) {
          console.log('Update available!')

          const binary = `katana-${json.version}-mac.zip`

          this.downloadPath += `v${json.version}/${binary}`

          this.options.showWindow(true)
          this.options.window.webContents.send('showUpdate')
        } else {
          console.log('No update available')

          if (prompt) {
            const icon = path.join(__dirname, '../../app/static/images/icon.icns')

            dialog.showMessageBox(this.options.win, {
              message: 'There are currently no updates available.',
              icon: icon
            })
          }
        }
      } else {
        console.log('checkForUpdate() request error: ', error)

        if (prompt) {
          const icon = path.join(__dirname, '../../app/static/images/icon.icns')

          dialog.showMessageBox(this.options.win, {
            message: 'Unable to connect to update server',
            icon: icon
          })
        }
      }
    })
  }

  downloadUpdate (callback) {
    const target = config.paths.application + '/app.zip'
    const url = this.downloadPath
    const parent = this.parent

    if (fs.existsSync(target)) fs.unlinkSync(target)

    request(url).on('response', (response) => {
      response.pipe(fs.createWriteStream(target)).on('finish', () => {
        const cmd = 'unzip -o ~/.katana/app.zip -d ~/.katana'
        const icon = path.join(__dirname, '../../app/static/images/icon.icns')

        let app = (path.join(electron.app.getAppPath(), '../../../')).slice(0, -1)

        if (parent.appPath.includes('electron')) {
          return (
            dialog.showMessageBox({
              title: 'Debug',
              message: 'Updating is disabled while running in development.',
              icon: icon
            })
          )
        }

        childProcess.exec(cmd, () => {
          const opt = { name: 'Katana', icns: icon }

          sudo.exec(`rm -rf ${app} && mv -f ~/.katana/Katana.app ${app}`, opt, (error, stdout, stderr) => {
            if (error || stderr) {
              return (
                dialog.showMessageBox({
                  title: 'Error',
                  message: error.toString(),
                  icon: icon
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
