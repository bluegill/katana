const childProcess = require('child_process')

const fs = require('fs')

const config = require('../config')
const utils = require('./utils')

const { clipboard } = require('electron')

module.exports = class {
  constructor(parent) {
    this.parent = parent
    this.options = parent.preferencesModule
    this.directory = config.paths.uploads

    if (this.options.getOption('uploadPath')) {
      this.directory = this.options.getOption('uploadPath')
    }
  }

  captureFull() {

  }

  captureWindow() {

  }

  captureSelection() {
    this.execute(this.directory, (file, error) => {
      this.upload(file, (result, error) => {
        if (!error) {
          console.log(result)

          this.parent.historyModule.addScreenshot(result)
          this.parent.showNotification('Screenshot has been uploaded and copied to your clipboard.', 'Screenshot Uploaded', result.link)
        } else {
          console.log(error)

          this.parent.showNotification('Screenshot failed to upload.', 'Upload Error')
        }
      })
    })
  }

  upload(file, callback, tray) {
    try {
      fs.statSync(file)

      this.parent.setIcon('active')

      const defaultServices = config.defaults.services
      const services = this.options.getOption('services')

      let service = defaultServices.uploadService
      let serviceModule

      if (services && services.uploadService) {
        service = services.uploadService
      }

      if (service.substr(0, 4) === 'pomf') {
        service = service.split(':')[1]
        service = config.services['pomf'][service]

        if (service) {
          serviceModule = require('./services/pomf')
          serviceModule.setPath(service.uploadPath, service.resultPath)

          if (service.token) {
            serviceModule.setToken(service.token)
          }
        }
      } else {
        serviceModule = require(`./services/${service}.js`)
      }

      serviceModule.upload(file, (result, error) => {
        if (!error) {
          if (this.options.getOption('deleteOnUpload') && !tray) {
            fs.unlink(file, (error) => {
              if (error) {
                callback(null, error)
              }
            })
          }

          if (result.link) {
            clipboard.writeText(result.link)
          }

          callback(result, false)

          this.parent.setIcon('default')

          console.log('Upload successful!')
        } else {
          callback(null, error)

          this.parent.setIcon('default')
        }
      })
    } catch (error) {
      callback(null, error)

      this.parent.setIcon('default')
    }
  }

  execute(dir, callback) {
    const name = utils.getTimestamp()
    const output = `${dir}/${name}.png`
    const command = `screencapture -i -x ${output}`

    console.log('Capturing selection...')

    childProcess.exec(command, (error, stdout, stderr) => {
      if (!error) {
        console.log('Selection captured!')
        return callback(output)
      }
      console.log('Error while capturing!')
      return callback(null, true)
    })
  }
}