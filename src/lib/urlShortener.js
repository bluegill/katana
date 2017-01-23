const childProcess = require('child_process');

const request  = require('request'),
      path     = require('path'),
      fs       = require('fs');

const config   = require('../config');
const utils    = require('./utils');

const {clipboard}  = require('electron');

class urlShortener {
  constructor(parent){
    this.parent  = parent;
    this.options = parent.optionsModule;
  }

  shorten(){
    const clipboardContent = clipboard.readText();

    if(utils.validateUrl(clipboardContent)){
      const defaultServices = config.defaults.services;
      const services        = this.options.getOption('services');

      let service = defaultServices.shortenUrl;
      let serviceModule;

      if(services.shortenUrl){
        service = services.shortenUrl;
      }

      if(config.services.shorteners.includes(service)){
        serviceModule = require(`./services/shorteners/${service}.js`);
        serviceModule.shorten(clipboardContent, (result, error) => {
          if(!error){
            if(result.link){
              clipboard.writeText(result.link);
              this.parent.showNotification('URL has been shortened and copied to your clipboard!', 'URL Shortened', result.link);
            }
          } else {
            this.parent.showNotification('Unable to shorten selected URL!', 'Error');
          }
        });;
      }
    }
  }
}

module.exports = urlShortener;