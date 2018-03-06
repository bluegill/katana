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

const {clipboard} = require('electron')

module.exports = class {
  constructor (parent) {
    this.parent = parent
    this.options = parent.preferencesModule
  }

  shorten () {
    const clipboardContent = clipboard.readText()

    this.parent.setIcon('active')

    if (utils.validateUrl(clipboardContent)) {
      const defaultServices = config.defaults.services
      const services = this.options.getOption('services')

      let service = defaultServices.shortenerService
      let serviceModule

      if (services && services.shortenerService) {
        service = services.shortenerService
      }

      if (config.services.shorteners.includes(service)) {
        serviceModule = require(`./services/shorteners/${service}.js`)
        serviceModule.shorten(clipboardContent, (result, error) => {
          if (!error) {
            if (result.link) {
              clipboard.writeText(result.link)
              this.parent.showNotification('URL has been shortened and copied to your clipboard', result.link)
              console.log('URL has been successfully shortened.')
            }

            this.parent.setIcon('default')
          } else {
            this.parent.showNotification('Error while trying to shorten that URL')
            this.parent.setIcon('default')
          }
        })
      }
    }
  }
}
